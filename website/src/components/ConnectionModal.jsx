import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wifi, WifiOff, RefreshCw, Save } from 'lucide-react'
import { useRobot } from '../context/RobotContext'

function ConnectionModal({ onClose }) {
  const { connected, robotIP, updateRobotIP, connectWebSocket, disconnect } = useRobot()
  const [inputIP, setInputIP] = useState(robotIP)
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    updateRobotIP(inputIP)
    await new Promise(resolve => setTimeout(resolve, 500))
    connectWebSocket()
    setConnecting(false)
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const handleSave = () => {
    updateRobotIP(inputIP)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 max-w-md w-full mx-4 border border-white/20 shadow-2xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display text-white flex items-center gap-2">
              {connected ? <Wifi className="text-green-400" /> : <WifiOff className="text-red-400" />}
              Koneksi Robot
            </h2>
            <button
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>

          {/* Status */}
          <div className={`p-4 rounded-xl mb-6 ${connected ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
                {connected ? 'Terhubung ke Robot' : 'Tidak Terhubung'}
              </span>
            </div>
            {connected && (
              <p className="text-green-300/70 text-sm mt-2 ml-7">
                IP: {robotIP}
              </p>
            )}
          </div>

          {/* IP Input */}
          <div className="mb-6">
            <label className="block text-white/70 text-sm font-semibold mb-2">
              Alamat IP Robot
            </label>
            <input
              type="text"
              value={inputIP}
              onChange={(e) => setInputIP(e.target.value)}
              placeholder="192.168.4.1"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
            />
            <p className="text-white/50 text-xs mt-2">
              💡 Default: 192.168.4.1 (Access Point mode)
            </p>
          </div>

          {/* Preset IPs */}
          <div className="mb-6">
            <p className="text-white/70 text-sm font-semibold mb-2">IP Cepat:</p>
            <div className="flex flex-wrap gap-2">
              {['192.168.4.1', '192.168.1.100', '192.168.0.100'].map(ip => (
                <button
                  key={ip}
                  onClick={() => setInputIP(ip)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${inputIP === ip ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                >
                  {ip}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {connected ? (
              <motion.button
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                onClick={handleDisconnect}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <WifiOff size={20} />
                Putuskan
              </motion.button>
            ) : (
              <motion.button
                className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                onClick={handleConnect}
                disabled={connecting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {connecting ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    <Wifi size={20} />
                    Hubungkan
                  </>
                )}
              </motion.button>
            )}

            <motion.button
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
              onClick={handleSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={20} />
              Simpan
            </motion.button>
          </div>

          {/* Help text */}
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm">
              <strong className="text-white/80">Cara menghubungkan:</strong>
            </p>
            <ol className="text-white/60 text-sm mt-2 space-y-1 list-decimal list-inside">
              <li>Nyalakan robot Sirobo</li>
              <li>Hubungkan WiFi ke "Sirobo_XXXX"</li>
              <li>Password: sirobo123</li>
              <li>Klik tombol "Hubungkan"</li>
            </ol>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConnectionModal
