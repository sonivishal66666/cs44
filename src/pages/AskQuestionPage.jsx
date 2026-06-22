import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HelpCircle, Lightbulb, CheckCircle, Search, Tag, ListChecks } from 'lucide-react'
import Card from '@/components/ui/Card'
import QuestionForm from '@/components/questions/QuestionForm'
import DuplicateWarning from '@/components/questions/DuplicateWarning'
import { useQuestions } from '@/hooks/useQuestions'
import { useToast } from '@/components/ui/Toast'
import { findDuplicates } from '@/lib/duplicateDetector'
import { supabase } from '@/config/supabase'

const tips = [
  { icon: Search, text: 'Search before asking to avoid duplicates' },
  { icon: Lightbulb, text: 'Be specific and provide context' },
  { icon: Tag, text: 'Use appropriate category and tags' },
  { icon: ListChecks, text: 'Include relevant details and examples' },
  { icon: CheckCircle, text: 'Proofread your question before posting' },
]

export default function AskQuestionPage() {
  const navigate = useNavigate()
  const { createQuestion, loading } = useQuestions()
  const { showToast } = useToast()

  const [showDuplicates, setShowDuplicates] = useState(false)
  const [duplicates, setDuplicates] = useState([])
  const [pendingData, setPendingData] = useState(null)

  const [checkingDuplicates, setCheckingDuplicates] =
    useState(false)

  const checkDuplicates = useCallback(async (data) => {
    try {
      const { data: existingQuestions } = await supabase
        .from('questions')
        .select('id, title, answers(id, verification_status)')
        .eq('status', 'active')

      if (
        existingQuestions &&
        existingQuestions.length > 0
      ) {

        const enriched = existingQuestions.map(q => ({
          ...q,
          answer_count: (q.answers || []).length,
        }))

        setCheckingDuplicates(true)

        let dupes = []

        try {

          dupes = await findDuplicates(
            enriched,
            data.title
          )

        } finally {

          setCheckingDuplicates(false)

        }

        if (dupes.length > 0) {
          setDuplicates(dupes)
          setPendingData(data)
          setShowDuplicates(true)
          return true
        }
      }

      return false

    } catch (error) {

      console.error(
        'Duplicate check failed:',
        error
      )

      setCheckingDuplicates(false)

      return false
    }
  }, [])

  const submitQuestion = useCallback(async (data) => {
    try {
      const question = await createQuestion(data)

      showToast(
        'Question posted successfully!',
        'success'
      )

      navigate(`/question/${question.id}`)

    } catch (err) {

      showToast(
        err.message ||
        'Failed to post question',
        'error'
      )

    }
  }, [createQuestion, navigate, showToast])

  const handleSubmit = async (data) => {

    showToast(
      'Checking for similar questions...',
      'info'
    )

    const hasDuplicates =
      await checkDuplicates(data)

    if (!hasDuplicates) {
      await submitQuestion(data)
    }
  }

  const handleContinueAnyway = async () => {
    setShowDuplicates(false)

    if (pendingData) {
      await submitQuestion(pendingData)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Ask a Question
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Get help from the community
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8">
            <Card className="p-6 md:p-8">

              <QuestionForm
                onSubmit={handleSubmit}
                loading={
                  loading ||
                  checkingDuplicates
                }
              />

            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="p-5 sticky top-24">

              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Tips for a great question
              </h3>

              <div className="space-y-3">

                {tips.map((tip, index) => {

                  const Icon = tip.icon

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2.5"
                    >
                      <Icon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />

                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {tip.text}
                      </span>
                    </motion.div>
                  )
                })}

              </div>

            </Card>
          </div>

        </div>
      </div>

      <DuplicateWarning
        isOpen={showDuplicates}
        onClose={() => setShowDuplicates(false)}
        duplicates={duplicates}
        onContinue={handleContinueAnyway}
      />
    </motion.div>
  )
}
