import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronUp, Eye, Clock, Paperclip, ChevronRight, Home, Tag } from 'lucide-react'
import { ChevronUp, ChevronDown, Eye, Clock, Paperclip, ChevronRight, Home, Tag, Trash2 } from 'lucide-react'

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
import { useTranslation } from '@/hooks/useTranslation'
import TranslationButton from '@/components/translation/TranslationButton'
import TranslationBadge from '@/components/translation/TranslationBadge'
import ReportModal from '@/components/ui/ReportModal'

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
  const { question, loading: qLoading, fetchQuestionById } = useQuestions()
  const { answers, loading: aLoading, fetchAnswers, verifyAnswer, rejectAnswer, markSpam, deleteAnswer } = useAnswers()
  const { toggleQuestionUpvote, hasUpvotedQuestion } = useUpvote()
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const { question, loading: qLoading, fetchQuestionById, deleteQuestion } = useQuestions()
  const { answers, loading: aLoading, fetchAnswers, verifyAnswer, rejectAnswer, markSpam, deleteAnswer, acceptAnswer } = useAnswers()
  const { toggleQuestionVote, hasUpvotedQuestion, hasDownvotedQuestion } = useUpvote()
  const { user, isAdmin } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  
  const [upvoted, setUpvoted] = useState(false)
  const [downvoted, setDownvoted] = useState(false)
  const [localScore, setLocalScore] = useState(0)

  const preferredLanguage = user?.preferred_language || 'en'
  const titleTranslation = useTranslation({
    contentId: `question-title-${question?.id}`,
    content: question?.title,
    autoTargetLanguage: preferredLanguage,
    autoTranslate: Boolean(user?.preferred_language),
  })
  const descriptionTranslation = useTranslation({
    contentId: `question-description-${question?.id}`,
    content: question?.description,
    autoTargetLanguage: preferredLanguage,
    autoTranslate: Boolean(user?.preferred_language),
  })

  useEffect(() => {
    if (id) {
      fetchQuestionById(id)
      fetchAnswers(id)
    }
  }, [id, fetchQuestionById, fetchAnswers])

  useEffect(() => {
    if (question) {
      setLocalScore((question.upvotes || 0) - (question.downvotes || 0))
      if (user) {
        hasUpvotedQuestion(question.id).then(setUpvoted)
        hasDownvotedQuestion(question.id).then(setDownvoted)
      } else {
        setUpvoted(false)
        setDownvoted(false)
      }
    }
  }, [question, user, hasUpvotedQuestion, hasDownvotedQuestion])

  const handleUpvote = async () => {
    if (!user) {
      showToast('Please sign in to upvote', 'info')
      return
    }
    try {
      await toggleQuestionVote(question.id, true)
      if (upvoted) {
        setUpvoted(false)
        setLocalScore(prev => prev - 1)
      } else {
        setUpvoted(true)
        if (downvoted) {
          setDownvoted(false)
          setLocalScore(prev => prev + 2)
        } else {
          setLocalScore(prev => prev + 1)
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to upvote', 'error')
    }
  }

  const handleDownvote = async () => {
    if (!user) {
      showToast('Please sign in to downvote', 'info')
      return
    }
    try {
      await toggleQuestionVote(question.id, false)
      if (downvoted) {
        setDownvoted(false)
        setLocalScore(prev => prev + 1)
      } else {
        setDownvoted(true)
        if (upvoted) {
          setUpvoted(false)
          setLocalScore(prev => prev - 2)
        } else {
          setLocalScore(prev => prev - 1)
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to downvote', 'error')
    }
  }

  const handleAcceptAnswer = async (answerId) => {
    try {
      await acceptAnswer(answerId)
      showToast('Answer acceptance updated!', 'success')
      fetchAnswers(id)
    } catch (err) {
      showToast(err.message || 'Failed to accept answer', 'error')
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

  const handleFlagClick = (flagId, type) => {
    setReportModal({ open: true, type, id: flagId })
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
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <button
              onClick={handleUpvote}
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                upvoted
                  ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            
            <span className={`text-lg font-bold transition-colors ${upvoted ? 'text-indigo-600' : downvoted ? 'text-rose-500' : 'text-slate-650 dark:text-slate-400'}`}>
              {localScore}
            </span>

            <button
              onClick={handleDownvote}
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                downvoted
                  ? 'text-rose-550 bg-rose-50 dark:bg-rose-900/30'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                    {titleTranslation.displayText}
                  </h1>
                  {titleTranslation.isTranslated && (
                    <div className="mt-2">
                      <TranslationBadge
                        originalLanguage={titleTranslation.originalLanguage}
                        targetLanguage={titleTranslation.currentLanguage}
                      />
                    </div>
                  )}
                </div>
              <div className="flex-1 pr-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                  {titleTranslation.displayText}
                </h1>
                {titleTranslation.isTranslated && (
                  <div className="mt-2">
                    <TranslationBadge
                      originalLanguage={titleTranslation.originalLanguage}
                      targetLanguage={titleTranslation.currentLanguage}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <TranslationButton
                  originalLanguage={titleTranslation.originalLanguage}
                  currentLanguage={titleTranslation.currentLanguage}
                  isTranslated={titleTranslation.isTranslated}
                  status={titleTranslation.status}
                  error={titleTranslation.error}
                  onTranslate={titleTranslation.translate}
                  onReset={titleTranslation.resetTranslation}
                />
              </div>

                {/* Option Menu (Report Question) */}
                {user && question.user_id !== user.id && (
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                      }}
                      className="p-1.5 rounded-lg text-slate-405 hover:text-slate-655 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer transition-colors"
                      aria-label="Options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(false);
                          }}
                        />
                        <div className="absolute right-0 mt-1 w-38 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-lg py-1 z-40">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(false);
                              handleFlagClick(question.id, 'question');
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            Report Question
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {descriptionTranslation.displayText}
                    </p>
                    {descriptionTranslation.isTranslated && (
                      <div className="mt-2">
                        <TranslationBadge
                          originalLanguage={descriptionTranslation.originalLanguage}
                          targetLanguage={descriptionTranslation.currentLanguage}
                        />
                      </div>
                    )}
                  </div>
                  <TranslationButton
                    originalLanguage={descriptionTranslation.originalLanguage}
                    currentLanguage={descriptionTranslation.currentLanguage}
                    isTranslated={descriptionTranslation.isTranslated}
                    status={descriptionTranslation.status}
                    error={descriptionTranslation.error}
                    onTranslate={descriptionTranslation.translate}
                    onReset={descriptionTranslation.resetTranslation}
                  />
                </div>
              </div>
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
              {(isAdmin || (user && (user.id === question.user_id || user.id === question.users?.id))) && (
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

      <div className="mb-8">
        <AnswerList
          answers={answers}
          loading={aLoading}
          isAdmin={isAdmin}
          userId={user?.id}
          isQuestionOwner={user && (user.id === question.user_id || user.id === question.users?.id)}
          onVerify={handleVerify}
          onReject={handleReject}
          onDelete={handleDelete}
          onSpam={handleSpam}
          onAccept={handleAcceptAnswer}
        />
      </div>
      {/* Answer Form */}
      <div className="mb-8">
        <AnswerForm questionId={id} onSubmitted={handleAnswerSubmitted} />
      </div>

      {/* Report Modal */}
      {reportModal.open && (
        <ReportModal
          isOpen={reportModal.open}
          onClose={() => setReportModal({ open: false, type: 'question', id: null })}
          contentType={reportModal.type}
          contentId={reportModal.id}
        />
      )}
    </motion.div>
  )
}
