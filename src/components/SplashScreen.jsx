import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SplashScene = lazy(() => import('./SplashScene'))

const DURATION = 6000

const STATUS = [
  { pct: 0,  text: 'Establishing Redis connection…' },
  { pct: 22, text: 'Loading cache topology…'        },
  { pct: 50, text: 'Syncing key manifest…'           },
  { pct: 78, text: 'Vault ready.'                    },
]

/* ── Per-character animated title ── */
function AnimChar({ char, delay }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 38, rotateX: 85 }}
      animate={{ opacity: 1, y: 0,  rotateX: 0  }}
      transition={{ delay, type: 'spring', stiffness: 105, damping: 14 }}
      style={{ display: 'inline-block' }}
    >
      {char}
    </motion.span>
  )
}

export default function SplashScreen({ onComplete }) {
  const [progress,  setProgress]  = useState(0)
  const [textPhase, setTextPhase] = useState(0)
  const [exiting,   setExiting]   = useState(false)

  /* Progress bar */
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

  /* Text reveal phases */
  useEffect(() => {
    const t1 = setTimeout(() => setTextPhase(1), 350)
    const t2 = setTimeout(() => setTextPhase(2), 820)
    const t3 = setTimeout(() => setTextPhase(3), 1400)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [])

  const doExit = () => {
    if (exiting) return
    setExiting(true)
    setTimeout(onComplete, 560)
  }

  /* Auto-advance */
  useEffect(() => {
    const id = setTimeout(doExit, DURATION - 500)
    return () => clearTimeout(id)
  }, [])  // eslint-disable-line

  /* Skip on keydown */
  useEffect(() => {
    const h = () => doExit()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [exiting])  // eslint-disable-line

  /* Current status text */
  const statusText = useMemo(() => {
    let text = STATUS[0].text
    for (const s of STATUS) { if (progress >= s.pct) text = s.text }
    return text
  }, [progress])

  const cacheChars = 'Cache'.split('')
  const vaultChars = 'Vault'.split('')

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-[#04060f]"
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.56, ease: 'easeInOut' }}
    >
      {/* 3D scene */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="w-full h-full bg-[#04060f]" />}>
          <SplashScene />
        </Suspense>
      </div>

      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#04060f]/94 via-[#04060f]/55 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04060f]/80 via-transparent to-[#04060f]/50 pointer-events-none" />

      {/* ── Text content ── */}
      <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-20 max-w-3xl" style={{ perspective: '800px' }}>

        {/* Label */}
        <AnimatePresence>
          {textPhase >= 1 && (
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-px w-10 bg-red-500" style={{ boxShadow: '0 0 9px rgba(220,56,44,1)' }} />
              <span className="text-red-400/90 text-xs font-bold tracking-[0.28em] uppercase">
                Redis Cache Management
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main title — letter-by-letter flip */}
        <AnimatePresence>
          {textPhase >= 2 && (
            <div className="mb-6">
              <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight leading-none">
                <span className="block" style={{ color: '#DC382C', textShadow: '0 0 42px rgba(220,56,44,0.55)' }}>
                  {cacheChars.map((c, i) => (
                    <AnimChar key={i} char={c} delay={i * 0.065} />
                  ))}
                </span>
                <span className="block text-white">
                  {vaultChars.map((c, i) => (
                    <AnimChar key={i} char={c} delay={0.28 + i * 0.065} />
                  ))}
                </span>
              </h1>
            </div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <AnimatePresence>
          {textPhase >= 3 && (
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="text-slate-400 text-base md:text-lg font-light leading-relaxed max-w-sm mb-10"
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
              animate={{ opacity: 0.32 }}
              transition={{ delay: 1.0 }}
              onClick={doExit}
              className="text-xs text-slate-500 tracking-widest uppercase text-left hover:text-slate-400 transition-colors w-fit"
            >
              Press any key to skip →
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Top-right badges ── */}
      <div className="absolute top-5 right-6 flex items-center gap-3">
        <AnimatePresence>
          {textPhase >= 1 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              className="text-red-400 text-xs font-black tracking-[0.4em] uppercase select-none hidden md:block"
            >
              REDIS
            </motion.span>
          )}
        </AnimatePresence>
        <span className="text-slate-700 text-[10px] font-mono tracking-wider select-none">v2.0.0</span>
      </div>

      {/* ── Bottom: status + progress bar ── */}
      <div className="absolute bottom-0 inset-x-0">
        {/* Status text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.45, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="text-[10px] text-slate-400 font-mono tracking-wider px-6 pb-3 text-right"
          >
            {statusText}
          </motion.p>
        </AnimatePresence>

        {/* Track */}
        <div className="h-[2px] bg-slate-800/60" />
        {/* Fill */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{
            width:      `${progress}%`,
            background: 'linear-gradient(90deg, #7f1d1d, #DC382C, #ff6b6b)',
            boxShadow:  '0 0 16px rgba(220,56,44,0.85)',
            transition: 'width 0.04s linear',
          }}
        />
      </div>
    </motion.div>
  )
}
