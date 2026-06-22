import { motion } from 'framer-motion'
import { AlertTriangle, ExternalLink, MessageCircle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Link } from 'react-router-dom'

export default function DuplicateWarning({
  isOpen,
  onClose,
  duplicates = [],
  onContinue,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Similar Questions Found"
      size="lg"
    >
      <div className="space-y-4">

        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />

          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              We found questions similar to yours
            </p>

            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Check if your question has already been asked before posting a new one.
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">

          {duplicates.map((dup, index) => (

            <motion.div
              key={dup.item?.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
            >
              <div className="flex-1 min-w-0">

                <Link
                  to={`/question/${dup.item?.id}`}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2"
                  onClick={onClose}
                >
                  {dup.item?.title}
                </Link>

                <div className="flex items-center gap-3 mt-1.5">

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {dup.item?.answer_count || 0} answers
                  </span>

                  <span className="text-xs font-medium text-emerald-500">
                    {Math.round(
                      (
                        dup.finalScore ??
                        (1 - (dup.score || 0))
                      ) * 100
                    )}
                    % semantic match
                  </span>

                </div>
              </div>

              <Link
                to={`/question/${dup.item?.id}`}
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </Link>

            </motion.div>

          ))}

        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">

          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={onContinue}
          >
            Ask Anyway
          </Button>

        </div>

      </div>
    </Modal>
  )
}
