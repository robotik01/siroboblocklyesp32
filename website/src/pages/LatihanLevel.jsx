import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Star, Check, X, ChevronRight, ChevronLeft,
  Play, RotateCcw, Lightbulb, Volume2, Award
} from 'lucide-react'
import { useRobot } from '../context/RobotContext'
import { initBlocklyWorkspace, generateLiveCommands, loadWorkspace, simpleToolbox } from '../blockly'

// Tutorial configurations for each level
const tutorialConfigs = {
  beginner: {
    1: {
      title: 'Mengenal Blok',
      goal: 'Pelajari cara menggunakan blok di Blockly',
      hints: [
        'Klik kategori "Gerakan" di sebelah kiri',
        'Drag blok "Robot Maju" ke area kerja',
        'Selamat! Kamu sudah menambah blok pertama!'
      ],
      steps: [
        {
          instruction: 'Selamat datang di Sirobo! 🤖',
          highlight: null,
          action: 'next'
        },
        {
          instruction: 'Klik kategori "🚗 Gerakan" di sebelah kiri',
          highlight: 'toolbox-gerakan',
          action: 'click'
        },
        {
          instruction: 'Bagus! Sekarang drag blok "Robot Maju" ke area kerja',
          highlight: 'block-robot_maju',
          action: 'drag'
        },
        {
          instruction: 'Hebat! 🎉 Kamu sudah membuat blok pertama!',
          highlight: null,
          action: 'complete'
        }
      ],
      initialBlocks: null,
      requiredBlocks: ['robot_maju'],
      successMessage: 'Kamu sudah belajar cara menambah blok!',
    },
    2: {
      title: 'Robot Maju',
      goal: 'Buat robot bergerak maju dengan kecepatan 50%',
      hints: [
        'Tambahkan blok "Robot Maju"',
        'Atur kecepatan menjadi 50',
        'Klik tombol "Jalankan"'
      ],
      steps: [
        {
          instruction: 'Mari buat robot bergerak maju!',
          highlight: null,
          action: 'next'
        },
        {
          instruction: 'Tambahkan blok "Robot Maju" dari kategori Gerakan',
          highlight: 'toolbox-gerakan',
          action: 'add_block'
        },
        {
          instruction: 'Klik angka di blok dan ketik 50',
          highlight: 'block-number',
          action: 'edit'
        },
        {
          instruction: 'Klik tombol hijau "JALANKAN" di bawah!',
          highlight: 'run-button',
          action: 'run'
        }
      ],
      requiredBlocks: ['robot_maju'],
      successMessage: 'Robot bergerak maju! 🚗',
    },
    3: {
      title: 'Maju dan Berhenti',
      goal: 'Buat robot maju lalu berhenti',
      hints: [
        'Tambahkan blok "Robot Maju"',
        'Tambahkan blok "Tunggu" setelahnya',
        'Tambahkan blok "Robot Berhenti"'
      ],
      requiredBlocks: ['robot_maju', 'tunggu', 'robot_stop'],
      successMessage: 'Sempurna! Robot maju lalu berhenti!',
    },
    4: {
      title: 'Belok Kiri Kanan',
      goal: 'Buat robot belok kiri lalu kanan',
      hints: [
        'Tambahkan blok "Belok Kiri"',
        'Tambahkan blok "Tunggu"',
        'Tambahkan blok "Belok Kanan"'
      ],
      requiredBlocks: ['robot_belok_kiri', 'robot_belok_kanan'],
      successMessage: 'Bagus! Robot bisa berbelok!',
    },
    5: {
      title: 'Nyalakan LED',
      goal: 'Nyalakan LED dengan warna merah',
      hints: [
        'Buka kategori "LED"',
        'Tambahkan blok "LED nyala"',
        'Pilih warna merah'
      ],
      requiredBlocks: ['led_nyala'],
      successMessage: 'LED menyala! 💡',
    },
    6: {
      title: 'Mainkan Musik',
      goal: 'Buat robot memainkan melodi',
      hints: [
        'Buka kategori "Suara"',
        'Tambahkan blok "Mainkan melodi"'
      ],
      requiredBlocks: ['bunyi_melody'],
      successMessage: 'Robot bernyanyi! 🎵',
    },
    7: {
      title: 'Perulangan',
      goal: 'Ulangi gerakan 3 kali',
      hints: [
        'Buka kategori "Perulangan"',
        'Tambahkan blok "ulangi"',
        'Masukkan blok gerakan ke dalamnya',
        'Atur jumlah perulangan menjadi 3'
      ],
      requiredBlocks: ['controls_repeat_ext', 'robot_maju'],
      successMessage: 'Kamu sudah belajar perulangan!',
    },
    8: {
      title: 'Tunggu Sebentar',
      goal: 'Buat jeda antar gerakan',
      hints: [
        'Tambahkan gerakan',
        'Tambahkan blok "Tunggu"',
        'Atur waktu tunggu'
      ],
      requiredBlocks: ['tunggu'],
      successMessage: 'Sempurna!',
    },
    9: {
      title: 'Kombinasi Gerakan',
      goal: 'Buat pola: maju, belok kiri, maju, belok kanan',
      hints: [
        'Susun blok gerakan secara berurutan',
        'Tambahkan tunggu di antara gerakan'
      ],
      requiredBlocks: ['robot_maju', 'robot_belok_kiri', 'robot_belok_kanan'],
      successMessage: 'Pola gerakan sempurna!',
    },
    10: {
      title: 'Tantangan Awal',
      goal: 'Buat robot menari dengan LED dan musik!',
      hints: [
        'Gabungkan gerakan, LED, dan musik',
        'Gunakan perulangan untuk efek lebih keren'
      ],
      requiredBlocks: ['robot_maju', 'led_nyala', 'bunyi_melody'],
      successMessage: '🏆 Selamat! Kamu telah menyelesaikan Latihan Awal!',
      isBoss: true,
    }
  },
  advanced: {
    1: {
      title: 'Sensor Garis',
      goal: 'Baca nilai sensor garis dan tampilkan',
      requiredBlocks: ['sensor_garis'],
      successMessage: 'Kamu sudah bisa membaca sensor!',
    },
    2: {
      title: 'Kondisi If-Else',
      goal: 'Buat keputusan berdasarkan sensor',
      requiredBlocks: ['controls_if', 'sensor_garis'],
      successMessage: 'Logika kondisi berhasil!',
    },
    3: {
      title: 'Line Follower Dasar',
      goal: 'Buat robot mengikuti garis',
      requiredBlocks: ['line_follower_mulai'],
      successMessage: 'Line follower aktif!',
    },
    4: {
      title: 'Sensor Jarak',
      goal: 'Deteksi halangan di depan',
      requiredBlocks: ['sensor_jarak'],
      successMessage: 'Sensor jarak berfungsi!',
    },
    5: {
      title: 'Hindari Halangan',
      goal: 'Robot berhenti jika ada halangan',
      requiredBlocks: ['sensor_jarak_kondisi', 'robot_stop'],
      successMessage: 'Robot bisa menghindari tabrakan!',
    },
    6: {
      title: 'Sensor IMU',
      goal: 'Baca sudut yaw dari gyroscope',
      requiredBlocks: ['sensor_imu_yaw'],
      successMessage: 'IMU aktif!',
    },
    7: {
      title: 'Putar Tepat 90°',
      goal: 'Putar robot tepat 90 derajat',
      requiredBlocks: ['robot_putar_sudut'],
      successMessage: 'Rotasi presisi!',
    },
    8: {
      title: 'Deteksi Persimpangan',
      goal: 'Kenali persimpangan di jalur',
      requiredBlocks: ['line_follower_sampai_persimpangan'],
      successMessage: 'Persimpangan terdeteksi!',
    },
    9: {
      title: 'Maze Runner',
      goal: 'Navigasi labirin sederhana',
      requiredBlocks: ['sensor_garis', 'robot_putar_sudut', 'controls_if'],
      successMessage: 'Labirin berhasil dilewati!',
    },
    10: {
      title: 'Tantangan Master',
      goal: 'Selesaikan misi kompleks!',
      requiredBlocks: ['line_follower_mulai', 'sensor_jarak_kondisi', 'robot_putar_sudut'],
      successMessage: '🏆 MASTER! Kamu telah menguasai Sirobo!',
      isBoss: true,
    }
  }
}

