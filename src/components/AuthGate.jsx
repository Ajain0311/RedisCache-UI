import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { APP_PASSWORD } from '../constants/auth'

/* Floating background grid */
function GridBg() {
  return (
    <div
      className="absolute inset-0 opacity-[0.04] pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(220,56,44,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(220,56,44,1) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }}
    />
  )
}

/* Subtle radial glow behind the card */
function CenterGlow() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        style={{
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,56,44,0.10) 0%, transparent 68%)',
        }}
      />
    </div>
  )
}

export default function AuthGate({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState(false)
  const [shaking,  setShaking]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const inputRef = useRef()

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!password.trim() || loading) return

    setLoading(true)
    await new Promise(r => setTimeout(r, 450))

    if (password === APP_PASSWORD) {
      onSuccess()
    } else {
      setLoading(false)
      setError(true)
      setShaking(true)
      setPassword('')
      setTimeout(() => {
        setShaking(false)
        setError(false)
        inputRef.current?.focus()
      }, 650)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#06091a] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5 }}
    >
      <GridBg />
      <CenterGlow />

      {/* ── Auth card ── */}
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.18, type: 'spring', stiffness: 130, damping: 22 }}
        className="relative w-full max-w-[360px] mx-4"
      >
        {/* Top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        {/* Card body */}
        <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/8 rounded-b-2xl rounded-t-none px-8 py-9 shadow-2xl shadow-black/70">

          {/* Shield icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 18 }}
            className="flex justify-center mb-7"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(220,56,44,0.12)',
                border: '1px solid rgba(220,56,44,0.28)',
                boxShadow: '0 0 24px rgba(220,56,44,0.18)',
              }}
            >
              <ShieldCheck className="w-8 h-8 text-red-400" />
            </div>
          </motion.div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Cache Vault</h2>
            <p className="text-slate-500 text-sm mt-1">Enter your password to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Input */}
            <motion.div
              animate={shaking ? { x: [-9, 9, -7, 7, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.42 }}
              className="relative mb-3"
            >
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />

              <input
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className={`w-full rounded-xl py-3 pl-11 pr-11 text-sm outline-none transition-all duration-200 placeholder:text-slate-600
                  ${error
                    ? 'bg-red-950/30 border border-red-500/60 text-red-200 focus:ring-2 focus:ring-red-500/25'
                    : 'bg-slate-800/70 border border-slate-700/80 text-slate-100 focus:ring-2 focus:ring-red-500/35 focus:border-red-500/45'
                  }`}
              />

              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs text-center mb-3"
                >
                  Incorrect password. Please try again.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={!password.trim() || loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              style={{
                background: 'linear-gradient(135deg, #b91c1c 0%, #DC382C 100%)',
                boxShadow: '0 0 22px rgba(220,56,44,0.28)',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Vault
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-700 text-xs mt-6 tracking-wider uppercase">
            Authorized access only
          </p>
        </div>

        {/* Bottom accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
      </motion.div>
    </motion.div>
  )
}
