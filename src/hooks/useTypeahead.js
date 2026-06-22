import { useState, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'
import { supabase } from '@/config/supabase'

const LOCAL_INDEX_KEY = 'cs44:typeahead:index'

const defaultOptions = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'tags', weight: 0.2 },
  ],
  threshold: 0.45,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
}

export default function useTypeahead({
  minChars = 2,
  debounceMs = 250,
  localMax = 7,
  acceptScore = 0.45,
  persist = true,
} = {}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loadingServer, setLoadingServer] = useState(false)
  const [indexLoaded, setIndexLoaded] = useState(false)

  const indexRef = useRef([])
  const fuseRef = useRef(null)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)
  const cacheRef = useRef(new Map()) // simple in-memory cache for server queries

  const buildFuse = useCallback(() => {
    fuseRef.current = new Fuse(indexRef.current, defaultOptions)
  }, [])

  async function preloadIndex() {
    if (indexLoaded) return
    // try localStorage first
    if (persist) {
      try {
        const raw = localStorage.getItem(LOCAL_INDEX_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            indexRef.current = parsed
            buildFuse()
            setIndexLoaded(true)
            return
          }
        }
      } catch (err) {
        console.warn('Failed reading typeahead index from storage', err)
      }
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id, title, tags')
        .eq('status', 'active')

      if (error) throw error

      const minimal = (data || []).map(q => ({ id: q.id, title: q.title || '', tags: q.tags || [] }))
      indexRef.current = minimal
      buildFuse()
      setIndexLoaded(true)

      if (persist) {
        try {
          localStorage.setItem(LOCAL_INDEX_KEY, JSON.stringify(minimal))
        } catch (_) {
          // ignore storage errors
        }
      }
    } catch (err) {
      console.error('Failed to preload typeahead index', err)
    }
  }

  useEffect(() => {
    // lazy preload on mount in background
    // Suppress set-state-in-effect warning: this preload intentionally sets state after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    preloadIndex()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!query || query.length < minChars) {
      setResults([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const q = query.trim()
      // local search
      let localItems = []
      if (fuseRef.current) {
        const local = fuseRef.current.search(q, { limit: localMax })
        localItems = local.map(r => ({ ...r.item, _score: r.score, _matches: r.matches || [] }))
      }

      const bestScore = localItems[0]?._score ?? 1
      if (localItems.length >= 1 && bestScore <= acceptScore) {
        setResults(localItems)
        // fire an optional background server fetch to warm cache
        doServerFetch(q, false).catch(() => {})
      } else {
        // show local if present, then fallback to server
        setResults(localItems)
        await doServerFetch(q, true)
      }
    }, debounceMs)

    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])
  async function doServerFetch(q, replaceVisible = true) {
    if (!q) return
    if (cacheRef.current.has(q)) {
      const cached = cacheRef.current.get(q)
      if (replaceVisible) setResults(dedupeMerge(results, cached))
      return
    }

    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setLoadingServer(true)

    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          users:user_id (id, name, email, avatar),
          answers:answers (id, verification_status)
        `)
        .ilike('title', `%${q}%`)
        .eq('status', 'active')

      if (error) throw error

      const enriched = (data || []).map(q => ({
        ...q,
        verified_answer_count: (q.answers || []).filter(a => a.verification_status === 'verified').length,
        answer_count: (q.answers || []).length,
      }))

      cacheRef.current.set(q, enriched)
      if (replaceVisible) {
        const merged = dedupeMerge(results, enriched)
        setResults(merged)
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Typeahead server fetch failed', err)
    } finally {
      setLoadingServer(false)
    }
  }

  function dedupeMerge(local, server) {
    const map = new Map()
    ;(local || []).forEach(i => map.set(i.id, i))
    ;(server || []).forEach(i => map.set(i.id, i))
    return Array.from(map.values()).slice(0, localMax)
  }

  return {
    query,
    setQuery,
    results,
    loadingServer,
    preloadIndex,
    indexLoaded,
  }
}
