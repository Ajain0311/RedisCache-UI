import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, X } from 'lucide-react'

export default function ConfirmModal({ target, onConfirm, onCancel }) {
  useEffect(() => {
    if (!target) return
    const h = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [target, onCancel])

  return (
    <AnimatePresence>
      {target && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onCancel}
            className="fixed inset-0 z-[200] bg-black/78 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.80, y: 36 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={  { opacity: 0, scale: 0.86, y: 22  }}
              transition={{ type: 'spring', stiffness: 190, damping: 22 }}
              className="w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 pointer-events-auto"
              style={{ background: '#0c1220', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Top red accent line */}
              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #DC382C, transparent)' }} />

              <div className="p-6 pt-7">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate:   0 }}
                  transition={{ delay: 0.08, type: 'spring', stiffness: 230, damping: 14 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: 'rgba(220,56,44,0.11)',
                    border:     '1px solid rgba(220,56,44,0.28)',
                    boxShadow:  '0 0 30px rgba(220,56,44,0.14)',
                  }}
                >
                  <AlertTriangle className="w-7 h-7 text-red-400" />
                </motion.div>

                <h2 className="text-xl font-bold text-white text-center mb-1 tracking-tight">
                  Delete Cache Key?
                </h2>
                <p className="text-slate-500 text-sm text-center mb-6">
                  This will permanently remove the key from <span className="text-slate-300 font-semibold">{target?.env}</span>.
                </p>

                {/* Key info card */}
                <div
                  className="rounded-xl p-4 mb-6"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">Cache Key</p>
                  <p className="text-sm font-mono text-slate-100 break-all leading-relaxed mb-3">
                    {target?.keyName}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(220,56,44,0.12)', color: '#f87171', border: '1px solid rgba(220,56,44,0.22)' }}
                    >
                      {target?.service}
                    </span>
                    <span className="text-[10px] text-slate-600">·</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{target?.env}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCancel}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-300 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(220,56,44,0.45)' }}
                    whileTap={{ scale: 0.93 }}
                    onClick={onConfirm}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-shadow"
                    style={{ background: 'linear-gradient(135deg, #991b1b 0%, #DC382C 100%)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </motion.button>
                </div>
              </div>

              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(220,56,44,0.22), transparent)' }} />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
