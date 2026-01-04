import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Star, Lock, Check, ChevronRight, 
  BookOpen, Rocket, Award, Zap, Target, Gamepad2
} from 'lucide-react'

// Lesson data
const lessons = {
  beginner: {
    title: 'Latihan Awal',
    subtitle: 'Untuk pemula - Belajar dasar-dasar',
    icon: BookOpen,
    color: 'from-green-500 to-emerald-600',
    levels: [
      {
        id: 1,
        title: 'Mengenal Blok',
        description: 'Belajar drag & drop blok pertama',
        stars: 3,
        unlocked: true,
        completed: true,
      },
      {
        id: 2,
        title: 'Robot Maju',
        description: 'Buat robot bergerak maju',
        stars: 2,
        unlocked: true,
        completed: true,
      },
      {
        id: 3,
        title: 'Maju dan Berhenti',
        description: 'Kombinasi maju dan stop',
        stars: 0,
        unlocked: true,
        completed: false,
      },
      {
        id: 4,
        title: 'Belok Kiri Kanan',
        description: 'Belajar membelokkan robot',
        stars: 0,
        unlocked: true,
        completed: false,
      },
      {
        id: 5,
        title: 'Nyalakan LED',
        description: 'Kontrol lampu LED robot',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 6,
        title: 'Mainkan Musik',
        description: 'Buat robot mengeluarkan suara',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 7,
        title: 'Perulangan',
        description: 'Ulangi aksi beberapa kali',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 8,
        title: 'Tunggu Sebentar',
        description: 'Gunakan blok tunggu',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 9,
        title: 'Kombinasi Gerakan',
        description: 'Buat pola gerakan kompleks',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 10,
        title: 'Tantangan Awal',
        description: 'Selesaikan misi pertama!',
        stars: 0,
        unlocked: false,
        completed: false,
        isBoss: true,
      },
    ]
  },
  advanced: {
    title: 'Latihan Lanjutan',
    subtitle: 'Untuk yang sudah mahir',
    icon: Rocket,
    color: 'from-purple-500 to-pink-600',
    levels: [
      {
        id: 1,
        title: 'Sensor Garis',
        description: 'Membaca sensor garis',
        stars: 0,
        unlocked: true,
        completed: false,
      },
      {
        id: 2,
        title: 'Kondisi If-Else',
        description: 'Buat keputusan dengan logika',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 3,
        title: 'Line Follower Dasar',
        description: 'Robot mengikuti garis',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 4,
        title: 'Sensor Jarak',
        description: 'Deteksi halangan',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 5,
        title: 'Hindari Halangan',
        description: 'Robot menghindari rintangan',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 6,
        title: 'Sensor IMU',
        description: 'Gunakan gyroscope',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 7,
        title: 'Putar Tepat 90°',
        description: 'Belok presisi dengan yaw',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 8,
        title: 'Deteksi Persimpangan',
        description: 'Kenali belokan di jalur',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 9,
        title: 'Maze Runner',
        description: 'Navigasi labirin sederhana',
        stars: 0,
        unlocked: false,
        completed: false,
      },
      {
        id: 10,
        title: 'Tantangan Master',
        description: 'Misi akhir untuk master!',
        stars: 0,
        unlocked: false,
        completed: false,
        isBoss: true,
      },
    ]
  },
  games: {
    title: 'Mini Games',
    subtitle: 'Bermain sambil belajar',
    icon: Gamepad2,
    color: 'from-orange-500 to-red-600',
    levels: [
      {
        id: 1,
        title: 'Balapan',
        description: 'Lomba kecepatan!',
        stars: 0,
        unlocked: true,
        completed: false,
        isGame: true,
      },
      {
        id: 2,
        title: 'Puzzle Blok',
        description: 'Susun blok dengan benar',
        stars: 0,
        unlocked: true,
        completed: false,
        isGame: true,
      },
      {
        id: 3,
        title: 'Simon Says',
        description: 'Ikuti pola LED',
        stars: 0,
        unlocked: true,
        completed: false,
        isGame: true,
      },
      {
        id: 4,
        title: 'Target Practice',
        description: 'Putar ke arah target',
        stars: 0,
        unlocked: true,
        completed: false,
        isGame: true,
      },
      {
        id: 5,
        title: 'Dance Battle',
        description: 'Ajari robot menari!',
        stars: 0,
        unlocked: true,
        completed: false,
        isGame: true,
      },
    ]
  }
}

