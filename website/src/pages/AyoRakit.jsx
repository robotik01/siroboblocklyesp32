import React, { useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PresentationControls, Environment, Float, Html } from '@react-three/drei'
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Check, 
  Wrench, Cpu, Cog, Zap, Eye, RotateCcw, ZoomIn, ZoomOut,
  Package, CircuitBoard
} from 'lucide-react'
import Robot3D from '../components/Robot3D'

const assemblySteps = [
  {
    id: 1,
    title: 'Persiapan Komponen',
    description: 'Siapkan semua komponen yang diperlukan untuk merakit robot Sirobo.',
    icon: Package,
    color: 'from-blue-500 to-cyan-500',
    components: [
      { name: 'Wemos Lolin S2 Mini', qty: 1, icon: '🔌' },
      { name: 'Motor DC + Roda', qty: 2, icon: '⚙️' },
      { name: 'Driver L298N', qty: 1, icon: '🎛️' },
      { name: 'MPU6050 (IMU)', qty: 1, icon: '🧭' },
      { name: 'OLED 0.96"', qty: 1, icon: '📺' },
      { name: 'LED WS2812', qty: 2, icon: '💡' },
      { name: 'Sensor Line (8ch)', qty: 1, icon: '📊' },
      { name: 'Sensor LDR', qty: 2, icon: '☀️' },
      { name: 'Sensor Ultrasonik', qty: 1, icon: '📡' },
      { name: 'Push Button', qty: 4, icon: '🔘' },
      { name: 'Baterai Li-Ion', qty: 2, icon: '🔋' },
      { name: 'Chassis Robot', qty: 1, icon: '🤖' },
    ],
    highlight: 'all'
  },
  {
    id: 2,
    title: 'Pasang Chassis dan Motor',
    description: 'Pasang kedua motor DC pada chassis robot. Pastikan arah motor berlawanan untuk gerakan yang benar.',
    icon: Cog,
    color: 'from-orange-500 to-red-500',
    tips: [
      'Motor kiri dan kanan harus sejajar',
      'Kencangkan baut dengan kuat',
      'Pasang roda setelah motor terpasang'
    ],
    highlight: 'chassis'
  },
  {
    id: 3,
    title: 'Pasang Driver Motor L298N',
    description: 'Hubungkan driver L298N ke chassis dan sambungkan kabel motor.',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    wiring: [
      { from: 'Motor Kiri +', to: 'OUT1', color: '#ef4444' },
      { from: 'Motor Kiri -', to: 'OUT2', color: '#000000' },
      { from: 'Motor Kanan +', to: 'OUT3', color: '#ef4444' },
      { from: 'Motor Kanan -', to: 'OUT4', color: '#000000' },
      { from: 'VCC', to: 'Baterai +', color: '#ef4444' },
      { from: 'GND', to: 'Baterai -', color: '#000000' },
    ],
    highlight: 'motor_driver'
  },
  {
    id: 4,
    title: 'Pasang ESP32 Wemos S2 Mini',
    description: 'Tempatkan ESP32 di posisi tengah chassis dan hubungkan ke driver motor.',
    icon: Cpu,
    color: 'from-green-500 to-emerald-500',
    wiring: [
      { from: 'GPIO 5', to: 'IN1 (L298N)', color: '#3b82f6' },
      { from: 'GPIO 6', to: 'IN2 (L298N)', color: '#3b82f6' },
      { from: 'GPIO 7', to: 'IN3 (L298N)', color: '#3b82f6' },
      { from: 'GPIO 8', to: 'IN4 (L298N)', color: '#3b82f6' },
      { from: 'GPIO 9', to: 'ENA (L298N)', color: '#22c55e' },
      { from: 'GPIO 10', to: 'ENB (L298N)', color: '#22c55e' },
      { from: '3.3V', to: 'VCC Sensor', color: '#ef4444' },
      { from: 'GND', to: 'GND Sensor', color: '#000000' },
    ],
    highlight: 'esp32'
  },
  {
    id: 5,
    title: 'Pasang Sensor Line Follower',
    description: 'Pasang 8 sensor photodioda di bagian bawah depan robot.',
    icon: Eye,
    color: 'from-purple-500 to-pink-500',
    wiring: [
      { from: 'Sensor 1-4', to: 'GPIO 1-4', color: '#a855f7' },
      { from: 'Sensor 5-8', to: 'GPIO 11-14', color: '#a855f7' },
    ],
    tips: [
      'Jarak sensor ke lantai: 5-10mm',
      'Sensor 1 & 8 untuk deteksi belokan',
      'Sensor 2-7 untuk tracking garis'
    ],
    highlight: 'line_sensor'
  },
  {
    id: 6,
    title: 'Pasang IMU MPU6050',
    description: 'Pasang sensor IMU di tengah robot untuk deteksi orientasi.',
    icon: Wrench,
    color: 'from-cyan-500 to-blue-500',
    wiring: [
      { from: 'SDA', to: 'GPIO 35 (SDA)', color: '#06b6d4' },
      { from: 'SCL', to: 'GPIO 36 (SCL)', color: '#06b6d4' },
      { from: 'VCC', to: '3.3V', color: '#ef4444' },
      { from: 'GND', to: 'GND', color: '#000000' },
    ],
    tips: [
      'Pasang sensor dengan posisi datar',
      'Gunakan I2C address 0x68',
      'Kalibrasi sebelum penggunaan'
    ],
    highlight: 'imu'
  },
  {
    id: 7,
    title: 'Pasang OLED Display',
    description: 'Pasang layar OLED 0.96" untuk menampilkan status robot.',
    icon: CircuitBoard,
    color: 'from-indigo-500 to-purple-500',
    wiring: [
      { from: 'SDA', to: 'GPIO 35 (SDA)', color: '#6366f1' },
      { from: 'SCL', to: 'GPIO 36 (SCL)', color: '#6366f1' },
      { from: 'VCC', to: '3.3V', color: '#ef4444' },
      { from: 'GND', to: 'GND', color: '#000000' },
    ],
    tips: [
      'OLED dan MPU6050 berbagi bus I2C',
      'Address OLED: 0x3C',
      'Pasang di posisi yang mudah terlihat'
    ],
    highlight: 'oled'
  },
  {
    id: 8,
    title: 'Pasang Sensor Jarak',
    description: 'Pasang sensor ultrasonik di depan robot untuk deteksi halangan.',
    icon: Eye,
    color: 'from-pink-500 to-rose-500',
    wiring: [
      { from: 'TRIG', to: 'GPIO 16', color: '#ec4899' },
      { from: 'ECHO', to: 'GPIO 17', color: '#ec4899' },
      { from: 'VCC', to: '5V', color: '#ef4444' },
      { from: 'GND', to: 'GND', color: '#000000' },
    ],
    highlight: 'ultrasonic'
  },
  {
    id: 9,
    title: 'Pasang LED dan Finishing',
    description: 'Pasang LED WS2812, push button, dan sensor LDR. Rapikan semua kabel.',
    icon: Zap,
    color: 'from-amber-500 to-yellow-500',
    wiring: [
      { from: 'LED Data', to: 'GPIO 18', color: '#f59e0b' },
      { from: 'Button 1-4', to: 'GPIO 37-40', color: '#8b5cf6' },
      { from: 'LDR Kiri', to: 'GPIO 15', color: '#eab308' },
      { from: 'LDR Kanan', to: 'GPIO 21', color: '#eab308' },
    ],
    tips: [
      'Gunakan kabel ties untuk merapikan',
      'Pastikan tidak ada kabel yang terjepit roda',
      'Cek kembali semua koneksi'
    ],
    highlight: 'leds'
  },
  {
    id: 10,
    title: 'Selesai! 🎉',
    description: 'Robot Sirobo sudah selesai dirakit! Saatnya upload program dan bermain!',
    icon: Check,
    color: 'from-green-500 to-emerald-500',
    tips: [
      'Hubungkan baterai',
      'Upload firmware via USB',
      'Kalibrasi motor dan sensor',
      'Mulai bermain dengan Ayo Main!'
    ],
    highlight: 'all'
  }
]

