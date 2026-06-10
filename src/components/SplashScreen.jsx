import { useState, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SplashScene = lazy(() => import('./SplashScene'))

const DURATION = 4000 // ms — total splash duration

export default function SplashScreen({ onComplete }) {
  const [progress,   setProgress]   = useState(0)
  const [textPhase,  setTextPhase]  = useState(0)  // 0 → 1 → 2 → 3
  const [exiting,    setExiting]    = useState(false)

  /* ── Progress bar ── */
  useEffect(() => {
    const tick = 40
    const step = 100 / (DURATION / tick)
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(id); return 100 }
        return p + step
      })
    }, tick)
    return () => clearInterval(id)
  }, [])

  /* ── Text reveal sequence ── */
  useEffect(() => {
    const t1 = setTimeout(() => setTextPhase(1), 350)
    const t2 = setTimeout(() => setTextPhase(2), 800)
    const t3 = setTimeout(() => setTextPhase(3), 1300)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [])

  /* ── Auto-advance + skip ── */
  const doExit = () => {
    if (exiting) return
    setExiting(true)
    setTimeout(onComplete, 550)
  }

  useEffect(() => {
    const id = setTimeout(doExit, DURATION - 500)
    return () => clearTimeout(id)
  }, [])                                         // eslint-disable-line

  useEffect(() => {
    const handler = () => doExit()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [exiting])                                  // eslint-disable-line

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-[#06091a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
    >
      {/* 3D scene */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="w-full h-full bg-[#06091a]" />}>
          <SplashScene />
        </Suspense>
      </div>

      {/* Left-side darkening gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#06091a]/92 via-[#06091a]/55 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06091a]/75 via-transparent to-[#06091a]/45 pointer-events-none" />

      {/* ── Text content ── */}
      <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-20 max-w-3xl">

        {/* Label */}
        <AnimatePresence>
          {textPhase >= 1 && (
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-7"
            >
              <div className="h-px w-10 bg-red-500 shadow-[0_0_8px_rgba(220,56,44,0.9)]" />
              <span className="text-red-400/90 text-xs font-bold tracking-[0.28em] uppercase">
                Redis Cache Management
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main title */}
        <AnimatePresence>
          {textPhase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 90, damping: 16 }}
              className="mb-5"
            >
              <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight leading-none">
                <span
                  className="block"
                  style={{
                    color: '#DC382C',
                    textShadow: '0 0 40px rgba(220,56,44,0.55)',
                  }}
                >
                  Cache
                </span>
                <span className="block text-white">Vault</span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <AnimatePresence>
          {textPhase >= 3 && (
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="text-slate-400 text-base md:text-lg font-light leading-relaxed max-w-md"
            >
              Enterprise Redis visibility across<br />
              <span className="text-slate-300">DEV · TEST · UAT · PROD</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Skip hint */}
        <AnimatePresence>
          {textPhase >= 3 && !exiting && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 1.2 }}
              onClick={doExit}
              className="mt-10 text-xs text-slate-500 tracking-widest uppercase text-left hover:text-slate-400 transition-colors w-fit"
            >
              Press any key to skip →
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Version badge ── */}
      <div className="absolute top-5 right-6 text-slate-700 text-[10px] font-mono tracking-wider select-none">
        v1.0.0
      </div>

      {/* ── Redis wordmark top-right ── */}
      <AnimatePresence>
        {textPhase >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            className="absolute top-5 right-16 text-red-400 text-xs font-black tracking-[0.4em] uppercase select-none hidden md:block"
          >
            REDIS
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 inset-x-0">
        {/* Track */}
        <div className="h-px bg-slate-800/60" />
        {/* Fill */}
        <motion.div
          className="absolute bottom-0 left-0 h-px"
          style={{
            width:      `${progress}%`,
            background: 'linear-gradient(90deg, #7f1d1d, #DC382C, #ff6b6b)',
            boxShadow:  '0 0 14px rgba(220,56,44,0.8)',
          }}
        />
      </div>
    </motion.div>
  )
}