function LatihanLevel() {
  const navigate = useNavigate()
  const { category, level } = useParams()
  const { connected, sendCommand } = useRobot()
  
  const blocklyRef = useRef(null)
  const workspaceRef = useRef(null)
  
  const [currentStep, setCurrentStep] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [stars, setStars] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [attempts, setAttempts] = useState(0)
  
  const config = tutorialConfigs[category]?.[parseInt(level)] || {
    title: 'Level ' + level,
    goal: 'Selesaikan tantangan ini',
    requiredBlocks: [],
    successMessage: 'Berhasil!',
  }

  // Initialize Blockly
  useEffect(() => {
    if (blocklyRef.current && !workspaceRef.current) {
      workspaceRef.current = initBlocklyWorkspace(blocklyRef.current, {
        toolbox: simpleToolbox,
        simple: true
      })

      // Load initial blocks if any
      if (config.initialBlocks) {
        loadWorkspace(workspaceRef.current, config.initialBlocks)
      }
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose()
        workspaceRef.current = null
      }
    }
  }, [config])

  // Check if required blocks are present
  const checkBlocks = () => {
    if (!workspaceRef.current) return false
    
    const blocks = workspaceRef.current.getAllBlocks()
    const blockTypes = blocks.map(b => b.type)
    
    return config.requiredBlocks.every(required => 
      blockTypes.includes(required)
    )
  }

  // Handle run
  const handleRun = async () => {
    setAttempts(attempts + 1)
    
    if (!checkBlocks()) {
      alert('❌ Program belum lengkap! Coba lagi.')
      return
    }

    // Execute blocks
    const commands = generateLiveCommands(workspaceRef.current)
    for (const command of commands) {
      sendCommand(command)
      if (command.type === 'delay') {
        await new Promise(resolve => setTimeout(resolve, command.ms))
      } else {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Calculate stars
    let earnedStars = 3
    if (hintsUsed > 0) earnedStars--
    if (attempts > 2) earnedStars--
    if (earnedStars < 1) earnedStars = 1

    setStars(earnedStars)
    setIsComplete(true)

    // Save progress
    const progress = JSON.parse(localStorage.getItem('sirobo_progress') || '{}')
    const key = `${category}_${level}`
    progress[key] = { completed: true, stars: earnedStars }
    localStorage.setItem('sirobo_progress', JSON.stringify(progress))
  }

  // Handle hint
  const handleHint = () => {
    setShowHint(true)
    setHintsUsed(hintsUsed + 1)
  }

  // Handle next level
  const handleNextLevel = () => {
    const nextLevel = parseInt(level) + 1
    if (nextLevel <= 10) {
      navigate(`/latihan/${category}/${nextLevel}`)
      setIsComplete(false)
      setCurrentStep(0)
      setHintsUsed(0)
      setAttempts(0)
    } else {
      navigate('/latihan')
    }
  }

  // Handle retry
  const handleRetry = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear()
    }
    setIsComplete(false)
    setCurrentStep(0)
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-950 via-indigo-900 to-purple-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-4">
          <motion.button
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => navigate('/latihan')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config.isBoss ? 'bg-red-500' : 'bg-purple-500'} text-white`}>
                {config.isBoss ? '👑 BOSS' : `Level ${level}`}
              </span>
              <h1 className="text-xl font-display text-white">{config.title}</h1>
            </div>
            <p className="text-purple-300 text-xs">{config.goal}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Hint button */}
          <motion.button
            className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 font-semibold flex items-center gap-2"
            onClick={handleHint}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lightbulb size={18} />
            Petunjuk
          </motion.button>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">Percobaan: {attempts}</span>
          </div>
        </div>
      </header>

      {/* Tutorial Step Banner */}
      {config.steps && currentStep < config.steps.length && (
        <motion.div
          className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {currentStep + 1}
              </div>
              <p className="font-semibold">{config.steps[currentStep].instruction}</p>
            </div>
            {config.steps[currentStep].action === 'next' && (
              <motion.button
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 font-semibold"
                onClick={() => setCurrentStep(currentStep + 1)}
                whileTap={{ scale: 0.95 }}
              >
                Lanjut <ChevronRight size={18} className="inline" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Blockly Workspace */}
        <div ref={blocklyRef} className="flex-1" />
      </div>

      {/* Bottom Control Bar */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-2"
            onClick={handleRetry}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={18} />
            Ulangi
          </motion.button>
        </div>

        <motion.button
          className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-green-500/30"
          onClick={handleRun}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play size={20} />
          JALANKAN
        </motion.button>
      </div>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHint(false)}
          >
            <motion.div
              className="bg-yellow-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-yellow-500/50"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-display text-yellow-400 mb-4 flex items-center gap-2">
                <Lightbulb /> Petunjuk
              </h2>
              <ul className="space-y-3">
                {config.hints?.map((hint, index) => (
                  <li key={index} className="flex items-start gap-2 text-white/80">
                    <span className="text-yellow-400 font-bold">{index + 1}.</span>
                    {hint}
                  </li>
                ))}
              </ul>
              <button
                className="mt-6 w-full py-3 rounded-xl bg-yellow-500 text-white font-semibold"
                onClick={() => setShowHint(false)}
              >
                Mengerti! 👍
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-green-500/50 text-center"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                {config.isBoss ? '🏆' : '🎉'}
              </motion.div>
              
              <h2 className="text-3xl font-display text-white mb-2">
                {config.isBoss ? 'TANTANGAN SELESAI!' : 'BERHASIL!'}
              </h2>
              <p className="text-green-300 mb-6">{config.successMessage}</p>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map((star) => (
                  <motion.div
                    key={star}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + star * 0.2, type: 'spring' }}
                  >
                    <Star
                      size={48}
                      className={star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  className="flex-1 py-3 rounded-xl bg-white/20 text-white font-semibold"
                  onClick={handleRetry}
                  whileTap={{ scale: 0.95 }}
                >
                  Ulangi
                </motion.button>
                <motion.button
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2"
                  onClick={handleNextLevel}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Lanjut <ChevronRight size={20} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LatihanLevel
