import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useRef, useMemo, useEffect, Suspense } from 'react'
import * as THREE from 'three'

const RED      = '#DC382C'
const RED_GLOW = '#ff6b6b'
const RED_HOT  = '#ffcccc'

/* ── Central morphing crystal ── */
function RedisCrystal() {
  const r1    = useRef()
  const r2    = useRef()
  const r3    = useRef()
  const pulse = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (r1.current)    r1.current.rotation.z  =  t * 0.42
    if (r2.current)    r2.current.rotation.x  = -t * 0.26
    if (r3.current) {  r3.current.rotation.y   =  t * 0.18; r3.current.rotation.z = t * 0.11 }
    if (pulse.current) pulse.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.042)
  })

  return (
    <Float speed={0.6} rotationIntensity={0.06} floatIntensity={0.28}>
      <group>
        <mesh ref={pulse}>
          <icosahedronGeometry args={[2.1, 5]} />
          <MeshDistortMaterial color={RED} distort={0.40} speed={1.5} roughness={0.02} metalness={0.98} emissive={RED} emissiveIntensity={1.4} />
        </mesh>

        {/* Holographic inner orb */}
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial color={RED_HOT} transparent opacity={0.05} />
        </mesh>

        {/* Wireframe cage */}
        <mesh>
          <icosahedronGeometry args={[2.18, 2]} />
          <meshBasicMaterial color={RED} transparent opacity={0.055} wireframe />
        </mesh>

        <mesh ref={r1} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.1, 0.025, 16, 128]} />
          <meshBasicMaterial color={RED} transparent opacity={0.88} />
        </mesh>
        <mesh ref={r2} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[3.9, 0.017, 16, 128]} />
          <meshBasicMaterial color={RED} transparent opacity={0.56} />
        </mesh>
        <mesh ref={r3} rotation={[0, Math.PI / 5, Math.PI / 3.2]}>
          <torusGeometry args={[4.75, 0.011, 16, 128]} />
          <meshBasicMaterial color={RED_GLOW} transparent opacity={0.38} />
        </mesh>

        <pointLight color={RED}      intensity={14} distance={22} />
        <pointLight color={RED_GLOW} intensity={5}  distance={12} position={[0,  4, 0]} />
        <pointLight color="#ff4444"  intensity={3}  distance={9}  position={[0, -4, 2]} />
      </group>
    </Float>
  )
}

/* ── 12 mini crystals in orbital rings ── */
function OrbitalShards() {
  const refs = useRef([])

  const shards = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      angle:     (i / 12) * Math.PI * 2,
      radius:    5.0 + (i % 4) * 1.2,
      yOffset:   (i % 2 ? 1 : -1) * (0.6 + (i % 4) * 0.4),
      scale:     0.09 + (i % 4) * 0.055,
      speed:     0.14 + (i % 5) * 0.038,
      tiltSpeed: 0.7  + (i % 3) * 0.6,
    }))
  , [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    shards.forEach((s, i) => {
      const el = refs.current[i]
      if (!el) return
      const a = s.angle + t * s.speed
      el.position.set(Math.cos(a) * s.radius, s.yOffset + Math.sin(t * 0.5 + s.angle) * 0.5, Math.sin(a) * s.radius)
      el.rotation.x = t * s.tiltSpeed
      el.rotation.z = t * s.tiltSpeed * 0.6
    })
  })

  return (
    <>
      {shards.map((s, i) => (
        <mesh key={i} ref={el => (refs.current[i] = el)} scale={s.scale}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial color={RED} distort={0.32} speed={2.8} emissive={RED} emissiveIntensity={0.95} metalness={0.95} roughness={0.05} />
        </mesh>
      ))}
    </>
  )
}

