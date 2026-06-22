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

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return []
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select(`
          *,
          user_badges (
            id,
            badge_id,
            earned_at,
            badges (
              id,
              badge_name,
              badge_type,
              description,
              icon
            )
          )
        `)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      return data || []
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  const fetchAvailableBadges = useCallback(async () => {
    if (!isAdmin) return []
    try {
      const { data, error: fetchError } = await supabase
        .from('badges')
        .select('*')
        .order('badge_type', { ascending: true })

      if (fetchError) throw fetchError
      return data || []
    } catch (err) {
      console.error('Error fetching available badges:', err)
      return []
    }
  }, [isAdmin])

  const fetchReputationLogs = useCallback(async () => {
    if (!isAdmin) return []
    try {
      const { data, error: fetchError } = await supabase
        .from('reputation_logs')
        .select(`
          *,
          users:user_id (id, name, email, avatar)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (fetchError) throw fetchError
      return data || []
    } catch (err) {
      console.error('Error fetching reputation logs:', err)
      return []
    }
  }, [isAdmin])

  const adjustUserReputation = useCallback(async (userId, points) => {
    if (!isAdmin) throw new Error('Admin only')
    try {
      const refId = crypto.randomUUID()
      const { data, error: insertError } = await supabase
        .from('reputation_logs')
        .insert({
          user_id: userId,
          action_type: 'admin_adjustment',
          points_awarded: points,
          reference_id: refId
        })
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      console.error('Error adjusting user reputation:', err)
      throw err
    }
  }, [isAdmin])

  const awardUserBadge = useCallback(async (userId, badgeId) => {
    if (!isAdmin) throw new Error('Admin only')
    try {
      const { data, error: insertError } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId
        })
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      console.error('Error awarding badge:', err)
      throw err
    }
  }, [isAdmin])

  const revokeUserBadge = useCallback(async (userId, badgeId) => {
    if (!isAdmin) throw new Error('Admin only')
    try {
      const { error: deleteError } = await supabase
        .from('user_badges')
        .delete()
        .eq('user_id', userId)
        .eq('badge_id', badgeId)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      console.error('Error revoking badge:', err)
      throw err
    }
  }, [isAdmin])

  const fetchGamificationAnalytics = useCallback(async () => {
    if (!isAdmin) return null
    try {
      const [totalRepRes, totalBadgesRes, topUserRes] = await Promise.all([
        supabase.from('users').select('reputation_points'),
        supabase.from('user_badges').select('id', { count: 'exact', head: true }),
        supabase.from('users')
          .select('id, name, email, avatar, reputation_points')
          .order('reputation_points', { ascending: false })
          .limit(1)
          .maybeSingle()
      ])

      const totalRep = (totalRepRes.data || []).reduce((sum, u) => sum + (u.reputation_points || 0), 0)
      const totalBadges = totalBadgesRes.count || 0
      const topContributor = topUserRes.data || null

      return {
        totalReputationPoints: totalRep,
        totalEarnedBadges: totalBadges,
        topContributor
      }
    } catch (err) {
      console.error('Error fetching gamification analytics:', err)
      return {
        totalReputationPoints: 0,
        totalEarnedBadges: 0,
        topContributor: null
      }
    }
  }, [isAdmin])

  return {
    metrics,
    allAnswers,
    loading,
    error,
    fetchMetrics,
    fetchAllAnswers,
    bulkVerify,
    bulkDelete,
    bulkMarkSpam,
    adminDeleteQuestion,
    bulkDeleteQuestions,
    fetchUsers,
    fetchAvailableBadges,
    fetchReputationLogs,
    adjustUserReputation,
    awardUserBadge,
    revokeUserBadge,
    fetchGamificationAnalytics
  }
}
