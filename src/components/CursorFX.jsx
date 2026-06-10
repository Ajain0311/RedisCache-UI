import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CursorFX() {
  const [active,  setActive]  = useState(false) // mounted after first move
  const [isHover, setIsHover] = useState(false)
  const [isClick, setIsClick] = useState(false)

  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)

  const rx = useSpring(mx, { stiffness: 82, damping: 20, mass: 0.6 })
  const ry = useSpring(my, { stiffness: 82, damping: 20, mass: 0.6 })

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return // touch device

    const onMove = (e) => {
      mx.set(e.clientX)
      my.set(e.clientY)
      if (!active) setActive(true)
    }

    const onOver = (e) => {
      const t = e.target
      setIsHover(!!(
        t.closest('button') ||
        t.closest('a') ||
        t.tagName === 'INPUT' ||
        t.tagName === 'SELECT' ||
        t.getAttribute('role') === 'button'
      ))
    }

    const onDown  = () => setIsClick(true)
    const onUp    = () => setIsClick(false)

    window.addEventListener('mousemove',  onMove)
    window.addEventListener('mouseover',  onOver)
    window.addEventListener('mousedown',  onDown)
    window.addEventListener('mouseup',    onUp)
    return () => {
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mouseover',  onOver)
      window.removeEventListener('mousedown',  onDown)
      window.removeEventListener('mouseup',    onUp)
    }
  }, [active, mx, my])

  if (!active) return null

  return (
    <>
      {/* Outer aura — spring lag */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ x: rx, y: ry }}
      >
        <motion.div
          animate={{
            width:   isClick ? 18 : isHover ? 44 : 34,
            height:  isClick ? 18 : isHover ? 44 : 34,
            opacity: isHover ? 0.55 : 0.28,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            borderRadius: '50%',
            border: '1px solid rgba(220,56,44,0.9)',
            boxShadow: '0 0 16px rgba(220,56,44,0.35)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </motion.div>

      {/* Inner dot — immediate */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: mx, y: my }}
      >
        <motion.div
          animate={{ scale: isClick ? 0.55 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            width: 5, height: 5,
            borderRadius: '50%',
            background: '#DC382C',
            boxShadow: '0 0 9px 2px rgba(220,56,44,0.85)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </motion.div>
    </>
  )
}
