import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

export default function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-950/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl px-4 py-3 shadow-2xl shadow-black/40 max-w-xs"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-300 leading-tight">Key Deleted</p>
            <p className="text-xs text-slate-400 truncate max-w-[170px] mt-0.5">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
