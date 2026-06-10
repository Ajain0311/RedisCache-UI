import { useState, useMemo, useRef, useEffect, lazy, Suspense, useCallback } from 'react'
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
} from 'framer-motion'
import { RefreshCw, Search, LayoutGrid, List, AlignJustify, WifiOff, X } from 'lucide-react'
import { ENVS, ENV_KEYS } from './constants/envs'
import { useCacheKeys } from './hooks/useCacheKeys'
import Toast         from './components/Toast'
import KeyCards      from './components/KeyCards'
import ConfirmModal  from './components/ConfirmModal'
import SkeletonCards from './components/SkeletonCards'

const VaultScene = lazy(() => import('./components/VaultScene'))

const VIEWS = ['grid', 'list', 'compact']

export default function Dashboard() {
  const [env,          setEnv]          = useState('DEV')
  const [view,         setView]         = useState(() => localStorage.getItem('cv-view') || 'grid')
  const [search,       setSearch]       = useState('')
  const [source,       setSource]       = useState('all')
  const [toast,        setToast]        = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const toastTimer                       = useRef(null)
  const searchRef                        = useRef(null)

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

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA'

      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !inInput)) {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setSearch('')
        searchRef.current?.blur()
      }
      if (e.key === 'r' && !inInput && !loading && !deleteTarget) {
        fetchKeys()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [loading, fetchKeys, deleteTarget])

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

  /* Opens the custom confirm modal instead of window.confirm */
  function handleDeleteRequest(keyName, service) {
    setDeleteTarget({ keyName, service, env })
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    const { keyName, service } = deleteTarget
    setDeleteTarget(null)
    await deleteKey(keyName, service)
    clearTimeout(toastTimer.current)
    setToast(keyName)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  /* ── Hero mouse parallax ── */
  const heroRef  = useRef()
  const rawX     = useMotionValue(0)
  const rawY     = useMotionValue(0)
  const sx       = useSpring(rawX, { stiffness: 58, damping: 18 })
  const sy       = useSpring(rawY, { stiffness: 58, damping: 18 })
  const titleX   = useTransform(sx, v => v *  8)
  const titleY   = useTransform(sy, v => v *  5)
  const subX     = useTransform(sx, v => v * -5)
  const subY     = useTransform(sy, v => v * -3)

  const onHeroMove  = useCallback((e) => {
    const r = heroRef.current?.getBoundingClientRect()
    if (!r) return
    rawX.set((e.clientX - r.left) / r.width  * 2 - 1)
    rawY.set((e.clientY - r.top)  / r.height * 2 - 1)
  }, [rawX, rawY])

  const onHeroLeave = useCallback(() => { rawX.set(0); rawY.set(0) }, [rawX, rawY])

  /* ── Swipe to change view ── */
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
          animate={{ opacity: 1,  y: 0  }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center justify-center gap-2.5 py-2.5 text-xs font-semibold tracking-widest uppercase border-b ${envData.tw.border} bg-black/20`}
        >
          <motion.span
            animate={{ scale: [1, 1.45, 1], opacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`h-2 w-2 rounded-full ${envData.tw.dot}`}
          />
          <span className={envData.tw.text}>
            {envData.label} — {envData.host.replace('https://', '')}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* ── Hero ── */}
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#06091a]/87 via-[#06091a]/46 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#06091a] to-transparent pointer-events-none" />

        <div className="relative z-10 h-full flex items-center px-6 md:px-12 max-w-7xl mx-auto pointer-events-none">
          <div>
            {/* Title layer — parallax A */}
            <motion.div style={{ x: titleX, y: titleY }}>
              <motion.h1
                key={env}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1,  y: 0  }}
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

            {/* Subtitle layer — parallax B */}
            <motion.div style={{ x: subX, y: subY }} className="pointer-events-auto">
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
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEnvSwitch(k)}
                    className={`relative px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider transition-colors duration-200 ${
                      env === k ? ENVS[k].tw.active : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {k}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Drag-to-rotate hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 2 }}
          className="absolute bottom-9 right-6 text-[10px] text-slate-500 tracking-widest uppercase hidden md:block pointer-events-none"
        >
          Drag to rotate ↑
        </motion.p>
      </div>

      {/* ── Controls bar ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1,  y: 0  }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl p-3 space-y-2.5"
          style={{ background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}
        >
          {/* Row 1: search + view + sync */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-grow max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search keys… (/ or Ctrl+K)"
                className="w-full rounded-xl py-2 pl-10 pr-9 text-sm outline-none text-slate-200 placeholder:text-slate-600 transition-all"
                style={{ background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(220,56,44,0.45)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1" />

            {/* View toggle */}
            <div
              className="flex items-center gap-0.5 p-1 rounded-xl"
              style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {[
                { id: 'grid',    Icon: LayoutGrid,  label: 'Grid'    },
                { id: 'list',    Icon: List,         label: 'List'    },
                { id: 'compact', Icon: AlignJustify, label: 'Compact' },
              ].map(({ id, Icon, label }) => (
                <motion.button
                  key={id}
                  title={`${label} (swipe on mobile)`}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleViewChange(id)}
                  className={`p-2 rounded-lg transition-colors ${
                    view === id
                      ? 'text-red-400'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                  style={view === id ? { background: 'rgba(220,56,44,0.18)' } : {}}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>

            {/* Sync */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(220,56,44,0.38)' }}
              whileTap={{ scale: 0.93 }}
              onClick={fetchKeys}
              disabled={loading}
              title="Refresh (R)"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-shadow"
              style={{ background: 'linear-gradient(135deg, #991b1b, #DC382C)' }}
            >
              <motion.span
                animate={loading ? { rotate: 360 } : { rotate: 0 }}
                transition={loading ? { repeat: Infinity, duration: 0.85, ease: 'linear' } : {}}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.span>
              Sync
            </motion.button>
          </div>

          {/* Row 2: source filter pills */}
          {uniqueSources.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setSource('all')}
                className="shrink-0 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all"
                style={
                  source === 'all'
                    ? { background: 'rgba(220,56,44,0.18)', color: '#f87171', border: '1px solid rgba(220,56,44,0.3)' }
                    : { background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                All · {keys.length}
              </motion.button>
              {uniqueSources.map(s => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setSource(source === s ? 'all' : s)}
                  className="shrink-0 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all"
                  style={
                    source === s
                      ? { background: 'rgba(220,56,44,0.18)', color: '#f87171', border: '1px solid rgba(220,56,44,0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {s} · {sources[s]}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Keys section ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-20">

        {/* Count + hint */}
        {!loading && !error && keys.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-4"
          >
            <p className="text-xs text-slate-600">
              Showing{' '}
              <span className="text-slate-300 font-semibold">{filtered.length}</span>
              {' '}of{' '}
              <span className="text-slate-300 font-semibold">{keys.length}</span>
              {' '}keys
            </p>
            <p className="text-[10px] text-slate-700 hidden sm:block tracking-wider">
              Swipe ← → to switch view · Hover card to tilt · Drag orb to rotate
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {loading && <SkeletonCards key="skeleton" count={12} />}
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
            <KeyCards data={filtered} view={view} env={env} onDelete={handleDeleteRequest} />
          </motion.div>
        )}
      </div>

      <Toast message={toast} />

      {/* Custom delete confirmation modal */}
      <ConfirmModal
        target={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
