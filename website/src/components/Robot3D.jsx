import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 3D Robot model using Three.js primitives
// For production, you can replace this with a GLTF/GLB model

function Robot3D({ highlight = 'all', scale = 1, step = 0 }) {
  const groupRef = useRef()
  
  // Animate specific parts based on highlight
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  const highlightColor = new THREE.Color('#ff9500')
  const normalColor = new THREE.Color('#3b82f6')
  const darkColor = new THREE.Color('#1e3a5f')
  const metalColor = new THREE.Color('#6b7280')

  const isHighlighted = (part) => {
    if (highlight === 'all') return true
    return highlight === part
  }

  const getColor = (part) => {
    return isHighlighted(part) ? highlightColor : normalColor
  }

  const getOpacity = (part) => {
    if (highlight === 'all') return 1
    return isHighlighted(part) ? 1 : 0.3
  }

  return (
    <group ref={groupRef} scale={scale}>
      {/* Base Chassis */}
      <group position={[0, 0, 0]}>
        {/* Main body plate */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.6, 0.1, 2]} />
          <meshStandardMaterial 
            color={getColor('chassis')} 
            transparent 
            opacity={getOpacity('chassis')}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>

        {/* Top cover */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1.4, 0.2, 1.8]} />
          <meshStandardMaterial 
            color={getColor('chassis')} 
            transparent 
            opacity={getOpacity('chassis')}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* Wheels and Motors */}
      <group>
        {/* Left wheel */}
        <group position={[-0.9, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
            <meshStandardMaterial 
              color={isHighlighted('chassis') ? '#374151' : '#1f2937'} 
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
          {/* Wheel hub */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.05, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.16, 16]} />
            <meshStandardMaterial 
              color={isHighlighted('chassis') ? metalColor : '#374151'} 
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Right wheel */}
        <group position={[0.9, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
            <meshStandardMaterial 
              color={isHighlighted('chassis') ? '#374151' : '#1f2937'} 
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.05, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.16, 16]} />
            <meshStandardMaterial 
              color={isHighlighted('chassis') ? metalColor : '#374151'} 
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Caster wheel (back) */}
        <mesh position={[0, -0.1, -0.7]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Motor Driver L298N */}
      <mesh position={[0, 0.4, -0.3]}>
        <boxGeometry args={[0.7, 0.15, 0.5]} />
        <meshStandardMaterial 
          color={isHighlighted('motor_driver') ? '#dc2626' : '#7f1d1d'} 
          transparent 
          opacity={getOpacity('motor_driver')}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
      {/* Heatsink */}
      <mesh position={[0, 0.5, -0.3]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial 
          color={isHighlighted('motor_driver') ? metalColor : '#4b5563'} 
          transparent 
          opacity={getOpacity('motor_driver')}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* ESP32 Wemos S2 Mini */}
      <mesh position={[0, 0.4, 0.2]}>
        <boxGeometry args={[0.4, 0.08, 0.6]} />
        <meshStandardMaterial 
          color={isHighlighted('esp32') ? '#22c55e' : '#166534'} 
          transparent 
          opacity={getOpacity('esp32')}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
      {/* USB Port */}
      <mesh position={[0, 0.42, 0.55]}>
        <boxGeometry args={[0.12, 0.05, 0.1]} />
        <meshStandardMaterial 
          color={isHighlighted('esp32') ? metalColor : '#6b7280'} 
          transparent 
          opacity={getOpacity('esp32')}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Line Follower Sensor Array */}
      <group position={[0, -0.05, 0.9]}>
        <mesh>
          <boxGeometry args={[1.2, 0.05, 0.2]} />
          <meshStandardMaterial 
            color={isHighlighted('line_sensor') ? '#8b5cf6' : '#4c1d95'} 
            transparent 
            opacity={getOpacity('line_sensor')}
            metalness={0.2}
            roughness={0.6}
          />
        </mesh>
        {/* Individual sensors */}
        {[-0.5, -0.35, -0.2, -0.05, 0.1, 0.25, 0.4, 0.55].map((x, i) => (
          <mesh key={i} position={[x - 0.025, 0.03, 0]}>
            <boxGeometry args={[0.08, 0.02, 0.15]} />
            <meshStandardMaterial 
              color={isHighlighted('line_sensor') ? '#000000' : '#1f2937'} 
              transparent 
              opacity={getOpacity('line_sensor')}
            />
          </mesh>
        ))}
      </group>

      {/* IMU MPU6050 */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.25, 0.05, 0.2]} />
        <meshStandardMaterial 
          color={isHighlighted('imu') ? '#06b6d4' : '#164e63'} 
          transparent 
          opacity={getOpacity('imu')}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* OLED Display */}
      <group position={[0, 0.55, 0.6]}>
        {/* Frame */}
        <mesh>
          <boxGeometry args={[0.45, 0.25, 0.05]} />
          <meshStandardMaterial 
            color={isHighlighted('oled') ? '#312e81' : '#1e1b4b'} 
            transparent 
            opacity={getOpacity('oled')}
          />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[0.38, 0.18]} />
          <meshBasicMaterial 
            color={isHighlighted('oled') ? '#60a5fa' : '#1e3a5f'}
            transparent 
            opacity={getOpacity('oled')}
          />
        </mesh>
      </group>

      {/* Ultrasonic Sensor */}
      <group position={[0, 0.35, 1.05]}>
        <mesh>
          <boxGeometry args={[0.5, 0.3, 0.15]} />
          <meshStandardMaterial 
            color={isHighlighted('ultrasonic') ? '#06b6d4' : '#164e63'} 
            transparent 
            opacity={getOpacity('ultrasonic')}
          />
        </mesh>
        {/* Transducer eyes */}
        <mesh position={[-0.12, 0, 0.08]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial 
            color={isHighlighted('ultrasonic') ? metalColor : '#4b5563'} 
            transparent 
            opacity={getOpacity('ultrasonic')}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0.12, 0, 0.08]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial 
            color={isHighlighted('ultrasonic') ? metalColor : '#4b5563'} 
            transparent 
            opacity={getOpacity('ultrasonic')}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* WS2812 LEDs */}
      <mesh position={[-0.5, 0.4, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={isHighlighted('leds') ? '#f97316' : '#7c2d12'} 
          transparent 
          opacity={getOpacity('leds')}
          emissive={isHighlighted('leds') ? '#f97316' : '#000000'}
          emissiveIntensity={isHighlighted('leds') ? 0.5 : 0}
        />
      </mesh>
      <mesh position={[0.5, 0.4, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={isHighlighted('leds') ? '#22c55e' : '#166534'} 
          transparent 
          opacity={getOpacity('leds')}
          emissive={isHighlighted('leds') ? '#22c55e' : '#000000'}
          emissiveIntensity={isHighlighted('leds') ? 0.5 : 0}
        />
      </mesh>

      {/* LDR Sensors */}
      <mesh position={[-0.6, 0.25, 0.8]}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
        <meshStandardMaterial 
          color={isHighlighted('leds') ? '#eab308' : '#713f12'} 
          transparent 
          opacity={getOpacity('leds')}
        />
      </mesh>
      <mesh position={[0.6, 0.25, 0.8]}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
        <meshStandardMaterial 
          color={isHighlighted('leds') ? '#eab308' : '#713f12'} 
          transparent 
          opacity={getOpacity('leds')}
        />
      </mesh>

      {/* Push Buttons */}
      {[[-0.4, -0.5], [0.4, -0.5], [-0.4, -0.3], [0.4, -0.3]].map(([x, z], i) => (
        <group key={i} position={[x, 0.5, z]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
            <meshStandardMaterial 
              color={isHighlighted('leds') ? ['#ef4444', '#22c55e', '#3b82f6', '#eab308'][i] : '#374151'} 
              transparent 
              opacity={getOpacity('leds')}
            />
          </mesh>
        </group>
      ))}

      {/* Battery pack */}
      <mesh position={[0, 0.18, -0.6]}>
        <boxGeometry args={[0.8, 0.2, 0.4]} />
        <meshStandardMaterial 
          color={isHighlighted('chassis') ? '#1f2937' : '#111827'} 
          transparent 
          opacity={getOpacity('chassis')}
        />
      </mesh>
    </group>
  )
}

export default Robot3D