function AyoRakit() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [autoRotate, setAutoRotate] = useState(true)

  const step = assemblySteps[currentStep]

  const nextStep = () => {
    if (currentStep < assemblySteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <motion.button
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-display text-white">Ayo Rakit! 🔧</h1>
            <p className="text-orange-300 text-sm">Panduan merakit robot Sirobo</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1">
            {assemblySteps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
                  index === currentStep 
                    ? 'bg-orange-400' 
                    : index < currentStep 
                      ? 'bg-green-400' 
                      : 'bg-white/20'
                }`}
                onClick={() => setCurrentStep(index)}
                whileHover={{ scale: 1.3 }}
              />
            ))}
          </div>
          <span className="text-white/70 text-sm">
            Step {currentStep + 1} / {assemblySteps.length}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - 3D View */}
        <div className="flex-1 relative">
          <Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
            <Suspense fallback={
              <Html center>
                <div className="text-white text-xl">Loading 3D Model...</div>
              </Html>
            }>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              
              <PresentationControls
                global
                config={{ mass: 2, tension: 500 }}
                snap={{ mass: 4, tension: 1500 }}
                rotation={[0, 0.3, 0]}
                polar={[-Math.PI / 3, Math.PI / 3]}
                azimuth={[-Math.PI / 1.4, Math.PI / 2]}
              >
                <Float rotationIntensity={autoRotate ? 0.4 : 0}>
                  <Robot3D 
                    highlight={step.highlight} 
                    scale={zoom}
                    step={currentStep}
                  />
                </Float>
              </PresentationControls>
              
              <Environment preset="city" />
            </Suspense>
          </Canvas>

          {/* 3D Controls */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <motion.button
              className="p-3 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
              onClick={() => setZoom(Math.min(2, zoom + 0.2))}
              whileTap={{ scale: 0.9 }}
            >
              <ZoomIn size={20} />
            </motion.button>
            <motion.button
              className="p-3 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
              whileTap={{ scale: 0.9 }}
            >
              <ZoomOut size={20} />
            </motion.button>
            <motion.button
              className={`p-3 rounded-xl backdrop-blur-sm text-white ${autoRotate ? 'bg-orange-500' : 'bg-white/10 hover:bg-white/20'}`}
              onClick={() => setAutoRotate(!autoRotate)}
              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw size={20} />
            </motion.button>
          </div>

          {/* 3D Tip */}
          <div className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-black/30 backdrop-blur-sm text-white/70 text-sm">
            💡 Geser untuk memutar model 3D
          </div>
        </div>

        {/* Right - Step Info */}
        <div className="w-96 p-6 border-l border-white/10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${step.color} mb-6`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/20">
                    <step.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <span className="text-white/70 text-sm">Step {step.id}</span>
                    <h2 className="text-xl font-display text-white">{step.title}</h2>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/80 text-lg mb-6">{step.description}</p>

              {/* Components list */}
              {step.components && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">📦 Komponen yang Dibutuhkan:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {step.components.map((component, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/10"
                      >
                        <span className="text-xl">{component.icon}</span>
                        <div>
                          <p className="text-white text-sm">{component.name}</p>
                          <p className="text-white/50 text-xs">x{component.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wiring diagram */}
              {step.wiring && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">🔌 Diagram Pengkabelan:</h3>
                  <div className="space-y-2">
                    {step.wiring.map((wire, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/10"
                      >
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: wire.color }}
                        />
                        <span className="text-white text-sm flex-1">{wire.from}</span>
                        <span className="text-white/50">→</span>
                        <span className="text-white text-sm flex-1">{wire.to}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {step.tips && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">💡 Tips:</h3>
                  <ul className="space-y-2">
                    {step.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-white/80">
                        <span className="text-green-400">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-auto pt-4 border-t border-white/10">
            <motion.button
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                currentStep === 0 
                  ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              onClick={prevStep}
              disabled={currentStep === 0}
              whileHover={currentStep > 0 ? { scale: 1.02 } : {}}
              whileTap={currentStep > 0 ? { scale: 0.98 } : {}}
            >
              <ChevronLeft size={20} />
              Sebelumnya
            </motion.button>
            <motion.button
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                currentStep === assemblySteps.length - 1
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
              onClick={currentStep === assemblySteps.length - 1 ? () => navigate('/program') : nextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {currentStep === assemblySteps.length - 1 ? (
                <>
                  Mulai Program!
                  <Check size={20} />
                </>
              ) : (
                <>
                  Selanjutnya
                  <ChevronRight size={20} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AyoRakit