/* ── Hexagonal floor grid — instancedMesh for performance ── */
function HexGrid() {
  const ref  = useRef()
  const COLS = 11
  const ROWS = 8
  const COUNT = COLS * ROWS

  const hexCenters = useMemo(() => {
    const data = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = (col - COLS / 2 + 0.5) * 1.55 + (row % 2 ? 0.775 : 0)
        const z = (row - ROWS / 2 + 0.5) * 1.35
        data.push({ x: x * 2.4, z: z * 2.4, col, row })
      }
    }
    return data
  }, [])

  useEffect(() => {
    if (!ref.current) return
    const dummy = new THREE.Object3D()
    hexCenters.forEach(({ x, z }, i) => {
      dummy.position.set(x, -8, z)
      dummy.rotation.set(Math.PI / 2, 0, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [hexCenters])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t   = clock.elapsedTime
    const dummy = new THREE.Object3D()
    hexCenters.forEach(({ x, z, col, row }, i) => {
      const wave  = Math.sin(t * 0.75 + col * 0.42 + row * 0.55) * 0.22
      const scale = 0.82 + wave
      dummy.position.set(x, -8 + wave * 0.4, z)
      dummy.rotation.set(Math.PI / 2, 0, t * 0.02)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.rotation.y = t * 0.018
  })

  return (
    <instancedMesh ref={ref} args={[null, null, COUNT]}>
      <torusGeometry args={[0.44, 0.018, 6, 6]} />
      <meshBasicMaterial color={RED} transparent opacity={0.1} />
    </instancedMesh>
  )
}

/* ── Concentric energy rings pulsing outward ── */
function EnergyField() {
  const refs = useRef([])
  const RADII = [2.8, 3.5, 4.2, 4.9, 5.7]

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    RADII.forEach((_, i) => {
      const el = refs.current[i]
      if (!el) return
      const phase = ((t * 0.62 + i * 0.2) % 1)
      el.scale.setScalar(1 + phase * 0.3)
      el.material.opacity = (1 - phase) * 0.38
      el.rotation.z = t * (0.2 + i * 0.04) * (i % 2 ? 1 : -1)
    })
  })

  return (
    <>
      {RADII.map((r, i) => (
        <mesh key={i} ref={el => (refs.current[i] = el)}>
          <torusGeometry args={[r, 0.012, 16, 80]} />
          <meshBasicMaterial color={RED_GLOW} transparent />
        </mesh>
      ))}
    </>
  )
}

/* ── 3 sonar sphere pulses ── */
function SonarPulse() {
  const refs = useRef([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < 3; i++) {
      const el = refs.current[i]
      if (!el) return
      const phase = ((t * 0.36 + i / 3) % 1)
      el.scale.setScalar(2.2 + phase * 10)
      el.material.opacity = Math.max(0, (1 - phase) * 0.16)
    }
  })
  return (
    <>
      {[0, 1, 2].map(i => (
        <mesh key={i} ref={el => (refs.current[i] = el)}>
          <sphereGeometry args={[1, 28, 28]} />
          <meshBasicMaterial color={RED} transparent side={THREE.BackSide} />
        </mesh>
      ))}
    </>
  )
}

/* ── 600 warm-red galaxy particles ── */
function Particles({ count = 600 }) {
  const ref = useRef()
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r     = 6.5 + Math.random() * 15
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i*3+2] = r * Math.cos(phi)
      const b    = 0.5 + Math.random() * 0.5
      col[i*3]   = 0.82 + Math.random() * 0.18
      col[i*3+1] = Math.random() * 0.2  * b
      col[i*3+2] = Math.random() * 0.12 * b
    }
    return { positions: pos, colors: col }
  }, [count])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.026
      ref.current.rotation.x = clock.elapsedTime * 0.012
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.065} vertexColors transparent opacity={0.88} sizeAttenuation />
    </points>
  )
}

/* ── 22 data stream orbs shooting outward ── */
function DataStream({ startPos, endPos, speed }) {
  const ref   = useRef()
  const phase = useRef(Math.random())
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t    = ((clock.elapsedTime * speed + phase.current) % 1)
    ref.current.position.lerpVectors(startPos, endPos, t)
    const fade = t < 0.12 ? t / 0.12 : t > 0.72 ? 1 - (t - 0.72) / 0.28 : 1
    ref.current.material.opacity = fade
    ref.current.scale.setScalar(0.5 + fade * 0.9)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.058, 8, 8]} />
      <meshBasicMaterial color={RED_GLOW} transparent />
    </mesh>
  )
}

function DataStreams() {
  const streams = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => {
      const theta = (i / 22) * Math.PI * 2
      const phi   = Math.acos(2 * (i / 22) - 1)
      const dir   = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).normalize()
      return {
        startPos: dir.clone().multiplyScalar(2.4),
        endPos:   dir.clone().multiplyScalar(16),
        speed:    0.28 + (i % 6) * 0.08,
      }
    })
  , [])
  return <>{streams.map((s, i) => <DataStream key={i} {...s} />)}</>
}

/* ── Cinematic camera: zoom in + gentle lateral sway ── */
function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t     = clock.elapsedTime
    const p     = Math.min(t / 5.5, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    camera.position.z = 20 - eased * 8.5
    camera.position.y =  2  - eased * 1.0
    camera.position.x = Math.sin(t * 0.07) * 1.5
    camera.lookAt(0, 0, 0)
  })
  return null
}

function PostFX() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.06} luminanceSmoothing={0.92} intensity={3.6} />
      <Vignette eskil={false} offset={0.12} darkness={0.68} />
    </EffectComposer>
  )
}

export default function SplashScene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 20], fov: 52 }}
      gl={{ alpha: false, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#04060f']} />
      <ambientLight intensity={0.04} />
      <CameraRig />
      <RedisCrystal />
      <OrbitalShards />
      <HexGrid />
      <EnergyField />
      <SonarPulse />
      <Particles count={600} />
      <DataStreams />
      <Stars radius={160} depth={90} count={2500} factor={3.8} fade speed={0.12} />
      <Suspense fallback={null}>
        <PostFX />
      </Suspense>
    </Canvas>
  )
}
