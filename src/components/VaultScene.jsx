import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Stars, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useRef, useMemo, Suspense } from 'react'

function VaultOrb({ color }) {
  const ring1  = useRef()
  const ring2  = useRef()
  const ring3  = useRef()
  const pulseRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ring1.current)  ring1.current.rotation.z  =  t * 0.38
    if (ring2.current)  ring2.current.rotation.y  =  t * 0.22
    if (ring3.current) { ring3.current.rotation.x = t * 0.15; ring3.current.rotation.z = t * 0.09 }
    if (pulseRef.current) pulseRef.current.scale.setScalar(1 + Math.sin(t * 2.1) * 0.035)
  })

  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.65}>
      {/* Core orb */}
      <mesh ref={pulseRef}>
        <icosahedronGeometry args={[1.15, 4]} />
        <MeshDistortMaterial
          color={color}
          distort={0.35}
          speed={2.4}
          roughness={0.04}
          metalness={0.92}
          emissive={color}
          emissiveIntensity={0.75}
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.88, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} />
      </mesh>

      {/* Wireframe cage */}
      <mesh>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.055} wireframe />
      </mesh>

      {/* Ring 1 — equatorial */}
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.78, 0.019, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.78} />
      </mesh>

      {/* Ring 2 — diagonal */}
      <mesh ref={ring2} rotation={[Math.PI / 3.8, 0.5, 0]}>
        <torusGeometry args={[2.22, 0.012, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.46} />
      </mesh>

      {/* Ring 3 — random tilt */}
      <mesh ref={ring3} rotation={[0.2, Math.PI / 4, Math.PI / 3]}>
        <torusGeometry args={[2.7, 0.008, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      <pointLight color={color} intensity={7} distance={10} />
    </Float>
  )
}

/* ── 4 mini shards orbiting the hero orb ── */
function MiniShards({ color }) {
  const refs = useRef([])

  const shards = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      angle: (i / 4) * Math.PI * 2,
      radius: 2.8 + (i % 2) * 0.6,
      yOffset: (i % 2 ? 0.5 : -0.5),
      speed: 0.22 + i * 0.05,
      scale: 0.08 + (i % 3) * 0.04,
    }))
  , [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    shards.forEach((s, i) => {
      const el = refs.current[i]
      if (!el) return
      const a = s.angle + t * s.speed
      el.position.set(Math.cos(a) * s.radius, s.yOffset + Math.sin(t * 0.6 + s.angle) * 0.3, Math.sin(a) * s.radius)
      el.rotation.x = t * 1.2
      el.rotation.z = t * 0.8
    })
  })

  return (
    <>
      {shards.map((s, i) => (
        <mesh key={i} ref={el => (refs.current[i] = el)} scale={s.scale}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial color={color} distort={0.3} speed={3} emissive={color} emissiveIntensity={0.8} metalness={0.9} roughness={0.08} />
        </mesh>
      ))}
    </>
  )
}

function Particles({ color, count = 180 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r     = 2.8 + Math.random() * 3.2
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      arr[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      arr[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i*3+2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.04
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.82} sizeAttenuation />
    </points>
  )
}

function PostFX() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.12} luminanceSmoothing={0.88} intensity={2.4} />
    </EffectComposer>
  )
}

export default function VaultScene({ envColor }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 48 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.08} />
      <VaultOrb    color={envColor} />
      <MiniShards  color={envColor} />
      <Particles   color={envColor} count={180} />
      <Stars radius={90} depth={45} count={700} factor={2.5} fade speed={0.3} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.7}
        makeDefault
      />
      <Suspense fallback={null}>
        <PostFX />
      </Suspense>
    </Canvas>
  )
}
