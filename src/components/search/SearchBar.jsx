import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Command } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useTypeahead from '@/hooks/useTypeahead'

export default function SearchBar({ onSearch, variant = 'navbar' }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const navigate = useNavigate()
  const debounceRef = useRef(null)
  const { setQuery: setTaQuery, results, loadingServer } = useTypeahead()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur()
        setFocused(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setTaQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearch?.(value)
    }, 300)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const clearQuery = () => {
    setQuery('')
    setTaQuery('')
    onSearch?.('')
    inputRef.current?.focus()
  }

  const isNavbar = variant === 'navbar'

  return (
    <form onSubmit={handleSubmit} className={isNavbar ? 'relative' : 'relative w-full max-w-2xl mx-auto'}>
      <motion.div
        animate={{
          width: isNavbar && focused ? '320px' : isNavbar ? '260px' : '100%',
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative"
      >
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 ${isNavbar ? 'w-4 h-4' : 'w-5 h-5'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={isNavbar ? 'Search...' : 'Search questions, topics, tags...'}
          className={`
            w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
            text-slate-900 dark:text-white placeholder-slate-400
            focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800
            outline-none transition-all duration-300
            ${isNavbar
              ? 'pl-9 pr-20 py-2 text-sm rounded-full'
              : 'pl-12 pr-12 py-4 text-base rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50'
            }
          `}
        />
        {/* Suggestions dropdown */}
        {focused && (results.length > 0 || loadingServer) && (
          <ul
            id="typeahead-list"
            role="listbox"
            className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden max-h-72 overflow-auto"
          >
            {results.map((r, i) => (
              <li
                key={r.id}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={() => {
                  navigate(`/question/${r.id}`)
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer ${i === activeIndex ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
              >
                <div className="text-sm font-medium text-slate-800 dark:text-white truncate">{r.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{r.answer_count ? `${r.answer_count} answers` : ''}</div>
              </li>
            ))}
            {loadingServer && (
              <li className="px-4 py-3 text-sm text-slate-500">Searching online…</li>
            )}
          </ul>
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className={`text-slate-400 ${isNavbar ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
            </button>
          )}
          {isNavbar && !query && (
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] text-slate-400 font-mono">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          )}
        </div>
      </motion.div>
    </form>
  )
}
