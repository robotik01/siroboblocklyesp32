import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, Wrench, Code, GraduationCap, Wifi, WifiOff, Settings } from 'lucide-react'
import { useRobot } from '../context/RobotContext'
import RobotMascot from '../components/RobotMascot'
import ConnectionModal from '../components/ConnectionModal'

function Home() {
  const navigate = useNavigate()
  const { connected, connectWebSocket } = useRobot()
  const [showConnectionModal, setShowConnectionModal] = React.useState(false)

  const menuItems = [
    {
      id: 'main',
      title: 'Ayo Main!',
      subtitle: 'Kontrol robotmu langsung',
      icon: Gamepad2,
      color: 'from-green-500 to-emerald-600',
      shadowColor: 'shadow-green-500/50',
      path: '/main'
    },
    {
      id: 'rakit',
      title: 'Ayo Rakit!',
      subtitle: 'Panduan merakit robot',
      icon: Wrench,
      color: 'from-orange-500 to-amber-600',
      shadowColor: 'shadow-orange-500/50',
      path: '/rakit'
    },
    {
      id: 'program',
      title: 'Ayo Program!',
      subtitle: 'Buat program dengan Blockly',
      icon: Code,
      color: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/50',
      path: '/program'
    },
    {
      id: 'latihan',
      title: 'Ayo Latihan!',
      subtitle: 'Belajar step by step',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-600',
      shadowColor: 'shadow-purple-500/50',
      path: '/latihan'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 flex flex-col overflow-hidden">
      {/* Header */}
      <motion.header 
        className="flex items-center justify-between px-6 py-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <img src="/robot-icon.svg" alt="Sirobo" className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-display text-white tracking-wide">
              <span className="gradient-text">SIROBO</span>
            </h1>
            <p className="text-xs text-indigo-300">Belajar Coding Robot Menyenangkan!</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            className={`flex items-center gap-2 px-4 py-2 rounded-full glass ${connected ? 'text-green-400' : 'text-red-400'}`}
            onClick={() => setShowConnectionModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {connected ? <Wifi size={20} /> : <WifiOff size={20} />}
            <span className="text-sm font-semibold">
              {connected ? 'Terhubung' : 'Tidak Terhubung'}
            </span>
          </motion.button>

          <motion.button
            className="p-2 rounded-full glass text-white/70 hover:text-white"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings size={24} />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-4 gap-8">
        {/* Robot Mascot */}
        <motion.div 
          className="hidden lg:flex flex-col items-center"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <RobotMascot />
          <motion.div 
            className="mt-4 px-6 py-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-white font-semibold text-lg">Halo! Aku Sirobo! 🤖</p>
            <p className="text-indigo-200 text-sm">Ayo belajar coding bersama!</p>
          </motion.div>
        </motion.div>

        {/* Menu Grid */}
        <motion.div 
          className="grid grid-cols-2 gap-6 max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              variants={itemVariants}
              className={`relative group p-6 rounded-3xl bg-gradient-to-br ${item.color} shadow-lg ${item.shadowColor} btn-bounce overflow-hidden`}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Sparkles */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-2xl">✨</span>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center gap-3">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <item.icon size={40} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-display text-white">{item.title}</h3>
                  <p className="text-sm text-white/80 mt-1">{item.subtitle}</p>
                </div>
              </div>

              {/* Bottom decoration */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        className="px-6 py-3 text-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-indigo-300 text-sm">
          🚀 Versi 1.0 • Dibuat dengan ❤️ untuk anak-anak Indonesia
        </p>
      </motion.footer>

      {/* Connection Modal */}
      {showConnectionModal && (
        <ConnectionModal onClose={() => setShowConnectionModal(false)} />
      )}
    </div>
  )
}

export default Home
