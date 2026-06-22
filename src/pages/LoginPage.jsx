import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, KeyRound } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'

const pageVariants = {
  initial: { opacity: 0, scale: 0.96, y: 15 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } },
  exit: { opacity: 0, scale: 0.96, y: -15, transition: { duration: 0.2 } },
}

export default function LoginPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-6 relative"
    >
      <div className="w-full max-w-md relative z-10">
        
        {/* Immersive Cyber-Glass Card */}
        <motion.div
          className="backdrop-blur-2xl bg-white/75 dark:bg-zinc-950/30 border border-zinc-200/80 dark:border-purple-500/25 rounded-3xl shadow-xl dark:shadow-[0_0_50px_-12px_rgba(168,85,247,0.2)] p-8 md:p-10 relative overflow-hidden neon-glow-violet"
        >
          {/* Subtle inside spotlight */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-purple-400 mb-4 shadow-inner shadow-purple-500/5">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              Access Portal
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </h2>
            <p className="mt-2 text-slate-500 dark:text-zinc-400 text-xs">
              Provide credentials to establish encrypted session.
            </p>
          </div>

          <LoginForm />
        </motion.div>

        {/* Footer Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 text-sm text-slate-600 dark:text-zinc-400"
        >
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors underline decoration-purple-500/30 underline-offset-4"
          >
            Create portal account
          </Link>
        </motion.p>
      </div>
    </motion.div>
  )
}
