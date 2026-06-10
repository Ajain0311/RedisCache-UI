import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useRef, useMemo, Suspense } from 'react'
import * as THREE from 'three'

const RED      = '#DC382C'
const RED_DARK = '#b91c1c'
const RED_GLOW = '#ff6b6b'

/* ── Central Redis crystal ── */
function RedisCrystal() {
  const r1 = useRef()
  const r2 = useRef()
  const r3 = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (r1.current) r1.current.rotation.z  =  t * 0.45
    if (r2.current) r2.current.rotation.x  = -t * 0.28
    if (r3.current) { r3.current.rotation.y = t * 0.2; r3.current.rotation.z = t * 0.12 }
  })

  return (
    <Float speed={0.7} rotationIntensity={0.08} floatIntensity={0.35}>
      <group>
        {/* Core */}
        <mesh>
          <icosahedronGeometry args={[1.6, 5]} />
          <MeshDistortMaterial
            color={RED}
            distort={0.28}
            speed={1.8}
            roughness={0.04}
            metalness={0.96}
            emissive={RED}
            emissiveIntensity={0.75}
          />
        </mesh>

        {/* Soft inner halo */}
        <mesh>
          <sphereGeometry args={[1.22, 32, 32]} />
          <meshBasicMaterial color={RED} transparent opacity={0.06} />
        </mesh>

        {/* Ring 1 — equatorial */}
        <mesh ref={r1} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.45, 0.022, 16, 120]} />
          <meshBasicMaterial color={RED} transparent opacity={0.82} />
        </mesh>

        {/* Ring 2 — diagonal */}
        <mesh ref={r2} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[3.05, 0.014, 16, 120]} />
          <meshBasicMaterial color={RED} transparent opacity={0.52} />
        </mesh>

        {/* Ring 3 — random tilt */}
        <mesh ref={r3} rotation={[0, Math.PI / 5, Math.PI / 3.2]}>
          <torusGeometry args={[3.65, 0.009, 16, 120]} />
          <meshBasicMaterial color={RED_GLOW} transparent opacity={0.32} />
        </mesh>

        <pointLight color={RED}  intensity={7}  distance={14} />
        <pointLight color={RED_GLOW} intensity={3} distance={8} position={[0, 3.5, 0]} />
      </group>
    </Float>
  )
}

/* ── Orbiting particles ── */
function Particles({ count = 200 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r     = 4.5 + Math.random() * 9
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.035
      ref.current.rotation.x = clock.elapsedTime * 0.018
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.055} color={RED} transparent opacity={0.78} sizeAttenuation />
    </points>
  )
}

/* ── Data streams: small glowing orbs that shoot outward ── */
function DataStream({ startPos, endPos, speed }) {
  const ref   = useRef()
  const phase = useRef(Math.random()) // stagger start time

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = ((clock.elapsedTime * speed + phase.current) % 1)
    ref.current.position.lerpVectors(startPos, endPos, t)
    ref.current.material.opacity = t < 0.15 ? t / 0.15 : t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color={RED} transparent />
    </mesh>
  )
}

function DataStreams() {
  const streams = useMemo(() => {
    const result = []
    for (let i = 0; i < 14; i++) {
      const theta = (i / 14) * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const dir   = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).normalize()
      result.push({
        startPos: dir.clone().multiplyScalar(2),
        endPos:   dir.clone().multiplyScalar(13),
        speed:    0.35 + Math.random() * 0.35,
      })
    }
    return result
  }, [])

  return (
    <>
      {streams.map((s, i) => <DataStream key={i} {...s} />)}
    </>
  )
}

/* ── Camera slowly zooms in ── */
function CameraRig() {
  useFrame(({ camera, clock }) => {
    const progress = Math.min(clock.elapsedTime / 3.5, 1)
    const eased    = 1 - Math.pow(1 - progress, 3) // ease out cubic
    camera.position.z = 15 - eased * 3.5
    camera.position.y = 1  - eased * 0.6
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ── Bloom post-processing ── */
function PostFX() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.88} intensity={2.6} />
    </EffectComposer>
  )
}

/* ── Exported scene ── */
export default function SplashScene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 15], fov: 50 }}
      gl={{ alpha: false, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#06091a']} />
      <ambientLight intensity={0.05} />
      <CameraRig />
      <RedisCrystal />
      <Particles />
      <DataStreams />
      <Stars radius={110} depth={60} count={1200} factor={3} fade speed={0.2} />
      <Suspense fallback={null}>
        <PostFX />
      </Suspense>
    </Canvas>
  )
}
