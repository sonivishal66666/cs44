import { useState, useCallback } from 'react'
import { supabase } from '@/config/supabase'
import { useAuth } from './useAuth'

export function useAdmin() {
  const [metrics, setMetrics] = useState({
    pendingReviews: 0,
    verifiedAnswers: 0,
    flaggedContent: 0,
    spamRemoved: 0,
    totalQuestions: 0,
  })
  const [allAnswers, setAllAnswers] = useState([])
  const [allQuestions, setAllQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { isAdmin } = useAuth()

  const fetchMetrics = useCallback(async () => {
    if (!isAdmin) return
    try {
      const [pending, verified, rejected, spam, questions] = await Promise.all([
        supabase.from('answers').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('answers').select('id', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('answers').select('id', { count: 'exact', head: true }).eq('verification_status', 'rejected'),
        supabase.from('answers').select('id', { count: 'exact', head: true }).eq('verification_status', 'spam'),
        supabase.from('questions').select('id', { count: 'exact', head: true }),
      ])

      setMetrics({
        pendingReviews: pending.count || 0,
        verifiedAnswers: verified.count || 0,
        flaggedContent: rejected.count || 0,
        spamRemoved: spam.count || 0,
        totalQuestions: questions.count || 0,
      })
    } catch (err) {
      console.error('Error fetching metrics:', err)
    }
  }, [isAdmin])

  const fetchAllAnswers = useCallback(async (filter = 'all') => {
    if (!isAdmin) return
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('answers')
        .select(`
          *,
          users:user_id (id, name, email, avatar),
          questions:question_id (id, title, category)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('verification_status', filter)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      setAllAnswers(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  const fetchAllQuestions = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('questions')
        .select(`
          *,
          users:user_id (id, name, email, avatar),
          answers:answers (id)
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const enriched = (data || []).map(q => ({
        ...q,
        answer_count: (q.answers || []).length
      }))

      setAllQuestions(enriched)
      return enriched
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  const bulkVerify = useCallback(async (ids) => {
    if (!isAdmin) throw new Error('Admin only')
    try {
      const { error: updateError } = await supabase
        .from('answers')
        .update({ verification_status: 'verified' })
        .in('id', ids)

      if (updateError) throw updateError

      // Create notifications
      const answersToNotify = allAnswers.filter(a => ids.includes(a.id))
      const notifications = answersToNotify.map(a => ({
        user_id: a.user_id,
        message: 'Your answer has been verified!',
      }))

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications)
      }

      setAllAnswers(prev =>
        prev.map(a => ids.includes(a.id) ? { ...a, verification_status: 'verified' } : a)
      )
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [isAdmin, allAnswers])

  const bulkDelete = useCallback(async (ids) => {
    if (!isAdmin) throw new Error('Admin only')
    try {
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .in('id', ids)

      if (deleteError) throw deleteError
      setAllAnswers(prev => prev.filter(a => !ids.includes(a.id)))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [isAdmin])

  const bulkMarkSpam = useCallback(async (ids) => {
    if (!isAdmin) throw new Error('Admin only')
    try {
      const { error: updateError } = await supabase
        .from('answers')
        .update({ verification_status: 'spam' })
        .in('id', ids)

      if (updateError) throw updateError
      setAllAnswers(prev =>
        prev.map(a => ids.includes(a.id) ? { ...a, verification_status: 'spam' } : a)
      )
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [isAdmin])

  const adminDeleteQuestion = useCallback(async (id) => {
    if (!isAdmin) throw new Error('Admin only')
    try {
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setAllQuestions(prev => prev.filter(q => q.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [isAdmin])

  const bulkDeleteQuestions = useCallback(async (ids) => {
    if (!isAdmin) throw new Error('Admin only')
    try {
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .in('id', ids)

      if (deleteError) throw deleteError
      setAllQuestions(prev => prev.filter(q => !ids.includes(q.id)))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [isAdmin])

  return {
    metrics,
    allAnswers,
    allQuestions,
    loading,
    error,
    fetchMetrics,
    fetchAllAnswers,
    fetchAllQuestions,
    bulkVerify,
    bulkDelete,
    bulkMarkSpam,
    adminDeleteQuestion,
    bulkDeleteQuestions,
  }
}
