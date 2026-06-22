import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import BackToTop from '@/components/ui/BackToTop';

// Premium background particle configuration
const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: Math.random() * 18 + 12,
  delay: Math.random() * -10,
}));

export default function Layout({ children, showSidebar = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#05050f] text-slate-900 dark:text-zinc-50 relative overflow-hidden transition-colors duration-500">
      
      {/* Immersive glowing nebula dust spots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
        <motion.div
          animate={{
            scale: [1, 1.15, 0.9, 1],
            x: [0, 50, -30, 0],
            y: [0, -30, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 0.85, 1.1, 1],
            x: [0, -40, 50, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 -left-32 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Floating Sparkles & Particles emitter */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              y: [0, -150, 0],
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
            }}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.id % 2 === 0 ? '#a855f7' : '#6366f1',
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      <Navbar />

      {/* Main content – offset by navbar height */}
      <main className="flex-1 pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showSidebar ? (
            <div className="flex gap-8">
              <div className="flex-1 min-w-0">{children}</div>
              <Sidebar />
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}

