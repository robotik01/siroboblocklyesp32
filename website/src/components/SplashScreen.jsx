import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, Trail, Sparkles } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

// Animated 3D Robot for Splash Screen
function SplashRobot() {
  const groupRef = useRef()
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftWheelRef = useRef()
  const rightWheelRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (groupRef.current) {
      // Floating motion
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.15
    }

    if (headRef.current) {
      // Head bobbing
      headRef.current.rotation.z = Math.sin(t * 2) * 0.1
    }

    if (leftArmRef.current && rightArmRef.current) {
      // Waving arms
      leftArmRef.current.rotation.z = Math.sin(t * 3) * 0.3 + 0.5
      rightArmRef.current.rotation.z = -Math.sin(t * 3 + 1) * 0.3 - 0.5
    }

    if (leftWheelRef.current && rightWheelRef.current) {
      // Spinning wheels
      leftWheelRef.current.rotation.x += 0.05
      rightWheelRef.current.rotation.x += 0.05
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} scale={1.5}>
        {/* Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.8, 1.4]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            metalness={0.6} 
            roughness={0.3}
            emissive="#1e40af"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Body accent */}
        <mesh position={[0, 0, 0.71]}>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
          <meshStandardMaterial 
            color="#f59e0b" 
            metalness={0.8} 
            roughness={0.2}
            emissive="#d97706"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, 0.7, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 0.6, 0.8]} />
            <meshStandardMaterial 
              color="#60a5fa" 
              metalness={0.5} 
              roughness={0.3}
              emissive="#3b82f6"
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Eyes */}
          <mesh position={[-0.2, 0.05, 0.41]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial 
              color="#fff" 
              emissive="#fff"
              emissiveIntensity={1}
            />
          </mesh>
          <mesh position={[0.2, 0.05, 0.41]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial 
              color="#fff" 
              emissive="#fff"
              emissiveIntensity={1}
            />
          </mesh>

          {/* Eye pupils */}
          <mesh position={[-0.2, 0.05, 0.53]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[0.2, 0.05, 0.53]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>

          {/* Antenna */}
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.3]} />
            <meshStandardMaterial color="#6b7280" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color="#ef4444" 
              emissive="#ef4444"
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Smile */}
          <mesh position={[0, -0.15, 0.41]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.75, 0.1, 0]}>
          <mesh>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <meshStandardMaterial 
              color="#6b7280" 
              metalness={0.7} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial 
              color="#f59e0b" 
              metalness={0.6}
            />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.75, 0.1, 0]}>
          <mesh>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <meshStandardMaterial 
              color="#6b7280" 
              metalness={0.7} 
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial 
              color="#f59e0b" 
              metalness={0.6}
            />
          </mesh>
        </group>

        {/* Left Wheel */}
        <group position={[-0.65, -0.5, 0]} ref={leftWheelRef}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 32]} />
            <meshStandardMaterial 
              color="#1f2937" 
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.16, 16]} />
            <meshStandardMaterial 
              color="#f59e0b" 
              metalness={0.8}
            />
          </mesh>
        </group>

        {/* Right Wheel */}
        <group position={[0.65, -0.5, 0]} ref={rightWheelRef}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 32]} />
            <meshStandardMaterial 
              color="#1f2937" 
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.16, 16]} />
            <meshStandardMaterial 
              color="#f59e0b" 
              metalness={0.8}
            />
          </mesh>
        </group>

        {/* LED Strip */}
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[-0.4 + i * 0.2, -0.3, 0.71]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'][i]}
              emissive={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'][i]}
              emissiveIntensity={1}
            />
          </mesh>
        ))}
      </group>

      {/* Sparkles around robot */}
      <Sparkles 
        count={50} 
        scale={5} 
        size={3} 
        speed={0.5}
        color="#f59e0b"
      />
    </Float>
  )
}

// Energy ring effect
function EnergyRing() {
  const ringRef = useRef()
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02
      ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <mesh ref={ringRef} position={[0, -0.5, -1]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2, 0.02, 8, 64]} />
      <meshStandardMaterial 
        color="#3b82f6"
        emissive="#3b82f6"
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animate progress over 1 second
    const duration = 1000
    const startTime = Date.now()

    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(elapsed / duration, 1)
      setProgress(newProgress)

      if (newProgress < 1) {
        requestAnimationFrame(animateProgress)
      } else {
        // Add a small delay before calling onComplete
        setTimeout(onComplete, 200)
      }
    }

    requestAnimationFrame(animateProgress)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.4 }}
    >
      {/* 3D Canvas */}
      <div className="w-full h-[60%]">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#a855f7" />
          <spotLight
            position={[0, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            color="#3b82f6"
          />

          <Stars 
            radius={100} 
            depth={50} 
            count={3000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1}
          />

          <EnergyRing />
          <SplashRobot />
        </Canvas>
      </div>

      {/* Text and Progress */}
      <motion.div 
        className="flex flex-col items-center gap-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h1 
          className="text-6xl font-display font-bold"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SIROBO
          </span>
        </motion.h1>

        <motion.p 
          className="text-indigo-200 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          🚀 Belajar Coding Robot Menyenangkan!
        </motion.p>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mt-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <motion.p 
          className="text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Memuat...
        </motion.p>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-4 text-center">
        <p className="text-indigo-300/50 text-xs">
          Versi 1.0 • Made with ❤️ in Indonesia
        </p>
      </div>
    </motion.div>
  )
}

export default SplashScreen
