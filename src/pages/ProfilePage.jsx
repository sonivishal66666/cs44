import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Calendar, Shield, HelpCircle, MessageCircle, CheckCircle, ThumbsUp, Edit2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import QuestionCard from '@/components/questions/QuestionCard'
import { useAuth } from '@/hooks/useAuth'
import { useQuestions } from '@/hooks/useQuestions'
import { useAnswers } from '@/hooks/useAnswers'
import { useToast } from '@/components/ui/Toast'
import { Link } from 'react-router-dom'

const tabs = [
  { id: 'questions', label: 'My Questions', icon: HelpCircle },
  { id: 'answers', label: 'My Answers', icon: MessageCircle },
]

function timeAgo(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { fetchUserQuestions } = useQuestions()
  const { fetchUserAnswers } = useAnswers()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('questions')
  const [userQuestions, setUserQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [questions, answers] = await Promise.all([
        fetchUserQuestions(user.id),
        fetchUserAnswers(user.id),
      ])
      setUserQuestions(questions || [])
      setUserAnswers(answers || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ name })
      setEditing(false)
      showToast('Profile updated!', 'success')
    } catch (err) {
      showToast('Failed to update profile', 'error')
    }
  }

  if (!user) return null

  const verifiedAnswerCount = userAnswers.filter(a => a.verification_status === 'verified').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Profile Card */}
      <Card className="p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Avatar src={user.avatar} name={user.name || 'User'} size="lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                {editing ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-xl font-bold bg-transparent border-b-2 border-indigo-500 outline-none text-slate-800 dark:text-white"
                    />
                    <Button size="sm" variant="primary" onClick={handleUpdateProfile}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                ) : (
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {user.name || 'Anonymous'}
                    <button onClick={() => setEditing(true)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </h1>
                )}
                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {timeAgo(user.created_at)}
                  </span>
                </div>
                <Badge variant={user.role === 'admin' ? 'info' : 'default'} className="mt-2">
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role}
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Questions', value: userQuestions.length, icon: HelpCircle, color: 'text-indigo-500' },
                { label: 'Answers', value: userAnswers.length, icon: MessageCircle, color: 'text-violet-500' },
                { label: 'Verified', value: verifiedAnswerCount, icon: CheckCircle, color: 'text-emerald-500' },
                { label: 'Upvotes', value: userQuestions.reduce((sum, q) => sum + (q.upvotes || 0), 0), icon: ThumbsUp, color: 'text-amber-500' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {userQuestions.length === 0 ? (
                <Card className="p-8 text-center">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">You haven&apos;t asked any questions yet.</p>
                  <Link to="/ask">
                    <Button variant="primary" size="sm" className="mt-3">Ask a Question</Button>
                  </Link>
                </Card>
              ) : (
                userQuestions.map(q => <QuestionCard key={q.id} question={q} />)
              )}
            </div>
          )}

          {activeTab === 'answers' && (
            <div className="space-y-3">
              {userAnswers.length === 0 ? (
                <Card className="p-8 text-center">
                  <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">You haven&apos;t answered any questions yet.</p>
                </Card>
              ) : (
                userAnswers.map(answer => (
                  <Card key={answer.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/question/${answer.question_id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                          {answer.questions?.title || 'Question'}
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {answer.content}
                        </p>
                      </div>
                      <Badge variant={
                        answer.verification_status === 'verified' ? 'success' :
                        answer.verification_status === 'pending' ? 'warning' : 'danger'
                      }>
                        {answer.verification_status}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