function AyoLatihan() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('sirobo_progress')
    return saved ? JSON.parse(saved) : {}
  })

  const categories = [
    { key: 'beginner', ...lessons.beginner },
    { key: 'advanced', ...lessons.advanced },
    { key: 'games', ...lessons.games },
  ]

  const handleSelectLevel = (category, levelId) => {
    const level = lessons[category].levels.find(l => l.id === levelId)
    if (level && level.unlocked) {
      navigate(`/latihan/${category}/${levelId}`)
    }
  }

  const getTotalStars = (category) => {
    return lessons[category].levels.reduce((sum, level) => sum + level.stars, 0)
  }

  const getMaxStars = (category) => {
    return lessons[category].levels.length * 3
  }

  const getCompletedCount = (category) => {
    return lessons[category].levels.filter(l => l.completed).length
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-950 via-indigo-900 to-purple-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <motion.button
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => selectedCategory ? setSelectedCategory(null) : navigate('/')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-display text-white">Ayo Latihan! 🎓</h1>
            <p className="text-purple-300 text-sm">
              {selectedCategory ? lessons[selectedCategory].title : 'Pilih kategori latihan'}
            </p>
          </div>
        </div>

        {/* Total Progress */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20">
            <Star className="text-yellow-400 fill-yellow-400" size={20} />
            <span className="text-yellow-400 font-bold">
              {Object.keys(lessons).reduce((sum, cat) => sum + getTotalStars(cat), 0)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20">
            <Award className="text-green-400" size={20} />
            <span className="text-green-400 font-bold">
              {Object.keys(lessons).reduce((sum, cat) => sum + getCompletedCount(cat), 0)} / {Object.keys(lessons).reduce((sum, cat) => sum + lessons[cat].levels.length, 0)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            // Category Selection
            <motion.div
              key="categories"
              className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category.key}
                  className={`relative p-6 rounded-3xl bg-gradient-to-br ${category.color} shadow-lg overflow-hidden group`}
                  onClick={() => setSelectedCategory(category.key)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10 flex flex-col items-center text-center gap-4">
                    <div className="p-4 rounded-2xl bg-white/20">
                      <category.icon size={48} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display text-white">{category.title}</h3>
                      <p className="text-white/80 text-sm mt-1">{category.subtitle}</p>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full">
                      <div className="flex justify-between text-xs text-white/70 mb-1">
                        <span>{getCompletedCount(category.key)}/{lessons[category.key].levels.length} level</span>
                        <span className="flex items-center gap-1">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          {getTotalStars(category.key)}/{getMaxStars(category.key)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                        <motion.div
                          className="h-full bg-white/50 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(getCompletedCount(category.key) / lessons[category.key].levels.length) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                        />
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" size={24} />
                </motion.button>
              ))}
            </motion.div>
          ) : (
            // Level Selection
            <motion.div
              key="levels"
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Category header */}
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${lessons[selectedCategory].color} mb-6`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/20">
                    {React.createElement(lessons[selectedCategory].icon, { size: 32, className: 'text-white' })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-display text-white">{lessons[selectedCategory].title}</h2>
                    <p className="text-white/80">{lessons[selectedCategory].subtitle}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    <span className="text-white font-bold">
                      {getTotalStars(selectedCategory)} / {getMaxStars(selectedCategory)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Levels grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {lessons[selectedCategory].levels.map((level, index) => (
                  <motion.button
                    key={level.id}
                    className={`relative p-4 rounded-2xl transition-all ${
                      level.unlocked 
                        ? level.completed 
                          ? 'bg-green-500/20 border-2 border-green-500/50 hover:border-green-500'
                          : 'bg-white/10 border-2 border-white/20 hover:border-white/50 hover:bg-white/20'
                        : 'bg-gray-800/50 border-2 border-gray-700/50 cursor-not-allowed opacity-50'
                    } ${level.isBoss ? 'col-span-2 md:col-span-5' : ''}`}
                    onClick={() => handleSelectLevel(selectedCategory, level.id)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: index * 0.05 } }}
                    whileHover={level.unlocked ? { scale: 1.05 } : {}}
                    whileTap={level.unlocked ? { scale: 0.95 } : {}}
                  >
                    {/* Lock icon for locked levels */}
                    {!level.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="text-gray-600" size={32} />
                      </div>
                    )}

                    {/* Level content */}
                    <div className={level.unlocked ? '' : 'opacity-30'}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          level.isBoss 
                            ? 'bg-red-500 text-white' 
                            : level.isGame 
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/20 text-white'
                        }`}>
                          {level.isBoss ? '👑 BOSS' : level.isGame ? '🎮 GAME' : `Level ${level.id}`}
                        </span>
                        {level.completed && (
                          <Check className="text-green-400" size={20} />
                        )}
                      </div>

                      <h3 className="text-white font-semibold text-sm mb-1">{level.title}</h3>
                      <p className="text-white/60 text-xs mb-3">{level.description}</p>

                      {/* Stars */}
                      <div className="flex gap-1">
                        {[1, 2, 3].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= level.stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AyoLatihan
