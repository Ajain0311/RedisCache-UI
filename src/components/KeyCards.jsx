import { useRef, useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2, Key, DatabaseZap, Copy, Check } from 'lucide-react'

const CARD_COLORS = [
  'from-red-500     to-rose-400',
  'from-blue-500    to-cyan-400',
  'from-indigo-500  to-purple-400',
  'from-emerald-400 to-teal-500',
]
const DOT_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-indigo-500', 'bg-emerald-500']

/* ── Copy-to-clipboard button ── */
function CopyBtn({ text, compact = false }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback((e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }).catch(() => {})
  }, [text])

  const size = compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
  return (
    <motion.button
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.8 }}
      onClick={copy}
      title="Copy key"
      className={`p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
        copied
          ? 'text-emerald-400 bg-emerald-500/10'
          : 'text-slate-700 hover:text-sky-400 hover:bg-sky-500/10'
      }`}
    >
      <AnimatePresence mode="wait">
        {copied
          ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: 'block' }}>
              <Check className={size} />
            </motion.span>
          : <motion.span key="copy"  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: 'block' }}>
              <Copy className={size} />
            </motion.span>
        }
      </AnimatePresence>
    </motion.button>
  )
}

/* ── 3D tilt per card ── */
function useTilt() {
  const ref = useRef()
  const onMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2
    el.style.transform  = `perspective(560px) rotateX(${-y * 9}deg) rotateY(${x * 9}deg) scale3d(1.04,1.04,1.04)`
    el.style.transition = 'transform 0.09s ease-out, box-shadow 0.09s ease-out'
    el.style.boxShadow  = `${-x * 10}px ${-y * 10}px 26px rgba(220,56,44,0.16), 0 0 0 1px rgba(220,56,44,0.22)`
  }, [])
  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform  = ''
    el.style.transition = 'transform 0.55s ease-out, box-shadow 0.55s ease-out'
    el.style.boxShadow  = ''
  }, [])
  return { ref, onMouseMove, onMouseLeave }
}

/* ── Grid card ── */
function GridCard({ item, index, env, onDelete }) {
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const { ref, onMouseMove, onMouseLeave } = useTilt()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75, y: -12, filter: 'blur(6px)' }}
      transition={{ duration: 0.26, delay: Math.min(index * 0.018, 0.5) }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ willChange: 'transform' }}
      className="group relative rounded-2xl p-4 flex flex-col gap-3 cursor-default overflow-hidden"
      style={{ background: 'rgba(30,41,59,0.55)', border: '1px solid rgba(255,255,255,0.06)', willChange: 'transform', transition: 'border-color 0.2s' }}
    >
      {/* Hover shine */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(220,56,44,0.09) 0%, transparent 65%)' }}
      />

      <div className="flex items-start justify-between relative z-10">
        <motion.div
          whileHover={{ scale: 1.12, rotate: 6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md shrink-0`}
        >
          <Key className="w-4 h-4 text-white" />
        </motion.div>
        <div className="flex items-center gap-0.5">
          <CopyBtn text={item.key} />
          <motion.button
            whileHover={{ scale: 1.2, rotate: -10 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => onDelete(item.key, item.service)}
            className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 relative z-10">
        <p className="text-sm font-semibold text-slate-100 break-all leading-snug">{item.key}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/80 mt-1">{item.service}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 relative z-10">
        <span className="text-[10px] text-slate-600 font-mono">{env}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </motion.div>
  )
}

/* ── List row ── */
function ListCard({ item, index, env, onDelete }) {
  const color = CARD_COLORS[index % CARD_COLORS.length]
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, filter: 'blur(3px)' }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.012, 0.4) }}
      whileHover={{ x: 3 }}
      className="group flex items-center gap-3 backdrop-blur rounded-xl px-4 py-3 transition-colors"
      style={{ background: 'rgba(30,41,59,0.42)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <motion.div
        whileHover={{ scale: 1.15, rotate: 6 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}
      >
        <Key className="w-3 h-3 text-white" />
      </motion.div>
      <span className="flex-1 text-sm font-medium text-slate-100 truncate font-mono">{item.key}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-red-400/75 shrink-0 hidden sm:block">{item.service}</span>
      <span className="text-[10px] text-slate-600 shrink-0 hidden lg:block">{env}</span>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <CopyBtn text={item.key} />
      <motion.button
        whileHover={{ scale: 1.2, rotate: -10 }}
        whileTap={{ scale: 0.8 }}
        onClick={() => onDelete(item.key, item.service)}
        className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-colors shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  )
}

/* ── Compact row ── */
function CompactRow({ item, index, env, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.008, 0.3) }}
      whileHover={{ backgroundColor: 'rgba(220,56,44,0.04)' }}
      className="group flex items-center gap-3 px-4 py-2 border-b border-white/5 transition-colors"
    >
      <motion.span whileHover={{ scale: 1.6 }} className={`h-1.5 w-1.5 rounded-full shrink-0 ${DOT_COLORS[index % DOT_COLORS.length]}`} />
      <span className="flex-1 text-xs font-mono text-slate-200 truncate">{item.key}</span>
      <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-wider shrink-0 hidden sm:block w-40 truncate text-right">{item.service}</span>
      <span className="text-[10px] text-slate-700 shrink-0 hidden lg:block w-8 text-right">{env}</span>
      <CopyBtn text={item.key} compact />
      <motion.button
        whileHover={{ scale: 1.2, rotate: -10 }}
        whileTap={{ scale: 0.8 }}
        onClick={() => onDelete(item.key, item.service)}
        className="p-1 rounded text-slate-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-colors shrink-0"
      >
        <Trash2 className="w-3 h-3" />
      </motion.button>
    </motion.div>
  )
}

/* ── Empty state ── */
function Empty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-28 text-center opacity-40 border-2 border-dashed border-slate-800 rounded-3xl"
    >
      <motion.div
        animate={{ rotate: [0, 6, -6, 0], y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      >
        <DatabaseZap className="w-14 h-14 mx-auto mb-3 text-slate-700" />
      </motion.div>
      <p className="text-lg font-semibold">Vault is empty</p>
      <p className="text-sm mt-1 text-slate-500">No keys match the current filter.</p>
    </motion.div>
  )
}

export default function KeyCards({ data, view, env, onDelete }) {
  if (data.length === 0) return <Empty />

  return (
    <AnimatePresence mode="wait">
      {view === 'grid' && (
        <motion.div
          key="grid"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3"
        >
          {data.map((item, i) => (
            <GridCard key={`${item.key}|${item.service}`} item={item} index={i} env={env} onDelete={onDelete} />
          ))}
        </motion.div>
      )}

      {view === 'list' && (
        <motion.div
          key="list"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col gap-1.5"
        >
          {data.map((item, i) => (
            <ListCard key={`${item.key}|${item.service}`} item={item} index={i} env={env} onDelete={onDelete} />
          ))}
        </motion.div>
      )}

      {view === 'compact' && (
        <motion.div
          key="compact"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(15,23,42,0.65)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {data.map((item, i) => (
            <CompactRow key={`${item.key}|${item.service}`} item={item} index={i} env={env} onDelete={onDelete} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
