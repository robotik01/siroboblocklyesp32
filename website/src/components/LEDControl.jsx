import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRobot } from '../context/RobotContext'

const presetColors = [
  { name: 'Merah', r: 255, g: 0, b: 0 },
  { name: 'Hijau', r: 0, g: 255, b: 0 },
  { name: 'Biru', r: 0, g: 0, b: 255 },
  { name: 'Kuning', r: 255, g: 255, b: 0 },
  { name: 'Cyan', r: 0, g: 255, b: 255 },
  { name: 'Magenta', r: 255, g: 0, b: 255 },
  { name: 'Putih', r: 255, g: 255, b: 255 },
  { name: 'Oranye', r: 255, g: 165, b: 0 },
  { name: 'Pink', r: 255, g: 105, b: 180 },
  { name: 'Ungu', r: 128, g: 0, b: 128 },
  { name: 'Mati', r: 0, g: 0, b: 0 },
  { name: 'Rainbow', r: -1, g: -1, b: -1 }, // Special rainbow mode
]

function LEDControl() {
  const { setLED, setAllLEDs, sendCommand } = useRobot()
  const [selectedLED, setSelectedLED] = useState('all') // 'all', 0, or 1
  const [currentColor, setCurrentColor] = useState({ r: 255, g: 255, b: 255 })
  const [brightness, setBrightness] = useState(100)

  const handleColorSelect = (color) => {
    if (color.r === -1) {
      // Rainbow mode
      sendCommand({ type: 'led_rainbow' })
      return
    }

    const adjustedColor = {
      r: Math.round(color.r * (brightness / 100)),
      g: Math.round(color.g * (brightness / 100)),
      b: Math.round(color.b * (brightness / 100))
    }

    setCurrentColor(color)

    if (selectedLED === 'all') {
      setAllLEDs(adjustedColor.r, adjustedColor.g, adjustedColor.b)
    } else {
      setLED(selectedLED, adjustedColor.r, adjustedColor.g, adjustedColor.b)
    }
  }

  const handleBrightnessChange = (value) => {
    setBrightness(value)
    if (currentColor.r >= 0) {
      const adjustedColor = {
        r: Math.round(currentColor.r * (value / 100)),
        g: Math.round(currentColor.g * (value / 100)),
        b: Math.round(currentColor.b * (value / 100))
      }
      if (selectedLED === 'all') {
        setAllLEDs(adjustedColor.r, adjustedColor.g, adjustedColor.b)
      } else {
        setLED(selectedLED, adjustedColor.r, adjustedColor.g, adjustedColor.b)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* LED Selection */}
      <div className="flex gap-2">
        {['all', 0, 1].map((led) => (
          <button
            key={led}
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${
              selectedLED === led 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            onClick={() => setSelectedLED(led)}
          >
            {led === 'all' ? 'Semua' : `LED ${led + 1}`}
          </button>
        ))}
      </div>

      {/* LED Preview */}
      <div className="flex justify-center gap-6">
        {[0, 1].map((index) => (
          <motion.div
            key={index}
            className="w-12 h-12 rounded-full border-2 border-white/20"
            animate={{
              backgroundColor: selectedLED === 'all' || selectedLED === index 
                ? `rgb(${currentColor.r * (brightness/100)}, ${currentColor.g * (brightness/100)}, ${currentColor.b * (brightness/100)})`
                : 'rgb(50, 50, 50)',
              boxShadow: (selectedLED === 'all' || selectedLED === index) && (currentColor.r + currentColor.g + currentColor.b > 0)
                ? `0 0 20px rgb(${currentColor.r * (brightness/100)}, ${currentColor.g * (brightness/100)}, ${currentColor.b * (brightness/100)})`
                : 'none'
            }}
          />
        ))}
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-4 gap-2">
        {presetColors.map((color, index) => (
          <motion.button
            key={index}
            className="p-2 rounded-lg text-xs font-semibold text-center transition-all"
            style={{
              backgroundColor: color.r >= 0 
                ? `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`
                : 'linear-gradient(135deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
              border: `2px solid rgba(${Math.max(0, color.r)}, ${Math.max(0, color.g)}, ${Math.max(0, color.b)}, 0.5)`,
              color: color.r === 0 && color.g === 0 && color.b === 0 ? '#999' : 'white'
            }}
            onClick={() => handleColorSelect(color)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {color.name}
          </motion.button>
        ))}
      </div>

      {/* Brightness Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm">Kecerahan</span>
          <span className="text-white font-bold">{brightness}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={brightness}
          onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
          className="w-full h-3 rounded-full appearance-none bg-white/20 cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b}) 0%, rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b}) ${brightness}%, rgba(255,255,255,0.2) ${brightness}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
      </div>

      {/* Effect buttons */}
      <div className="grid grid-cols-2 gap-2">
        <motion.button
          className="py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold"
          onClick={() => sendCommand({ type: 'led_blink' })}
          whileTap={{ scale: 0.95 }}
        >
          ✨ Kedip
        </motion.button>
        <motion.button
          className="py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold"
          onClick={() => sendCommand({ type: 'led_breathe' })}
          whileTap={{ scale: 0.95 }}
        >
          💫 Napas
        </motion.button>
      </div>
    </div>
  )
}

export default LEDControl
