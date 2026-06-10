import { AnimatePresence, motion } from 'framer-motion'
import { Trash2, Key, DatabaseZap } from 'lucide-react'

const CARD_COLORS = [
  'from-blue-500 to-cyan-400',
  'from-indigo-500 to-purple-400',
  'from-pink-500 to-rose-400',
  'from-emerald-400 to-teal-500',
]
const DOT_COLORS = ['bg-blue-500', 'bg-indigo-500', 'bg-pink-500', 'bg-emerald-500']

function GridCard({ item, index, env, onDelete }) {
  const color = CARD_COLORS[index % CARD_COLORS.length]
  return (
    <motion.div
      key={`${item.key}-${item.service}`}
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.018, 0.5) }}
      className="group relative bg-slate-800/50 backdrop-blur border border-white/6 hover:border-indigo-500/40 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md shrink-0`}>
          <Key className="w-4 h-4 text-white" />
        </div>
        <button
          onClick={() => onDelete(item.key, item.service)}
          className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-100 break-all leading-snug">{item.key}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mt-1">{item.service}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-[10px] text-slate-600 font-mono">{env}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </motion.div>
  )
}

function ListCard({ item, index, env, onDelete }) {
  const color = CARD_COLORS[index % CARD_COLORS.length]
  return (
    <motion.div
      key={`${item.key}-${item.service}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.012, 0.4) }}
      className="group flex items-center gap-3 bg-slate-800/40 hover:bg-indigo-500/10 backdrop-blur border border-white/5 hover:border-indigo-500/25 rounded-xl px-4 py-3 transition-all"
    >
      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
        <Key className="w-3 h-3 text-white" />
      </div>
      <span className="flex-1 text-sm font-medium text-slate-100 truncate">{item.key}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 shrink-0 hidden sm:block">{item.service}</span>
      <span className="text-[10px] text-slate-600 shrink-0 hidden lg:block">{env}</span>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <button
        onClick={() => onDelete(item.key, item.service)}
        className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

function CompactRow({ item, index, env, onDelete }) {
  return (
    <motion.div
      key={`${item.key}-${item.service}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.008, 0.3) }}
      className="group flex items-center gap-3 px-4 py-2 border-b border-white/5 hover:bg-white/5 transition-colors"
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${DOT_COLORS[index % DOT_COLORS.length]}`} />
      <span className="flex-1 text-xs font-mono text-slate-200 truncate">{item.key}</span>
      <span className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-wider shrink-0 hidden sm:block w-40 truncate text-right">{item.service}</span>
      <span className="text-[10px] text-slate-700 shrink-0 hidden lg:block w-8 text-right">{env}</span>
      <button
        onClick={() => onDelete(item.key, item.service)}
        className="p-1 rounded text-slate-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </motion.div>
  )
}

function Empty() {
  return (
    <div className="py-28 text-center opacity-40 border-2 border-dashed border-slate-800 rounded-3xl">
      <DatabaseZap className="w-14 h-14 mx-auto mb-3 text-slate-700" />
      <p className="text-lg font-semibold">Vault is empty</p>
      <p className="text-sm mt-1 text-slate-500">No keys match the current filter.</p>
    </div>
  )
}

export default function KeyCards({ data, view, env, onDelete }) {
  if (data.length === 0) return <Empty />

  return (
    <AnimatePresence mode="wait">
      {view === 'grid' && (
        <motion.div
          key="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden"
        >
          {data.map((item, i) => (
            <CompactRow key={`${item.key}|${item.service}`} item={item} index={i} env={env} onDelete={onDelete} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
