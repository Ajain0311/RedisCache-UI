import { useState, useMemo, useRef, lazy, Suspense, useCallback } from 'react'
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
} from 'framer-motion'
import { RefreshCw, Search, LayoutGrid, List, AlignJustify, WifiOff } from 'lucide-react'
import { ENVS, ENV_KEYS } from './constants/envs'
import { useCacheKeys } from './hooks/useCacheKeys'
import Toast    from './components/Toast'
import KeyCards from './components/KeyCards'

const VaultScene = lazy(() => import('./components/VaultScene'))

const VIEWS = ['grid', 'list', 'compact']

export default function Dashboard() {
  const [env,    setEnv]    = useState('DEV')
  const [view,   setView]   = useState(() => localStorage.getItem('cv-view') || 'grid')
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('all')
  const [toast,  setToast]  = useState(null)
  const toastTimer           = useRef(null)

  const { keys, loading, error, fetchKeys, deleteKey } = useCacheKeys(env)

  const sources = useMemo(() => {
    const m = {}
    keys.forEach(k => { m[k.service] = (m[k.service] || 0) + 1 })
    return m
  }, [keys])

  const uniqueSources = useMemo(() => Object.keys(sources).sort(), [sources])

  const filtered = useMemo(() =>
    keys.filter(k =>
      k.key.toLowerCase().includes(search.toLowerCase()) &&
      (source === 'all' || k.service === source)
    ),
    [keys, search, source]
  )

  function handleEnvSwitch(e) {
    if (e === env) return
    setEnv(e)
    setSearch('')
    setSource('all')
  }

  function handleViewChange(v) {
    setView(v)
    localStorage.setItem('cv-view', v)
  }

  async function handleDelete(keyName, service) {
    if (!confirm(`Purge [${keyName}] from ${service} on ${env}?`)) return
    await deleteKey(keyName, service)
    clearTimeout(toastTimer.current)
    setToast(keyName)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  /* ── Hero parallax ── */
  const heroRef   = useRef()
  const rawX      = useMotionValue(0)
  const rawY      = useMotionValue(0)
  const springX   = useSpring(rawX, { stiffness: 60, damping: 18 })
  const springY   = useSpring(rawY, { stiffness: 60, damping: 18 })
  const titleX    = useTransform(springX, v => v *  8)
  const titleY    = useTransform(springY, v => v *  5)
  const subtitleX = useTransform(springX, v => v * -5)
  const subtitleY = useTransform(springY, v => v * -3)

  const onHeroMove = useCallback((e) => {
    const rect = heroRef.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set((e.clientX - rect.left) / rect.width  * 2 - 1)
    rawY.set((e.clientY - rect.top)  / rect.height * 2 - 1)
  }, [rawX, rawY])

  const onHeroLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  /* ── Swipe gesture: left = next view, right = prev view ── */
  const onSwipe = useCallback((_, info) => {
    const idx = VIEWS.indexOf(view)
    if (info.offset.x < -60 && idx < VIEWS.length - 1) handleViewChange(VIEWS[idx + 1])
    else if (info.offset.x > 60 && idx > 0)            handleViewChange(VIEWS[idx - 1])
  }, [view])

  const envData = ENVS[env]

  return (
    <div className="min-h-screen bg-[#06091a]">

      {/* ── Env banner ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={env}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center justify-center gap-2.5 py-2.5 text-xs font-semibold tracking-widest uppercase border-b ${envData.tw.border} bg-black/20`}
        >
          <motion.span
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`h-2 w-2 rounded-full ${envData.tw.dot}`}
          />
          <span className={envData.tw.text}>
            Connected to {envData.label} — {envData.host.replace('https://', '')}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* ── Hero: 3D canvas + parallax title overlay ── */}
      <div
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ height: 320 }}
        onMouseMove={onHeroMove}
        onMouseLeave={onHeroLeave}
      >
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <VaultScene envColor={envData.color} />
          </Suspense>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#06091a]/85 via-[#06091a]/48 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#06091a] to-transparent pointer-events-none" />

        <div className="relative z-10 h-full flex items-center px-6 md:px-12 max-w-7xl mx-auto pointer-events-none">
          <div>
            {/* Title — parallax layer A */}
            <motion.div style={{ x: titleX, y: titleY }}>
              <motion.h1
                key={env}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-4"
              >
                Cache{' '}
                <span style={{
                  background: `linear-gradient(130deg, ${envData.color} 0%, #c084fc 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Vault
                </span>
              </motion.h1>
            </motion.div>

            {/* Subtitle — parallax layer B (opposite direction) */}
            <motion.div style={{ x: subtitleX, y: subtitleY }} className="pointer-events-auto">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <motion.span
                  key={`${env}-${keys.length}`}
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                  className={`px-3.5 py-1 rounded-full text-sm font-bold ${envData.tw.badge}`}
                >
                  {keys.length} Keys
                </motion.span>
                <span className="text-slate-500 text-sm">across</span>
                <span className="text-slate-200 text-sm font-semibold">{uniqueSources.length} Sources</span>
              </div>

              {/* Env switcher */}
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur border border-white/8 rounded-2xl p-1.5 w-fit">
                {ENV_KEYS.map(k => (
                  <motion.button
                    key={k}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleEnvSwitch(k)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider transition-colors duration-200 ${
                      env === k ? ENVS[k].tw.active : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {env === k && (
                      <motion.span
                        layoutId="env-pill"
                        className={`absolute inset-0 rounded-xl ${ENVS[k].tw.active}`}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    {k}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3 bg-slate-900/70 backdrop-blur-xl border border-white/6 rounded-2xl p-3"
        >
          <select
            value={source}
            onChange={e => setSource(e.target.value)}
            className="bg-slate-800 border border-slate-700/80 rounded-xl py-2 px-3.5 text-sm outline-none focus:ring-2 focus:ring-red-500/35 text-slate-200 cursor-pointer transition-all"
          >
            <option value="all">All Sources ({keys.length})</option>
            {uniqueSources.map(s => (
              <option key={s} value={s}>{s} ({sources[s]})</option>
            ))}
          </select>

          <div className="relative flex-grow max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search keys..."
              className="w-full bg-slate-800/70 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-red-500/35 focus:border-red-500/45 text-slate-200 placeholder:text-slate-600 transition-all"
            />
          </div>

          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-slate-800 border border-slate-700/80 rounded-xl p-1">
            {[
              { id: 'grid',    Icon: LayoutGrid,  label: 'Grid' },
              { id: 'list',    Icon: List,         label: 'List' },
              { id: 'compact', Icon: AlignJustify, label: 'Compact' },
            ].map(({ id, Icon, label }) => (
              <motion.button
                key={id}
                title={label}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleViewChange(id)}
                className={`p-2 rounded-lg transition-colors ${
                  view === id ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>

          {/* Sync button — magnetic feel via spring whileHover */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 18px rgba(220,56,44,0.35)' }}
            whileTap={{ scale: 0.94 }}
            onClick={fetchKeys}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 disabled:opacity-50 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #DC382C 100%)' }}
          >
            <motion.span
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={loading ? { repeat: Infinity, duration: 0.9, ease: 'linear' } : {}}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.span>
            Sync
          </motion.button>
        </motion.div>
      </div>

      {/* ── Keys section — swipe left/right to change view ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-28 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-8 h-8 mx-auto mb-3 border-2 border-slate-700 border-t-red-500 rounded-full"
              />
              <p className="text-slate-400 text-sm font-medium">
                Fetching from <span className={`font-bold ${envData.tw.text}`}>{env}</span>…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-28 text-center border-2 border-dashed border-red-900/50 rounded-3xl"
          >
            <WifiOff className="w-12 h-12 mx-auto mb-3 text-red-600" />
            <p className="text-lg font-semibold text-red-400">Failed to fetch from {env}</p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchKeys}
              className="mt-5 px-4 py-2 bg-red-800/40 hover:bg-red-700/40 border border-red-500/30 rounded-xl text-sm text-red-300 transition-colors"
            >
              Retry
            </motion.button>
          </motion.div>
        )}

        {!loading && !error && (
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.04}
            onDragEnd={onSwipe}
          >
            <KeyCards data={filtered} view={view} env={env} onDelete={handleDelete} />
          </motion.div>
        )}
      </div>

      <Toast message={toast} />
    </div>
  )
}
