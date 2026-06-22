import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Inbox } from 'lucide-react'
import MetricsCards from '@/components/admin/MetricsCards'
import ModerationTable from '@/components/admin/ModerationTable'
import BulkActions from '@/components/admin/BulkActions'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
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

export default function AdminDashboard() {
  const { metrics, allAnswers, loading, fetchMetrics, fetchAllAnswers, bulkVerify, bulkDelete, bulkMarkSpam } = useAdmin()
  const { verifyAnswer, rejectAnswer, markSpam, deleteAnswer } = useAnswers()
  const { showToast } = useToast()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const [adminNoteModal, setAdminNoteModal] = useState({ open: false, answerId: null, action: null })
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    fetchMetrics()
    fetchAllAnswers(activeFilter)
  }, [fetchMetrics, fetchAllAnswers, activeFilter])

  const handleRefresh = () => {
    fetchMetrics()
    fetchAllAnswers(activeFilter)
    setSelectedIds([])
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
