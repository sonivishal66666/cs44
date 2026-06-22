import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronUp, Eye, Clock, Paperclip, ChevronRight, Home, Tag, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import FilePreview from '@/components/ui/FilePreview'
import AnswerList from '@/components/answers/AnswerList'
import AnswerForm from '@/components/answers/AnswerForm'
import { QuestionCardSkeleton } from '@/components/ui/Skeleton'
import { useQuestions } from '@/hooks/useQuestions'
import { useAnswers } from '@/hooks/useAnswers'
import { useUpvote } from '@/hooks/useUpvote'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'

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
  if (days < 30) return `${days}d ago`
  return new Date(dateString).toLocaleDateString()
}

export default function QuestionDetailPage() {
  const { id } = useParams()
  const { question, loading: qLoading, fetchQuestionById, deleteQuestion } = useQuestions()
  const { answers, loading: aLoading, fetchAnswers, verifyAnswer, rejectAnswer, markSpam, deleteAnswer } = useAnswers()
  const { toggleQuestionUpvote, hasUpvotedQuestion } = useUpvote()
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [upvoted, setUpvoted] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(0)

  const handleQuestionDelete = async () => {
    if (window.confirm("Are you sure you want to delete this question? This will also delete all associated answers.")) {
      try {
        await deleteQuestion(question.id)
        showToast('Question deleted successfully', 'info')
        navigate('/')
      } catch (err) {
        showToast('Failed to delete question', 'error')
      }
    }
  }

  useEffect(() => {
    if (id) {
      fetchQuestionById(id)
      fetchAnswers(id)
    }
  }, [id, fetchQuestionById, fetchAnswers])

  useEffect(() => {
    if (question) {
      setLocalUpvotes(question.upvotes || 0)
      if (user) {
        hasUpvotedQuestion(question.id).then(setUpvoted)
      }
    }
  }, [question, user, hasUpvotedQuestion])

  const handleUpvote = async () => {
    if (!user) {
      showToast('Please sign in to upvote', 'info')
      return
    }
    try {
      await toggleQuestionUpvote(question.id)
      setUpvoted(!upvoted)
      setLocalUpvotes(prev => upvoted ? prev - 1 : prev + 1)
    } catch (err) {
      showToast('Failed to upvote', 'error')
    }
  }

  const handleVerify = async (answerId) => {
    try {
      await verifyAnswer(answerId)
      showToast('Answer verified!', 'success')
      fetchAnswers(id)
    } catch (err) {
      showToast('Failed to verify', 'error')
    }
  }

  const handleReject = async (answerId) => {
    try {
      await rejectAnswer(answerId)
      showToast('Answer rejected', 'info')
      fetchAnswers(id)
    } catch (err) {
      showToast('Failed to reject', 'error')
    }
  }

  const handleSpam = async (answerId) => {
    try {
      await markSpam(answerId)
      showToast('Marked as spam', 'info')
      fetchAnswers(id)
    } catch (err) {
      showToast('Failed to mark spam', 'error')
    }
  }

  const handleDelete = async (answerId) => {
    try {
      await deleteAnswer(answerId)
      showToast('Answer deleted', 'info')
      fetchAnswers(id)
    } catch (err) {
      showToast('Failed to delete', 'error')
    }
  }

  const handleAnswerSubmitted = () => {
    fetchAnswers(id)
  }

  if (qLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <QuestionCardSkeleton />
        <QuestionCardSkeleton />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Question not found</h2>
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Go back home
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-500 dark:text-slate-400">{question.category}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{question.title}</span>
      </div>

      {/* Question Card */}
      <Card className="p-6 md:p-8 mb-8">
        <div className="flex gap-5">
          {/* Vote Column */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              onClick={handleUpvote}
              className={`p-2 rounded-xl transition-all duration-200 ${
                upvoted
                  ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <span className={`text-lg font-bold ${upvoted ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-400'}`}>
              {localUpvotes}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-4">
              {question.title}
            </h1>

            <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {question.description}
              </p>
            </div>

            {/* Attachment */}
            {question.attachment_url && (
              <div className="mb-6">
                <FilePreview url={question.attachment_url} />
              </div>
            )}

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-lg"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <Badge variant="category">{question.category}</Badge>
              <span className="flex items-center gap-1 text-sm text-slate-400">
                <Eye className="w-4 h-4" />
                {question.views} views
              </span>
              <span className="flex items-center gap-1 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                {timeAgo(question.created_at)}
              </span>
              {question.attachment_url && (
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <Paperclip className="w-4 h-4" />
                  Attachment
                </span>
              )}
              {(isAdmin || (user && user.id === question.user_id)) && (
                <button
                  onClick={handleQuestionDelete}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 dark:hover:text-red-450 transition-colors font-semibold cursor-pointer"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Question
                </button>
              )}
              <div className="ml-auto flex items-center gap-2">
                <Avatar
                  src={question.users?.avatar}
                  name={question.users?.name || 'User'}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {question.users?.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-slate-400">Asked {timeAgo(question.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Answers Section */}
      <div className="mb-8">
        <AnswerList
          answers={answers}
          loading={aLoading}
          isAdmin={isAdmin}
          userId={user?.id}
          onVerify={handleVerify}
          onReject={handleReject}
          onDelete={handleDelete}
          onSpam={handleSpam}
        />
      </div>

      {/* Answer Form */}
      <div className="mb-8">
        <AnswerForm questionId={id} onSubmitted={handleAnswerSubmitted} />
      </div>
    </motion.div>
  )
}
