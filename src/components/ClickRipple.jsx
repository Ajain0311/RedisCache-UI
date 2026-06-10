import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

let _uid = 0

export default function ClickRipple() {
  const [ripples, setRipples] = useState([])

  const onRemove = useCallback((id) => {
    setRipples(r => r.filter(x => x.id !== id))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      setRipples(r => [
        ...r.slice(-12),
        { id: _uid++, x: e.clientX, y: e.clientY },
      ])
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9996]">
      <AnimatePresence>
        {ripples.map(r => (
          <RippleItem key={r.id} x={r.x} y={r.y} onDone={() => onRemove(r.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function RippleItem({ x, y, onDone }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x - 22, top: y - 22 }}
      initial={{ scale: 0.1, opacity: 0.75 }}
      animate={{ scale: 4.5, opacity: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 0.61, 0.36, 1] }}
      onAnimationComplete={onDone}
    >
      <div
        style={{
          width: 44, height: 44,
          borderRadius: '50%',
          border: '1.5px solid rgba(220,56,44,0.65)',
          boxShadow: 'inset 0 0 10px rgba(220,56,44,0.2)',
        }}
      />
    </motion.div>
  )
}
