import { motion } from 'framer-motion'

function Shimmer({ delay = 0, className = '', style = {} }) {
  return (
    <motion.div
      animate={{ opacity: [0.45, 0.75, 0.45] }}
      transition={{ repeat: Infinity, duration: 1.7, ease: 'easeInOut', delay }}
      className={`bg-slate-700/55 rounded-lg ${className}`}
      style={style}
    />
  )
}

function SkeletonCard({ index }) {
  const d = (index % 6) * 0.09
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'rgba(30,41,59,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-start justify-between">
        <Shimmer delay={d} className="w-9 h-9 !rounded-xl" />
        <Shimmer delay={d + 0.1} className="w-6 h-6 !rounded-lg opacity-50" />
      </div>
      <div className="flex-1 space-y-2.5">
        <Shimmer delay={d + 0.05} className="h-3" style={{ width: `${52 + (index * 19) % 40}%` }} />
        <Shimmer delay={d + 0.12} className="h-2.5 w-1/3 opacity-60" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <Shimmer delay={d + 0.08} className="h-2 w-9 opacity-50" />
        <Shimmer delay={d + 0.14} className="h-1.5 w-1.5 !rounded-full opacity-50" />
      </div>
    </div>
  )
}

export default function SkeletonCards({ count = 12 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </motion.div>
  )
}
