import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Calendar, Shield, HelpCircle, MessageCircle, 
  CheckCircle, ThumbsUp, ThumbsDown, Edit2, Trophy, Lock, 
  Award, BookOpen, Sparkles, Flame, Check, Star, Crown, 
  TrendingUp, Zap, Lightbulb 
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import QuestionCard from '@/components/questions/QuestionCard'
import { useAuth } from '@/hooks/useAuth'
import { useQuestions } from '@/hooks/useQuestions'
import { useAnswers } from '@/hooks/useAnswers'
import { useToast } from '@/components/ui/Toast'
import { getSupportedLanguages } from '@/lib/translationService'
import { supabase } from '@/config/supabase'
import { Link } from 'react-router-dom'
import { badgeIcons } from '@/components/ui/BadgeUnlockModal'

const tabs = [
  { id: 'questions', label: 'My Questions', icon: HelpCircle },
  { id: 'answers', label: 'My Answers', icon: MessageCircle },
]

function timeAgo(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
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
  const [preferredLanguage, setPreferredLanguage] = useState('en')
  const [savingLanguage, setSavingLanguage] = useState(false)
  
  // Gamification states
  const [globalRank, setGlobalRank] = useState(1)
  const [monthlyRep, setMonthlyRep] = useState(0)
  const [badges, setBadges] = useState([])
  const [earnedBadgeIds, setEarnedBadgeIds] = useState(new Set())
  const [reputationLogs, setReputationLogs] = useState([])
  const [nextBadge, setNextBadge] = useState(null)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPreferredLanguage(user.preferred_language || 'en')
      loadData()
      loadGamificationData()
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

  const loadGamificationData = async () => {
    if (!user) return
    try {
      // 1. Calculate Global Rank: count of users with strictly greater reputation + 1
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('reputation_points', user.reputation_points || 0)
      setGlobalRank((count || 0) + 1)

      // 2. Fetch Reputation Earned This Month (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const { data: monthlyLogs } = await supabase
        .from('reputation_logs')
        .select('points_awarded')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
      const totalMonthly = monthlyLogs?.reduce((sum, log) => sum + log.points_awarded, 0) || 0
      setMonthlyRep(totalMonthly)

      // 3. Fetch Recent Reputation Logs
      const { data: logs } = await supabase
        .from('reputation_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6)
      setReputationLogs(logs || [])

      // 4. Fetch Badge Details & User Earned Badges
      const [badgesRes, userBadgesRes] = await Promise.all([
        supabase.from('badges').select('*').order('created_at', { ascending: true }),
        supabase.from('user_badges').select('badge_id').eq('user_id', user.id)
      ])

      const allBadges = badgesRes.data || []
      const earnedIds = new Set((userBadgesRes.data || []).map(b => b.badge_id))
      setBadges(allBadges)
      setEarnedBadgeIds(earnedIds)

    } catch (err) {
      console.error('Gamification loading error:', err)
    }
  }

  // Calculate Next Achievable Badge progress
  useEffect(() => {
    if (badges.length === 0 || !user) return

    const userRep = user.reputation_points || 0
    const qCount = userQuestions.length
    const aCount = userAnswers.filter(a => a.verification_status === 'verified').length
    const acceptedCount = userAnswers.filter(a => a.is_accepted).length
    const upvotesReceived = userQuestions.reduce((sum, q) => sum + (q.upvotes || 0), 0) +
                            userAnswers.reduce((sum, a) => sum + (a.upvotes || 0), 0)

    // Evaluate progress for locked badges
    const lockedProgress = badges
      .filter(b => !earnedBadgeIds.has(b.id))
      .map(b => {
        let current = 0
        let target = 100
        let unit = ''
        
        switch (b.id) {
          // Beginner Contributor
          case '00000000-0000-0000-0000-000000000001':
            current = userRep; target = 10; unit = 'Rep'; break
          // First Question
          case '00000000-0000-0000-0000-000000000002':
            current = qCount; target = 1; unit = 'Question'; break
          // First Answer
          case '00000000-0000-0000-0000-000000000003':
            current = aCount; target = 1; unit = 'Answer'; break
          // Knowledge Sharer
          case '00000000-0000-0000-0000-000000000004':
            current = userRep; target = 100; unit = 'Rep'; break
          // 10 Accepted Answers
          case '00000000-0000-0000-0000-000000000005':
            current = acceptedCount; target = 10; unit = 'Accepted Answers'; break
          // Helpful Member
          case '00000000-0000-0000-0000-000000000006':
            current = upvotesReceived; target = 10; unit = 'Upvotes'; break
          // Expert Contributor
          case '00000000-0000-0000-0000-000000000007':
            current = userRep; target = 500; unit = 'Rep'; break
          // 50 Upvotes Received
          case '00000000-0000-0000-0000-000000000008':
            current = upvotesReceived; target = 50; unit = 'Upvotes'; break
          // Problem Solver
          case '00000000-0000-0000-0000-000000000009':
            current = acceptedCount; target = 5; unit = 'Accepted Answers'; break
          // Community Champion
          case '00000000-0000-0000-0000-000000000010':
            current = userRep; target = 1000; unit = 'Rep'; break
          // Top Contributor
          case '00000000-0000-0000-0000-000000000011':
            current = upvotesReceived; target = 100; unit = 'Upvotes'; break
          // Elite Expert
          case '00000000-0000-0000-0000-000000000012':
            current = userRep; target = 2000; unit = 'Rep'; break
          default:
            current = 0; target = 100; unit = 'Progress'
        }

        const percentage = Math.min(99, Math.floor((current / target) * 100))
        return {
          ...b,
          current,
          target,
          unit,
          percentage
        }
      })
      .sort((a, b) => b.percentage - a.percentage) // Sort by closest completion

    if (lockedProgress.length > 0) {
      setNextBadge(lockedProgress[0])
    } else {
      setNextBadge(null) // Unlocked all badges!
    }
  }, [badges, earnedBadgeIds, user, userQuestions, userAnswers])

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ name })
      setEditing(false)
      showToast('Profile updated!', 'success')
    } catch (err) {
      showToast('Failed to update profile', 'error')
    }
  }

  const handleSavePreferredLanguage = async () => {
    if (!user) return
    setSavingLanguage(true)
    try {
      await updateProfile({ preferred_language: preferredLanguage })
      showToast('Preferred language saved!', 'success')
    } catch (err) {
      showToast('Failed to save preferred language', 'error')
    } finally {
      setSavingLanguage(false)
    }
  }

  if (!user) return null

  const verifiedAnswerCount = userAnswers.filter(a => a.verification_status === 'verified').length
  const acceptedAnswerCount = userAnswers.filter(a => a.is_accepted).length
  const totalUpvotesReceived = userQuestions.reduce((sum, q) => sum + (q.upvotes || 0), 0) +
                               userAnswers.reduce((sum, a) => sum + (a.upvotes || 0), 0)
  const totalDownvotesReceived = userQuestions.reduce((sum, q) => sum + (q.downvotes || 0), 0) +
                                 userAnswers.reduce((sum, a) => sum + (a.downvotes || 0), 0)

  // Badge tier color codes
  const badgeTierColors = {
    bronze: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    silver: 'bg-slate-400/10 text-slate-600 dark:text-slate-400 border-slate-400/20',
    gold: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-450 border-yellow-500/20',
    diamond: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    special: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* 1. Header Hero Card */}
      <Card className="p-6 md:p-8 overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <Avatar src={user.avatar} name={user.name || 'User'} size="lg" className="border-4 border-indigo-500/20" />
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {editing ? (
                  <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-2xl font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl outline-none border border-indigo-500 text-slate-800 dark:text-white"
                    />
                    <Button size="sm" variant="primary" onClick={handleUpdateProfile}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                ) : (
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-2">
                    {user.name || 'Anonymous'}
                    <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer">
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </h1>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Joined {timeAgo(user.created_at)}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr] items-center">
                  <label htmlFor="preferredLanguage" className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Preferred Language
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <select
                      id="preferredLanguage"
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                    >
                      {getSupportedLanguages().map((language) => (
                        <option key={language.code} value={language.code}>
                          {language.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleSavePreferredLanguage}
                      loading={savingLanguage}
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <Badge variant={user.role === 'admin' ? 'info' : 'default'} className="mt-2">
                  <Shield className="w-3 h-3 mr-1" />
                <Badge variant={user.role === 'admin' ? 'info' : 'default'} className="mt-3.5">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  {user.role}
                </Badge>
              </div>

              {/* Big Reputation Counter & Global Rank */}
              <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 p-4 px-6 rounded-2xl w-fit mx-auto md:mx-0 shadow-inner">
                <div className="text-center">
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{user.reputation_points || 0}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Reputation</p>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-850" />
                <div className="text-center">
                  <p className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    #{globalRank}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Global Rank</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Gamification Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Progress & Badges */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Progress to Next Badge */}
          {nextBadge && (
            <Card className="p-6 relative overflow-hidden border-indigo-500/20 dark:border-purple-550/15">
              <div className="absolute top-0 right-0 p-3">
                <Sparkles className="w-5 h-5 text-indigo-500 dark:text-purple-400 animate-pulse" />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 mb-4">
                Next Achievable Badge
              </h3>
              <div className="flex items-center gap-4.5">
                <div className={`p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}>
                  {(() => {
                    const IconComponent = badgeIcons[nextBadge.icon] || Award
                    return <IconComponent className="w-7 h-7 text-indigo-600 dark:text-purple-400" />
                  })()}
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-slate-850 dark:text-zinc-50">{nextBadge.badge_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{nextBadge.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nextBadge.percentage}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                      />
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-zinc-350 shrink-0">
                      {nextBadge.current} / {nextBadge.target} {nextBadge.unit}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mt-2">
                    ⚡ {nextBadge.percentage}% completed. You are close to this milestone!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Badge Showcase Collection */}
          <Card className="p-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-5 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              Badge Collection
              <span className="text-xs font-normal text-slate-400">
                ({earnedBadgeIds.size} unlocked, {badges.length - earnedBadgeIds.size} locked)
              </span>
            </h3>

            {badges.length === 0 ? (
              <p className="text-sm text-slate-400">No badges configured.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {badges.map((b) => {
                  const isEarned = earnedBadgeIds.has(b.id)
                  const Icon = badgeIcons[b.icon] || Award
                  const tierColor = badgeTierColors[b.badge_type] || badgeTierColors.bronze
                  
                  return (
                    <div
                      key={b.id}
                      className={`relative flex flex-col items-center p-4.5 rounded-2xl border transition-all duration-300 ${
                        isEarned 
                          ? `${tierColor} shadow-sm bg-white dark:bg-zinc-950/20 cursor-default hover:scale-102 hover:shadow-md` 
                          : 'border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/[0.05] opacity-45 cursor-not-allowed select-none'
                      }`}
                    >
                      <div className="relative">
                        <Icon className="w-7 h-7 drop-shadow-md" />
                        {!isEarned && (
                          <Lock className="w-3.5 h-3.5 text-slate-450 dark:text-slate-650 absolute -top-1.5 -right-1.5" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-center mt-3 truncate max-w-full text-slate-800 dark:text-zinc-200">
                        {b.badge_name}
                      </p>
                      <p className="text-[9px] text-center text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {b.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Stats & Contribution Logs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Detailed Activity Stats */}
          <Card className="p-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-5">
              Activity Statistics
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Questions Asked', value: userQuestions.length, icon: HelpCircle, color: 'text-indigo-500' },
                { label: 'Answers Posted', value: userAnswers.length, icon: MessageCircle, color: 'text-violet-500' },
                { label: 'Accepted Answers', value: acceptedAnswerCount, icon: CheckCircle, color: 'text-emerald-500' },
                { label: 'Upvotes Received', value: totalUpvotesReceived, icon: ThumbsUp, color: 'text-amber-500' },
                { label: 'Downvotes Received', value: totalDownvotesReceived, icon: ThumbsDown, color: 'text-rose-500' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4.5 h-4.5 ${item.color}`} />
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-slate-800 dark:text-zinc-150">{item.value}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Recent Contribution & Rep logs */}
          <Card className="p-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-5 flex items-center justify-between">
              Reputation History
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
                Month: {monthlyRep >= 0 ? `+${monthlyRep}` : monthlyRep}
              </span>
            </h3>

            {reputationLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent transactions.</p>
            ) : (
              <div className="space-y-3.5">
                {reputationLogs.map((log) => {
                  const isPositive = log.points_awarded >= 0
                  return (
                    <div key={log.id} className="flex items-start justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-700 dark:text-zinc-300">
                          {formatActionType(log.action_type)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(log.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`font-black tracking-tighter shrink-0 px-2 py-0.5 rounded-lg text-[10px] border ${
                        isPositive 
                          ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/15' 
                          : 'text-rose-500 bg-rose-500/10 border-rose-500/15'
                      }`}>
                        {isPositive ? `+${log.points_awarded}` : log.points_awarded}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 3. Original My Posts tabs */}
      <Card className="p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl w-fit border border-slate-200/50 dark:border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/40 dark:border-slate-750/30'
                    : 'text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
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
                  <div className="p-8 text-center bg-slate-50/50 dark:bg-zinc-950/5 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-semibold">You haven&apos;t asked any questions yet.</p>
                    <Link to="/ask">
                      <Button variant="primary" size="sm" className="mt-3">Ask a Question</Button>
                    </Link>
                  </div>
                ) : (
                  userQuestions.map((q, idx) => <QuestionCard key={q.id} question={q} index={idx} />)
                )}
              </div>
            )}

            {activeTab === 'answers' && (
              <div className="space-y-3">
                {userAnswers.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50/50 dark:bg-zinc-950/5 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                    <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-semibold">You haven&apos;t answered any questions yet.</p>
                  </div>
                ) : (
                  userAnswers.map((answer) => (
                    <Card key={answer.id} className={`p-4 border transition-all duration-300 ${answer.is_accepted ? 'border-emerald-500/25 bg-emerald-500/[0.005]' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/question/${answer.question_id}`}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 block truncate"
                          >
                            {answer.questions?.title || 'Question'}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {answer.content}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge variant={
                            answer.verification_status === 'verified' ? 'success' :
                            answer.verification_status === 'pending' ? 'warning' : 'danger'
                          }>
                            {answer.verification_status}
                          </Badge>
                          {answer.is_accepted && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-lg">
                              <Check className="w-3 h-3 stroke-[3px]" /> Accepted
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
