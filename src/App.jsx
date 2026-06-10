import { useState, useCallback, lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Dashboard from './Dashboard'
import CursorFX   from './components/CursorFX'
import ClickRipple from './components/ClickRipple'

// Lazy-load heavy screens so they don't block initial paint
const SplashScreen = lazy(() => import('./components/SplashScreen'))
const AuthGate     = lazy(() => import('./components/AuthGate'))

/**
 * Phase state machine:
 *   splash  →  auth  →  app
 *
 * Protected: Dashboard never renders until phase === 'app'.
 * URL manipulation cannot bypass this (no routing involved).
 */
export default function App() {
  const [phase, setPhase] = useState('splash')

  const handleSplashDone = useCallback(() => setPhase('auth'), [])
  const handleAuthSuccess = useCallback(() => setPhase('app'), [])

  return (
    <>
      <CursorFX />
      <ClickRipple />
      {/* Splash + auth share AnimatePresence so exit/enter are sequenced */}
      <AnimatePresence mode="wait">
        {phase === 'splash' && (
          <Suspense key="splash" fallback={null}>
            <SplashScreen onComplete={handleSplashDone} />
          </Suspense>
        )}

        {phase === 'auth' && (
          <Suspense key="auth" fallback={null}>
            <AuthGate onSuccess={handleAuthSuccess} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Dashboard mounts only after auth succeeds */}
      <AnimatePresence>
        {phase === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
