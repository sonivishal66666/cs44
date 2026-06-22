import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, Clock, CheckCircle, XCircle, AlertTriangle, Shield, Trash2, Flag, MessageSquare, Sparkles } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import FilePreview from '@/components/ui/FilePreview'
import { useUpvote } from '@/hooks/useUpvote'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import TranslationButton from '@/components/translation/TranslationButton'
import TranslationBadge from '@/components/translation/TranslationBadge'

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
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function summarizeText(text, maxSentences = 2) {
  if (!text) return '';
  
  // 1. Split text into sentences using simple regex
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length <= maxSentences) {
    return text;
  }

  // 2. Tokenize and calculate word frequencies (excluding stop words)
  const stopWords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 
    'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
  ]);

  const wordFrequencies = {};
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 2) {
      wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
    }
  });

  // 3. Score sentences based on word frequencies
  const sentenceScores = sentences.map((sentence, idx) => {
    const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    let score = 0;
    
    sentenceWords.forEach(word => {
      if (wordFrequencies[word]) {
        score += wordFrequencies[word];
      }
    });
    
    // Normalize score by sentence word count to maintain structural balance
    const wordCount = sentenceWords.length || 1;
    return {
      index: idx,
      text: sentence.trim(),
      score: score / wordCount
    };
  });

  // 4. Sort sentences by score and pick the top N
  const topSentences = [...sentenceScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    // Re-sort by original index to maintain natural narrative flow
    .sort((a, b) => a.index - b.index)
    .map(s => s.text);

  return topSentences.join(' ');
}

const statusConfig = {
  verified: { icon: CheckCircle, variant: 'success', label: 'Verified' },
  pending: { icon: Clock, variant: 'warning', label: 'Pending Review' },
  rejected: { icon: XCircle, variant: 'danger', label: 'Rejected' },
  spam: { icon: AlertTriangle, variant: 'danger', label: 'Spam' },
}

export default function AnswerCard({ answer, isOwner, isAdmin, onVerify, onReject, onDelete, onSpam, onFlag }) {
  const { toggleAnswerUpvote, hasUpvotedAnswer } = useUpvote()
  const { user } = useAuth()
  const [upvoted, setUpvoted] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(answer.upvotes || 0)
  const [showAiSummary, setShowAiSummary] = useState(false)

  const preferredLanguage = user?.preferred_language || 'en'
  const answerTranslation = useTranslation({
    contentId: `answer-${answer.id}`,
    content: answer.content,
    autoTargetLanguage: preferredLanguage,
    autoTranslate: Boolean(user?.preferred_language),
  })

  useEffect(() => {
    if (user) {
      hasUpvotedAnswer(answer.id).then(setUpvoted)
    }
  }, [answer.id, user, hasUpvotedAnswer])

  const handleUpvote = async () => {
    if (!user) return
    try {
      await toggleAnswerUpvote(answer.id)
      setUpvoted(!upvoted)
      setLocalUpvotes(prev => upvoted ? prev - 1 : prev + 1)
    } catch (err) {
      console.error('Upvote error:', err)
    }
  }

  const status = statusConfig[answer.verification_status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
    >
      {/* Upvote section */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <button
          onClick={handleUpvote}
          disabled={!user}
          className={`p-1.5 rounded-lg transition-all duration-200 ${
            upvoted
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700'
          } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <span className={`text-sm font-semibold ${upvoted ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}>
          {localUpvotes}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-3 flex items-start justify-between gap-3">
          <TranslationBadge
            originalLanguage={answerTranslation.originalLanguage}
            targetLanguage={answerTranslation.currentLanguage}
          />
          <TranslationButton
            originalLanguage={answerTranslation.originalLanguage}
            currentLanguage={answerTranslation.currentLanguage}
            isTranslated={answerTranslation.isTranslated}
            status={answerTranslation.status}
            error={answerTranslation.error}
            onTranslate={answerTranslation.translate}
            onReset={answerTranslation.resetTranslation}
          />
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 leading-relaxed">
          <p className="whitespace-pre-wrap">{answerTranslation.displayText}</p>
        </div>

        {answer.content && answer.content.length > 350 && (
          <div className="mt-3.5 relative z-10">
            <button
              onClick={() => setShowAiSummary(!showAiSummary)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/35 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.02)] dark:shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-purple-500/10 hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span>{showAiSummary ? 'Hide AI Summary' : 'AI Sparkle Summary'}</span>
            </button>
            
            <AnimatePresence>
              {showAiSummary && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                  className="overflow-hidden mt-2.5"
                >
                  <div className="p-4 rounded-xl bg-purple-500/[0.03] dark:bg-purple-500/[0.02] border border-purple-500/15 dark:border-purple-500/20 shadow-inner relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 right-0 p-1.5">
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-purple-650 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        ✨ Local AI
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      ⚡ Key Insights Summary
                    </p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic border-l-2 border-purple-500/50 pl-3">
                      "{summarizeText(answer.content)}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {answer.attachment_url && (
          <div className="mt-3">
            <FilePreview url={answer.attachment_url} />
          </div>
        )}

        {answer.admin_note && (answer.verification_status === 'rejected' || isAdmin) && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Admin Note</p>
            <p className="text-sm text-amber-600 dark:text-amber-300">{answer.admin_note}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar
                src={answer.users?.avatar}
                name={answer.users?.name || 'User'}
                size="sm"
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {answer.users?.name || 'Anonymous'}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {timeAgo(answer.created_at)}
            </span>
            <Badge variant={status.variant} icon={StatusIcon}>
              {status.label}
            </Badge>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              {answer.verification_status !== 'verified' && (
                <button
                  onClick={() => onVerify?.(answer.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verify
                </button>
              )}
              {answer.verification_status !== 'rejected' && (
                <button
                  onClick={() => onReject?.(answer.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              )}
              <button
                onClick={() => onSpam?.(answer.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Spam
              </button>
              <button
                onClick={() => onDelete?.(answer.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
