import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Inbox, MessageCircle, HelpCircle, Trash2, Search, Eye } from 'lucide-react'
import MetricsCards from '@/components/admin/MetricsCards'
import ModerationTable from '@/components/admin/ModerationTable'
import BulkActions from '@/components/admin/BulkActions'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { useAdmin } from '@/hooks/useAdmin'
import { useAnswers } from '@/hooks/useAnswers'
import { useToast } from '@/components/ui/Toast'

const filterTabs = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'verified', label: 'Verified', icon: CheckCircle },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
  { id: 'spam', label: 'Spam', icon: AlertTriangle },
]

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
    bulkDeleteQuestions 
  } = useAdmin()
  const { verifyAnswer, rejectAnswer, markSpam, deleteAnswer } = useAnswers()
  const { showToast } = useToast()
  
  const [activeSection, setActiveSection] = useState('answers') // 'answers' or 'questions'
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([])
  const [questionSearch, setQuestionSearch] = useState('')
  const [adminNoteModal, setAdminNoteModal] = useState({ open: false, answerId: null, action: null })
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    fetchMetrics()
    if (activeSection === 'answers') {
      fetchAllAnswers(activeFilter)
    } else {
      fetchAllQuestions()
    }
  }, [fetchMetrics, fetchAllAnswers, fetchAllQuestions, activeFilter, activeSection])

  const handleRefresh = () => {
    fetchMetrics()
    if (activeSection === 'answers') {
      fetchAllAnswers(activeFilter)
      setSelectedIds([])
    } else {
      fetchAllQuestions()
      setSelectedQuestionIds([])
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
      showToast(`Failed to ${adminNoteModal.action}`, 'error')
    }
  }

  const handleSpam = async (answerId) => {
    try {
      await markSpam(answerId)
      showToast('Marked as spam', 'info')
      handleRefresh()
    } catch (err) {
      showToast('Failed to mark spam', 'error')
    }
  }

  const handleDelete = async (answerId) => {
    try {
      await deleteAnswer(answerId)
      showToast('Answer deleted', 'info')
      handleRefresh()
    } catch (err) {
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
        showToast('Failed to delete question', 'error')
      }
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

      {/* Section Switcher Tab (Answers vs Questions) */}
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
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
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
      ) : (
        <>
          {/* Question Bulk Actions */}
          {selectedQuestionIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 mb-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm text-red-650 dark:text-red-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                {selectedQuestionIds.length} question{selectedQuestionIds.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={handleBulkDeleteQuestions}
                >
                  Delete Selected
                </Button>
              </div>
            </motion.div>
          )}

          {/* Questions Table */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions by title, author, or category..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300"
                />
              </div>
              <div className="text-xs text-slate-400 font-medium self-end sm:self-center">
                Showing {filteredQuestions.length} of {allQuestions.length} questions
              </div>
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
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors line-clamp-1 max-w-[280px]"
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
    </motion.div>
  )
}
