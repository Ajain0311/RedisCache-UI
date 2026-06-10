import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useRef, useMemo, Suspense } from 'react'

function VaultOrb({ color }) {
  const ring1 = useRef()
  const ring2 = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ring1.current) ring1.current.rotation.z = t * 0.35
    if (ring2.current) ring2.current.rotation.y = t * 0.2
  })

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.7}>
      {/* Core orb */}
      <mesh>
        <icosahedronGeometry args={[1.15, 4]} />
        <MeshDistortMaterial
          color={color}
          distort={0.32}
          speed={2.5}
          roughness={0.06}
          metalness={0.88}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Soft inner core */}
      <mesh>
        <sphereGeometry args={[0.88, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} />
      </mesh>

      {/* Equatorial ring */}
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.76, 0.018, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.72} />
      </mesh>

      {/* Tilted ring */}
      <mesh ref={ring2} rotation={[Math.PI / 3.8, 0.5, 0]}>
        <torusGeometry args={[2.18, 0.011, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.42} />
      </mesh>

      <pointLight color={color} intensity={5} distance={8} />
    </Float>
  )
}

function Particles({ color, count = 110 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r     = 2.8 + Math.random() * 2.4
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
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
      <pointsMaterial size={0.048} color={color} transparent opacity={0.82} sizeAttenuation />
    </points>
  )
}

function PostFX() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.14} luminanceSmoothing={0.88} intensity={2.2} />
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
      <VaultOrb color={envColor} />
      <Particles color={envColor} />
      <Stars radius={90} depth={45} count={700} factor={2.5} fade speed={0.3} />
      <Suspense fallback={null}>
        <PostFX />
      </Suspense>
    </Canvas>
  )
}
