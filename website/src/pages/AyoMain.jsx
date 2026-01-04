import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Wifi, WifiOff, Volume2, VolumeX, Lightbulb, 
  Gauge, Music, Square, Play, RotateCcw, Settings,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useRobot } from '../context/RobotContext'
import Joystick from '../components/Joystick'
import SensorDisplay from '../components/SensorDisplay'
import LEDControl from '../components/LEDControl'

function AyoMain() {
  const navigate = useNavigate()
  const { connected, robotData, moveRobot, stopRobot, setSpeed, playMusic, stopMusic } = useRobot()
  const [speed, setSpeedValue] = useState(70)
  const [showLEDPanel, setShowLEDPanel] = useState(false)
  const [showMusicPanel, setShowMusicPanel] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleJoystickMove = useCallback((x, y) => {
    moveRobot(x * (speed / 100), y * (speed / 100))
  }, [moveRobot, speed])

  const handleJoystickEnd = useCallback(() => {
    stopRobot()
  }, [stopRobot])

  const handleSpeedChange = (newSpeed) => {
    setSpeedValue(newSpeed)
    setSpeed(newSpeed)
  }

  const handlePlayMusic = (melody) => {
    playMusic(melody)
    setIsPlaying(true)
  }

  const handleStopMusic = () => {
    stopMusic()
    setIsPlaying(false)
  }

  const melodies = [
    { id: 'happy', name: 'Happy', emoji: '😊' },
    { id: 'march', name: 'March', emoji: '🎺' },
    { id: 'beep', name: 'Beep', emoji: '🔔' },
    { id: 'victory', name: 'Victory', emoji: '🏆' },
    { id: 'error', name: 'Error', emoji: '❌' },
    { id: 'startup', name: 'Startup', emoji: '🚀' },
  ]

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-950 via-emerald-900 to-green-950 flex flex-col overflow-hidden">
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
            <h1 className="text-2xl font-display text-white">Ayo Main! 🎮</h1>
            <p className="text-green-300 text-sm">Kontrol robotmu langsung</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-sm font-semibold">{connected ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Sensors */}
        <div className="w-80 p-4 border-r border-white/10 overflow-y-auto">
          <SensorDisplay data={robotData} />
        </div>

        {/* Center - Joystick Control */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="relative">
            <Joystick 
              size={250}
              onMove={handleJoystickMove}
              onEnd={handleJoystickEnd}
            />
          </div>

          {/* Direction buttons for additional control */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            <div></div>
            <motion.button
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              onTouchStart={() => moveRobot(0, speed)}
              onTouchEnd={stopRobot}
              onMouseDown={() => moveRobot(0, speed)}
              onMouseUp={stopRobot}
              onMouseLeave={stopRobot}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronUp size={24} />
            </motion.button>
            <div></div>
            
            <motion.button
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              onTouchStart={() => moveRobot(-speed, 0)}
              onTouchEnd={stopRobot}
              onMouseDown={() => moveRobot(-speed, 0)}
              onMouseUp={stopRobot}
              onMouseLeave={stopRobot}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={24} />
            </motion.button>
            <motion.button
              className="p-4 rounded-xl bg-red-500/80 hover:bg-red-600 text-white"
              onClick={stopRobot}
              whileTap={{ scale: 0.9 }}
            >
              <Square size={24} />
            </motion.button>
            <motion.button
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              onTouchStart={() => moveRobot(speed, 0)}
              onTouchEnd={stopRobot}
              onMouseDown={() => moveRobot(speed, 0)}
              onMouseUp={stopRobot}
              onMouseLeave={stopRobot}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={24} />
            </motion.button>
            
            <div></div>
            <motion.button
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              onTouchStart={() => moveRobot(0, -speed)}
              onTouchEnd={stopRobot}
              onMouseDown={() => moveRobot(0, -speed)}
              onMouseUp={stopRobot}
              onMouseLeave={stopRobot}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronDown size={24} />
            </motion.button>
            <div></div>
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="w-80 p-4 border-l border-white/10 overflow-y-auto space-y-4">
          {/* Speed Control */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Gauge size={20} className="text-yellow-400" />
              <span className="text-white font-semibold">Kecepatan</span>
              <span className="ml-auto text-yellow-400 font-bold">{speed}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={speed}
              onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
              className="w-full h-3 rounded-full appearance-none bg-white/20 cursor-pointer"
              style={{
                background: `linear-gradient(to right, #eab308 0%, #eab308 ${speed}%, rgba(255,255,255,0.2) ${speed}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-white/50 mt-2">
              <span>Lambat</span>
              <span>Cepat</span>
            </div>
          </div>

          {/* LED Control */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
            <button
              className="w-full flex items-center gap-2"
              onClick={() => setShowLEDPanel(!showLEDPanel)}
            >
              <Lightbulb size={20} className="text-purple-400" />
              <span className="text-white font-semibold">Kontrol Lampu</span>
              <motion.span 
                className="ml-auto text-white/50"
                animate={{ rotate: showLEDPanel ? 180 : 0 }}
              >
                ▼
              </motion.span>
            </button>
            {showLEDPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4"
              >
                <LEDControl />
              </motion.div>
            )}
          </div>

          {/* Music Control */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
            <button
              className="w-full flex items-center gap-2"
              onClick={() => setShowMusicPanel(!showMusicPanel)}
            >
              <Music size={20} className="text-pink-400" />
              <span className="text-white font-semibold">Musik</span>
              <motion.span 
                className="ml-auto text-white/50"
                animate={{ rotate: showMusicPanel ? 180 : 0 }}
              >
                ▼
              </motion.span>
            </button>
            {showMusicPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 space-y-2"
              >
                <div className="grid grid-cols-3 gap-2">
                  {melodies.map((melody) => (
                    <motion.button
                      key={melody.id}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-center"
                      onClick={() => handlePlayMusic(melody.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-xl">{melody.emoji}</span>
                      <p className="text-white text-xs mt-1">{melody.name}</p>
                    </motion.button>
                  ))}
                </div>
                {isPlaying && (
                  <motion.button
                    className="w-full py-2 rounded-xl bg-red-500/80 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2"
                    onClick={handleStopMusic}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Square size={16} />
                    Stop Musik
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
            <p className="text-white font-semibold mb-3">Aksi Cepat</p>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                className="p-3 rounded-xl bg-blue-500/80 hover:bg-blue-600 text-white text-sm font-semibold"
                whileTap={{ scale: 0.95 }}
                onClick={() => moveRobot(0, 0)}
              >
                🔄 Putar Kiri
              </motion.button>
              <motion.button
                className="p-3 rounded-xl bg-blue-500/80 hover:bg-blue-600 text-white text-sm font-semibold"
                whileTap={{ scale: 0.95 }}
              >
                🔃 Putar Kanan
              </motion.button>
              <motion.button
                className="p-3 rounded-xl bg-purple-500/80 hover:bg-purple-600 text-white text-sm font-semibold"
                whileTap={{ scale: 0.95 }}
              >
                💃 Dansa
              </motion.button>
              <motion.button
                className="p-3 rounded-xl bg-green-500/80 hover:bg-green-600 text-white text-sm font-semibold"
                whileTap={{ scale: 0.95 }}
              >
                👋 Sapa
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AyoMain
