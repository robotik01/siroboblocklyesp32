import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Compass, Eye, Ruler, Sun, Battery } from 'lucide-react'

function SensorDisplay({ data }) {
  const { sensors, battery } = data || { sensors: {}, battery: 100 }
  const lineData = sensors?.line || [0, 0, 0, 0, 0, 0, 0, 0]
  const ldrData = sensors?.ldr || [0, 0]
  const distance = sensors?.distance || 0
  const yaw = sensors?.yaw || 0
  const pitch = sensors?.pitch || 0
  const roll = sensors?.roll || 0

  return (
    <div className="space-y-4">
      {/* Battery */}
      <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
        <div className="flex items-center gap-2 mb-2">
          <Battery size={20} className={battery > 20 ? 'text-green-400' : 'text-red-400'} />
          <span className="text-white font-semibold">Baterai</span>
          <span className={`ml-auto font-bold ${battery > 20 ? 'text-green-400' : 'text-red-400'}`}>
            {battery}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/20 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${battery > 50 ? 'bg-green-500' : battery > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${battery}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Line Sensors */}
      <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={20} className="text-blue-400" />
          <span className="text-white font-semibold">Sensor Garis</span>
        </div>
        <div className="flex gap-1 justify-center">
          {lineData.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <motion.div
                className={`w-6 h-12 rounded-lg transition-colors ${value > 500 ? 'bg-white' : 'bg-gray-700'}`}
                animate={{ 
                  backgroundColor: value > 500 ? '#ffffff' : '#374151',
                  boxShadow: value > 500 ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                }}
              />
              <span className="text-xs text-white/50 mt-1">{index + 1}</span>
            </div>
          ))}
        </div>
        <p className="text-white/50 text-xs text-center mt-2">
          Putih = Garis Terdeteksi
        </p>
      </div>

      {/* IMU / Gyroscope */}
      <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <Compass size={20} className="text-purple-400" />
          <span className="text-white font-semibold">IMU (Gyroscope)</span>
        </div>
        
        {/* Yaw visualization */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-white/20" />
          <div className="absolute inset-2 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-1 h-14 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full origin-bottom"
              style={{ transformOrigin: 'bottom center' }}
              animate={{ rotate: yaw }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs text-white/50">0°</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-xs text-white/50">180°</span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 text-xs text-white/50">270°</span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-xs text-white/50">90°</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-xs text-white/50">Yaw</p>
            <p className="text-lg font-bold text-purple-400">{yaw.toFixed(1)}°</p>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-xs text-white/50">Pitch</p>
            <p className="text-lg font-bold text-blue-400">{pitch.toFixed(1)}°</p>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-xs text-white/50">Roll</p>
            <p className="text-lg font-bold text-green-400">{roll.toFixed(1)}°</p>
          </div>
        </div>
      </div>

      {/* Distance Sensor */}
      <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <Ruler size={20} className="text-cyan-400" />
          <span className="text-white font-semibold">Sensor Jarak</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-6 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                animate={{ width: `${Math.min(100, (distance / 200) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-cyan-400 w-24 text-right">
            {distance} cm
          </span>
        </div>
        <p className={`text-xs mt-2 ${distance < 20 ? 'text-red-400' : distance < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
          {distance < 20 ? '⚠️ Sangat Dekat!' : distance < 50 ? '⚡ Hati-hati' : '✅ Aman'}
        </p>
      </div>

      {/* LDR Sensors */}
      <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <Sun size={20} className="text-yellow-400" />
          <span className="text-white font-semibold">Sensor Cahaya (LDR)</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {ldrData.map((value, index) => (
            <div key={index} className="text-center">
              <motion.div
                className="w-16 h-16 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center"
                animate={{ 
                  backgroundColor: `rgba(234, 179, 8, ${value / 4095})`,
                  boxShadow: `0 0 ${(value / 4095) * 30}px rgba(234, 179, 8, ${value / 4095})`
                }}
              >
                <Sun size={24} className="text-yellow-400" />
              </motion.div>
              <p className="text-white/50 text-xs mt-2">{index === 0 ? 'Kiri' : 'Kanan'}</p>
              <p className="text-yellow-400 font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SensorDisplay
