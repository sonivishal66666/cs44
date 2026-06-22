import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Inbox } from 'lucide-react'
import { Shield, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Inbox, MessageCircle, HelpCircle, Trash2, Search, Eye, Trophy, Award, Coins, TrendingUp, User } from 'lucide-react'

import MetricsCards from '@/components/admin/MetricsCards'
import ModerationTable from '@/components/admin/ModerationTable'
import BulkActions from '@/components/admin/BulkActions'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useAdmin } from '@/hooks/useAdmin'
import { useAnswers } from '@/hooks/useAnswers'
import { useToast } from '@/components/ui/Toast'
import { badgeIcons } from '@/components/ui/BadgeUnlockModal'

const filterTabs = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'verified', label: 'Verified', icon: CheckCircle },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
  { id: 'spam', label: 'Spam', icon: AlertTriangle },
]

export default function AdminDashboard() {
  const { metrics, allAnswers, loading, fetchMetrics, fetchAllAnswers, bulkVerify, bulkDelete, bulkMarkSpam } = useAdmin()
  const { verifyAnswer, rejectAnswer, markSpam, deleteAnswer } = useAnswers()
  const { showToast } = useToast()
function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const badgeTierColors = {
  bronze: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  silver: 'bg-slate-400/10 text-slate-600 dark:text-slate-400 border-slate-400/20',
  gold: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-450 border-yellow-500/20',
  diamond: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  special: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
}

function formatActionType(action) {
  switch (action) {
    case 'ask_question': return 'Asked a Question'
    case 'post_answer': return 'Posted an Answer'
    case 'question_upvote': return 'Received Question Upvote'
    case 'question_downvote': return 'Received Question Downvote'
    case 'answer_upvote': return 'Received Answer Upvote'
    case 'answer_downvote': return 'Received Answer Downvote'
    case 'answer_accepted': return 'Answer Accepted'
    case 'daily_login': return 'Daily Login Bonus'
    case 'admin_adjustment': return 'Admin Adjustment'
    default: return action.replace('_', ' ')
  }
}

export default function AdminDashboard() {
  const { 
    metrics, 
    allAnswers, 
    allQuestions, 
    loading, 
    fetchMetrics, 
    fetchAllAnswers, 
    fetchAllQuestions, 
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
  } = useAdmin()
  const { verifyAnswer, rejectAnswer, markSpam, deleteAnswer } = useAnswers()
  const { showToast } = useToast()
  
  const [activeSection, setActiveSection] = useState('answers') // 'answers', 'questions', or 'gamification'
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const [adminNoteModal, setAdminNoteModal] = useState({ open: false, answerId: null, action: null })
  const [adminNote, setAdminNote] = useState('')

  // Gamification States
  const [users, setUsers] = useState([])
  const [availableBadges, setAvailableBadges] = useState([])
  const [reputationLogs, setReputationLogs] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [userSearch, setUserSearch] = useState('')
  const [loadingGamification, setLoadingGamification] = useState(false)
  const [reputationModal, setReputationModal] = useState({ open: false, userId: null, username: '', points: '' })
  const [badgeModal, setBadgeModal] = useState({ open: false, userId: null, username: '', userBadges: [] })

  const loadGamificationData = useCallback(async () => {
    setLoadingGamification(true)
    try {
      const [usersList, badgesList, logsList, stats] = await Promise.all([
        fetchUsers(),
        fetchAvailableBadges(),
        fetchReputationLogs(),
        fetchGamificationAnalytics()
      ])
      setUsers(usersList)
      setAvailableBadges(badgesList)
      setReputationLogs(logsList)
      setAnalytics(stats)
    } catch (err) {
      console.error('Error loading gamification data:', err)
      showToast('Failed to load gamification data', 'error')
    } finally {
      setLoadingGamification(false)
    }
  }, [fetchUsers, fetchAvailableBadges, fetchReputationLogs, fetchGamificationAnalytics, showToast])

  useEffect(() => {
    fetchMetrics()
    fetchAllAnswers(activeFilter)
  }, [fetchMetrics, fetchAllAnswers, activeFilter])

  const handleRefresh = () => {
    fetchMetrics()
    fetchAllAnswers(activeFilter)
    setSelectedIds([])
    if (activeSection === 'answers') {
      fetchAllAnswers(activeFilter)
    } else if (activeSection === 'questions') {
      fetchAllQuestions()
    } else if (activeSection === 'gamification') {
      const timer = setTimeout(() => {
        loadGamificationData()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [fetchMetrics, fetchAllAnswers, fetchAllQuestions, loadGamificationData, activeFilter, activeSection])

  const handleRefresh = () => {
    fetchMetrics()
    if (activeSection === 'answers') {
      fetchAllAnswers(activeFilter)
      setSelectedIds([])
    } else if (activeSection === 'questions') {
      fetchAllQuestions()
      setSelectedQuestionIds([])
    } else if (activeSection === 'gamification') {
      loadGamificationData()
    }
  }

  const handleVerify = useCallback((answerId) => {
    setAdminNoteModal({ open: true, answerId, action: 'verify' })
  }, [])

  const handleReject = useCallback((answerId) => {
    setAdminNoteModal({ open: true, answerId, action: 'reject' })
  }, [])

  const handleNoteSubmit = async () => {
    try {
      if (adminNoteModal.action === 'verify') {
        await verifyAnswer(adminNoteModal.answerId, adminNote)
        showToast('Answer verified!', 'success')
      } else if (adminNoteModal.action === 'reject') {
        await rejectAnswer(adminNoteModal.answerId, adminNote)
        showToast('Answer rejected', 'info')
      }
      setAdminNoteModal({ open: false, answerId: null, action: null })
      setAdminNote('')
      handleRefresh()
    } catch (err) {
      console.error(err)
      showToast(`Failed to ${adminNoteModal.action}`, 'error')
    }
  }

  const handleSpam = async (answerId) => {
    try {
      await markSpam(answerId)
      showToast('Marked as spam', 'info')
      handleRefresh()
    } catch (err) {
      console.error(err)
      showToast('Failed to mark spam', 'error')
    }
  }

  const handleDelete = async (answerId) => {
    try {
      await deleteAnswer(answerId)
      showToast('Answer deleted', 'info')
      handleRefresh()
    } catch (err) {
      console.error(err)
      showToast('Failed to delete', 'error')
    }
  }

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Are you sure you want to delete this question? This will also delete all associated answers.")) {
      try {
        await adminDeleteQuestion(id)
        showToast('Question deleted', 'info')
        handleRefresh()
      } catch (err) {
        console.error(err)
        showToast('Failed to delete question', 'error')
      }
    }
  }

  const handleAdjustReputation = async () => {
    try {
      const pts = parseInt(reputationModal.points, 10)
      if (isNaN(pts) || pts === 0) {
        showToast('Please enter a valid non-zero points adjustment', 'warning')
        return
      }
      await adjustUserReputation(reputationModal.userId, pts)
      showToast(`Reputation adjusted by ${pts > 0 ? '+' : ''}${pts} points!`, 'success')
      setReputationModal({ open: false, userId: null, username: '', points: '' })
      loadGamificationData()
    } catch (err) {
      console.error(err)
      showToast('Failed to adjust reputation points', 'error')
    }
  }

  const handleToggleBadge = async (badgeId, isEarned) => {
    try {
      if (isEarned) {
        await revokeUserBadge(badgeModal.userId, badgeId)
        showToast('Badge revoked successfully', 'info')
      } else {
        await awardUserBadge(badgeModal.userId, badgeId)
        showToast('Badge awarded successfully!', 'success')
      }
      // Refresh user's badges in modal list
      const updatedUsers = await fetchUsers()
      setUsers(updatedUsers)
      const currentUser = updatedUsers.find(u => u.id === badgeModal.userId)
      if (currentUser) {
        setBadgeModal(prev => ({
          ...prev,
          userBadges: currentUser.user_badges || []
        }))
      }
      // Update analytics
      const stats = await fetchGamificationAnalytics()
      setAnalytics(stats)
    } catch (err) {
      console.error(err)
      showToast('Failed to modify user badges', 'error')
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === allAnswers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(allAnswers.map(a => a.id))
    }
  }

  const handleBulkVerify = async () => {
    try {
      await bulkVerify(selectedIds)
      showToast(`${selectedIds.length} answers verified!`, 'success')
      setSelectedIds([])
      handleRefresh()
    } catch (err) {
      console.error(err)
      showToast('Bulk verify failed', 'error')
    }
  }

  const handleBulkDelete = async () => {
    try {
      await bulkDelete(selectedIds)
      showToast(`${selectedIds.length} answers deleted`, 'info')
      setSelectedIds([])
      handleRefresh()
    } catch (err) {
      console.error(err)
      showToast('Bulk delete failed', 'error')
    }
  }

  const handleBulkSpam = async () => {
    try {
      await bulkMarkSpam(selectedIds)
      showToast(`${selectedIds.length} answers marked as spam`, 'info')
      setSelectedIds([])
      handleRefresh()
    } catch (err) {
      console.error(err)
      showToast('Bulk spam failed', 'error')
    }
  }

  const handleBulkDeleteQuestions = async () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedQuestionIds.length} selected questions? This will also delete all associated answers.`)) {
      try {
        await bulkDeleteQuestions(selectedQuestionIds)
        showToast(`${selectedQuestionIds.length} questions deleted`, 'info')
        setSelectedQuestionIds([])
        handleRefresh()
      } catch (err) {
        console.error(err)
        showToast('Bulk delete failed', 'error')
      }
    }
  }

  const filteredQuestions = allQuestions.filter(q => {
    const searchLower = questionSearch.toLowerCase()
    const titleMatch = q.title?.toLowerCase().includes(searchLower)
    const descMatch = q.description?.toLowerCase().includes(searchLower)
    const authorMatch = q.users?.name?.toLowerCase().includes(searchLower)
    const categoryMatch = q.category?.toLowerCase().includes(searchLower)
    return titleMatch || descMatch || authorMatch || categoryMatch
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Moderation Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Review and manage community content</p>
          </div>
        </div>
        <Button variant="ghost" icon={RefreshCw} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      {/* Metrics */}
      <div className="mb-8">
        <MetricsCards metrics={metrics} />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
        {filterTabs.map((tab) => {
          const Icon = tab.icon
          const count = tab.id === 'all' ? allAnswers.length :
            tab.id === 'pending' ? metrics.pendingReviews :
            tab.id === 'verified' ? metrics.verifiedAnswers :
            tab.id === 'rejected' ? metrics.flaggedContent :
            metrics.spamRemoved

          return (
            <button
              key={tab.id}
              onClick={() => { setActiveFilter(tab.id); setSelectedIds([]) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeFilter === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
      {/* Section Switcher Tab (Answers vs Questions vs Gamification) */}
      <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setActiveSection('answers'); setSelectedIds([]) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeSection === 'answers'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Answers Moderation
        </button>
        <button
          onClick={() => { setActiveSection('questions'); setSelectedQuestionIds([]) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeSection === 'questions'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Questions Management
        </button>
        <button
          onClick={() => { setActiveSection('gamification'); setSelectedIds([]); setSelectedQuestionIds([]) }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeSection === 'gamification'
              ? 'bg-white dark:bg-slate-700 text-indigo-650 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Gamification Management
        </button>
      </div>

      {activeSection === 'answers' ? (
        <>
          {/* Filter Tabs */}
          <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
            {filterTabs.map((tab) => {
              const Icon = tab.icon
              const count = tab.id === 'all' ? allAnswers.length :
                tab.id === 'pending' ? metrics.pendingReviews :
                tab.id === 'verified' ? metrics.verifiedAnswers :
                tab.id === 'rejected' ? metrics.flaggedContent :
                metrics.spamRemoved

              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveFilter(tab.id); setSelectedIds([]) }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeFilter === tab.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className="text-xs bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Bulk Actions */}
          <BulkActions
            selectedCount={selectedIds.length}
            onBulkVerify={handleBulkVerify}
            onBulkDelete={handleBulkDelete}
            onBulkSpam={handleBulkSpam}
          />

          {/* Moderation Table */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <ModerationTable
              answers={allAnswers}
              loading={loading}
              onVerify={handleVerify}
              onReject={handleReject}
              onSpam={handleSpam}
              onDelete={handleDelete}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onSelectAll={selectAll}
            />
          </div>
        </>
      ) : activeSection === 'questions' ? (
        <>
          {/* Question Bulk Actions */}
          {selectedQuestionIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 mb-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-2xl shadow-sm"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.length}
        onBulkVerify={handleBulkVerify}
        onBulkDelete={handleBulkDelete}
        onBulkSpam={handleBulkSpam}
      />

      {/* Moderation Table */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <ModerationTable
          answers={allAnswers}
          loading={loading}
          onVerify={handleVerify}
          onReject={handleReject}
          onSpam={handleSpam}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAll}
        />
      </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.length === filteredQuestions.length && filteredQuestions.length > 0}
                        onChange={() => {
                          if (selectedQuestionIds.length === filteredQuestions.length) {
                            setSelectedQuestionIds([])
                          } else {
                            setSelectedQuestionIds(filteredQuestions.map(q => q.id))
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Asked By</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stats</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading && allQuestions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400">
                        <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
                        <p className="text-sm">Loading questions...</p>
                      </td>
                    </tr>
                  ) : filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400">
                        <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-450" />
                        <p className="text-lg font-medium">No questions found</p>
                        <p className="text-sm mt-1">Try resetting search query.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map((q, index) => (
                      <motion.tr
                        key={q.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedQuestionIds.includes(q.id)}
                            onChange={() => {
                              setSelectedQuestionIds(prev =>
                                prev.includes(q.id) ? prev.filter(x => x !== q.id) : [...prev, q.id]
                              )
                            }}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/question/${q.id}`}
                            className="text-sm font-semibold text-indigo-650 hover:text-indigo-750 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors line-clamp-1 max-w-[280px]"
                          >
                            {q.title}
                          </Link>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-[280px] mt-0.5">{q.description}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
                            {q.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar src={q.users?.avatar} name={q.users?.name || 'User'} size="sm" />
                            <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[110px]">
                              {q.users?.name || 'Anonymous'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />{q.answer_count || 0} answers</span>
                            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{q.views || 0} views</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-400 whitespace-nowrap">
                          {timeAgo(q.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Gamification Management Tab */}
          {/* Leaderboard Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-900/20">
                  <Coins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {analytics?.totalReputationPoints?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Reputation Points</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-900/20">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {analytics?.totalEarnedBadges?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-slate-505 dark:text-slate-400 mt-1">Total Earned Badges</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-900/20">
                  <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              {analytics?.topContributor ? (
                <div className="flex items-center gap-3">
                  <Avatar src={analytics.topContributor.avatar} name={analytics.topContributor.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-850 dark:text-zinc-150 truncate max-w-[140px]">
                      {analytics.topContributor.name}
                    </p>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      {analytics.topContributor.reputation_points} reputation
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No contributors yet</p>
              )}
              <p className="text-sm text-slate-505 dark:text-slate-400 mt-1">Top Contributor</p>
            </motion.div>
          </div>

          {/* Gamification Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Users List */}
            <div className="lg:col-span-7 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Showing {users.filter(u => {
                    const searchLower = userSearch.toLowerCase()
                    return u.name?.toLowerCase().includes(searchLower) || u.email?.toLowerCase().includes(searchLower)
                  }).length} users
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Reputation</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Badges</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loadingGamification && users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-12 text-slate-400">
                          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
                          <p className="text-sm">Loading users...</p>
                        </td>
                      </tr>
                    ) : users.filter(u => {
                      const searchLower = userSearch.toLowerCase()
                      return u.name?.toLowerCase().includes(searchLower) || u.email?.toLowerCase().includes(searchLower)
                    }).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-12 text-slate-400">
                          <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
                          <p className="text-lg font-medium">No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.filter(u => {
                        const searchLower = userSearch.toLowerCase()
                        return u.name?.toLowerCase().includes(searchLower) || u.email?.toLowerCase().includes(searchLower)
                      }).map((u) => {
                        const rep = u.reputation_points || 0
                        let repBadgeLabel = 'New Member'
                        let repBadgeColor = 'text-slate-455'
                        if (rep >= 2000) {
                          repBadgeLabel = 'Elite Expert'
                          repBadgeColor = 'text-purple-500 dark:text-purple-400 font-bold'
                        } else if (rep >= 1000) {
                          repBadgeLabel = 'Community Champion'
                          repBadgeColor = 'text-indigo-500 dark:text-indigo-400 font-bold'
                        } else if (rep >= 500) {
                          repBadgeLabel = 'Expert Contributor'
                          repBadgeColor = 'text-yellow-650 dark:text-yellow-450 font-bold'
                        } else if (rep >= 100) {
                          repBadgeLabel = 'Knowledge Sharer'
                          repBadgeColor = 'text-slate-600 dark:text-slate-350 font-bold'
                        } else if (rep >= 10) {
                          repBadgeLabel = 'Beginner Contributor'
                          repBadgeColor = 'text-amber-600 dark:text-amber-500 font-bold'
                        }

                        return (
                          <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar src={u.avatar} name={u.name || 'User'} size="sm" />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[150px]">{u.name || 'Anonymous'}</p>
                                  <p className="text-xs text-slate-400 truncate max-w-[150px]">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{rep}</p>
                              <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${repBadgeColor}`}>{repBadgeLabel}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[180px]">
                                {u.user_badges && u.user_badges.length > 0 ? (
                                  u.user_badges.slice(0, 4).map((ub) => {
                                    const b = ub.badges
                                    if (!b) return null
                                    const Icon = badgeIcons[b.icon] || Award
                                    const tierColor = badgeTierColors[b.badge_type] || badgeTierColors.bronze
                                    return (
                                      <div
                                        key={ub.id}
                                        className={`p-1 rounded-lg border ${tierColor}`}
                                        title={`${b.badge_name}: ${b.description}`}
                                      >
                                        <Icon className="w-3.5 h-3.5" />
                                      </div>
                                    )
                                  })
                                ) : (
                                  <span className="text-xs text-slate-405">None</span>
                                )}
                                {u.user_badges && u.user_badges.length > 4 && (
                                  <span className="text-[10px] text-slate-405 font-bold self-center">
                                    +{u.user_badges.length - 4}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setReputationModal({ open: true, userId: u.id, username: u.name, points: '' })}
                                  className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
                                  title="Adjust Reputation"
                                >
                                  <Coins className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setBadgeModal({ open: true, userId: u.id, username: u.name, userBadges: u.user_badges || [] })}
                                  className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-colors cursor-pointer"
                                  title="Manage Badges"
                                >
                                  <Award className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Reputation History Logs */}
            <div className="lg:col-span-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-850 dark:text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Reputation Log Feed
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Most recent community transaction logs</p>
              </div>

              <div className="overflow-y-auto max-h-[500px]">
                {loadingGamification && reputationLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-50" />
                    <p className="text-xs">Loading logs...</p>
                  </div>
                ) : reputationLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    No reputation logs recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reputationLogs.map((log) => {
                      const isPositive = log.points_awarded >= 0
                      return (
                        <div key={log.id} className="p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/25 transition-colors flex items-start justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar src={log.users?.avatar} name={log.users?.name || 'User'} size="xs" />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-850 dark:text-zinc-150 truncate max-w-[130px]">
                                {log.users?.name || 'Anonymous'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {formatActionType(log.action_type)}
                              </p>
                              <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate max-w-[130px]" title={log.reference_id}>
                                Ref: {log.reference_id}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`font-black shrink-0 px-2 py-0.5 rounded text-[10px] border ${
                              isPositive 
                                ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/15' 
                                : 'text-rose-500 bg-rose-500/10 border-rose-500/15'
                            }`}>
                              {isPositive ? `+${log.points_awarded}` : log.points_awarded}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(log.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Admin Note Modal */}
      <Modal
        isOpen={adminNoteModal.open}
        onClose={() => { setAdminNoteModal({ open: false, answerId: null, action: null }); setAdminNote('') }}
        title={adminNoteModal.action === 'verify' ? 'Verify Answer' : 'Reject Answer'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Admin Note (optional)
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={adminNoteModal.action === 'verify' ? 'Great answer!' : 'Reason for rejection...'}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => { setAdminNoteModal({ open: false, answerId: null, action: null }); setAdminNote('') }}
            >
              Cancel
            </Button>
            <Button
              variant={adminNoteModal.action === 'verify' ? 'primary' : 'danger'}
              onClick={handleNoteSubmit}
            >
              {adminNoteModal.action === 'verify' ? 'Verify' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reputation Points Adjustment Modal */}
      <Modal
        isOpen={reputationModal.open}
        onClose={() => setReputationModal({ open: false, userId: null, username: '', points: '' })}
        title={`Adjust Reputation: ${reputationModal.username}`}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Adjustment Amount
            </label>
            <input
              type="number"
              value={reputationModal.points}
              onChange={(e) => setReputationModal(prev => ({ ...prev, points: e.target.value }))}
              placeholder="e.g. 10 or -5"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-450 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300"
            />
            <p className="text-xs text-slate-400 mt-1.5 leading-normal">
              Enter a positive number to award reputation points, or a negative number to deduct.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setReputationModal({ open: false, userId: null, username: '', points: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAdjustReputation}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Badge Management Modal */}
      <Modal
        isOpen={badgeModal.open}
        onClose={() => setBadgeModal({ open: false, userId: null, username: '', userBadges: [] })}
        title={`Manage Badges: ${badgeModal.username}`}
        size="md"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {availableBadges.length === 0 ? (
            <p className="text-center py-6 text-slate-400 text-sm">No badges available.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {availableBadges.map((badge) => {
                const isEarned = badgeModal.userBadges.some(ub => ub.badge_id === badge.id)
                const Icon = badgeIcons[badge.icon] || Award
                const tierColor = badgeTierColors[badge.badge_type] || badgeTierColors.bronze
                
                return (
                  <div key={badge.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${tierColor} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{badge.badge_name}</p>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${tierColor}`}>
                            {badge.badge_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-450 mt-0.5 leading-relaxed">{badge.description}</p>
                      </div>
                    </div>
                    <div>
                      {isEarned ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleToggleBadge(badge.id, true)}
                        >
                          Revoke
                        </Button>
                      ) : (
                        <button
                          onClick={() => handleToggleBadge(badge.id, false)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-95"
                        >
                          Award
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  )
}
