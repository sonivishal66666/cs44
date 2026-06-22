import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronUp,
  MessageCircle,
  Eye,
  Clock,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { useUpvote } from '@/hooks/useUpvote';

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function QuestionCard({ question, index = 0 }) {
  const {
    id,
    title,
    description,
    category,
    tags,
    upvotes = 0,
    answer_count = 0,
    views = 0,
    has_verified_answer,
    has_attachment,
    created_at,
    users,
  } = question;

  const { user } = useAuth();
  const { showToast } = useToast();
  const { toggleQuestionUpvote, hasUpvotedQuestion } = useUpvote();

  const [upvoted, setUpvoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes || 0);

  useEffect(() => {
    setLocalUpvotes(upvotes || 0);
  }, [upvotes]);

  useEffect(() => {
    if (user) {
      hasUpvotedQuestion(id).then(setUpvoted);
    } else {
      setUpvoted(false);
    }
  }, [id, user, hasUpvotedQuestion]);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to upvote', 'info');
      return;
    }
    try {
      await toggleQuestionUpvote(id);
      setUpvoted(!upvoted);
      setLocalUpvotes((prev) => (upvoted ? prev - 1 : prev + 1));
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  const author = users || question.author || {};
  const parsedTags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : Array.isArray(tags) ? tags : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      whileHover={{ y: -3.5, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group block"
    >
      <div className="flex gap-4 p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 shadow-sm hover:border-indigo-500/30 dark:hover:border-purple-500/35 hover:shadow-lg dark:hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.15)] transition-all duration-300">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
          <button
            onClick={handleUpvote}
            className={`p-1 rounded-lg transition-all duration-200 cursor-pointer ${
              upvoted
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10'
                : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <ChevronUp className={`w-5 h-5 transition-transform ${upvoted ? 'scale-110 stroke-[3px]' : ''}`} />
          </button>
          <span className={`text-sm font-bold transition-colors ${upvoted ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
            {localUpvotes}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <Link
            to={`/question/${id}`}
            className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 block"
          >
            {title}
          </Link>

          {/* Description preview */}
          {description && (
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Bottom row */}
          <div className="mt-4.5 flex flex-wrap items-center gap-2">
            {/* Category */}
            {category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
                {category}
              </span>
            )}

            {/* Tags */}
            {parsedTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 border border-zinc-200/30 dark:border-zinc-800/50"
              >
                {tag}
              </span>
            ))}
            {parsedTags.length > 3 && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">+{parsedTags.length - 3}</span>
            )}

            {/* Verified answer badge */}
            {has_verified_answer && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-900/30">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
              {has_attachment && (
                <span className="flex items-center gap-1" title="Has attachment">
                  <Paperclip className="w-3 h-3" />
                </span>
              )}
              <span className="flex items-center gap-1" title="Answers">
                <MessageCircle className="w-3 h-3" />
                {answer_count}
              </span>
              <span className="flex items-center gap-1" title="Views">
                <Eye className="w-3 h-3" />
                {views}
              </span>
              <span className="flex items-center gap-1" title={created_at}>
                <Clock className="w-3 h-3" />
                {formatTimeAgo(created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Author avatar */}
        <div className="hidden sm:flex flex-col items-center justify-start shrink-0 pt-1">
          {user && author.id === user.id ? (
            <Link to="/profile" className="group/avatar" title={`${author.name || 'Anonymous'} (You)`}>
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 text-xs font-bold overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500/50 dark:hover:border-purple-500/50 transition-all">
                {author.avatar ? (
                  <img src={author.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  (author.name?.[0] || '?').toUpperCase()
                )}
              </div>
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 text-xs font-bold overflow-hidden border border-zinc-200 dark:border-zinc-700 transition-all" title={author.name || 'Anonymous'}>
              {author.avatar ? (
                <img src={author.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (author.name?.[0] || '?').toUpperCase()
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
