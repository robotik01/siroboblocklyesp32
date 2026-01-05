import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Wifi, WifiOff, RefreshCw, Save, Settings, 
  Usb, Radio, Search, Check, AlertCircle, 
  Eye, EyeOff, Loader2
} from 'lucide-react'
import { useRobot } from '../context/RobotContext'

function ConnectionModal({ onClose }) {
  const { 
    connected, robotIP, updateRobotIP, connectWebSocket, disconnect,
    sendCommand
  } = useRobot()
  
  const [activeTab, setActiveTab] = useState('connection')
  const [inputIP, setInputIP] = useState(robotIP)
  const [connecting, setConnecting] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [availableNetworks, setAvailableNetworks] = useState([])
  const [selectedConnection, setSelectedConnection] = useState('wifi')
  
  // Robot settings
  const [robotName, setRobotName] = useState('Sirobo_Robot')
  const [apPassword, setApPassword] = useState('sirobo123')
  const [wifiSSID, setWifiSSID] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState('')
  
  // USB/Serial
  const [selectedPort, setSelectedPort] = useState(null)
  const [serialConnected, setSerialConnected] = useState(false)

  const checkSerialSupport = () => 'serial' in navigator

  const requestSerialPort = async () => {
    if (!checkSerialSupport()) {
      alert('Browser tidak mendukung Web Serial API. Gunakan Chrome atau Edge.')
      return
    }
    try {
      const port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x303A },
          { usbVendorId: 0x10C4 },
          { usbVendorId: 0x1A86 },
          { usbVendorId: 0x0403 },
        ]
      })
      setSelectedPort(port)
      await port.open({ baudRate: 115200 })
      setSerialConnected(true)
    } catch (error) {
      console.error('Serial port error:', error)
    }
  }

  const disconnectSerial = async () => {
    if (selectedPort) {
      try {
        await selectedPort.close()
        setSerialConnected(false)
        setSelectedPort(null)
      } catch (error) {
        console.error('Failed to close port:', error)
      }
    }
  }

  const scanNetworks = async () => {
    if (!connected) return
    setScanning(true)
    sendCommand({ type: 'scan_wifi' })
    setTimeout(() => {
      setAvailableNetworks([
        { ssid: 'Sirobo_Robot', signal: -40, secured: true },
        { ssid: 'Home_WiFi', signal: -55, secured: true },
      ])
      setScanning(false)
    }, 2000)
  }

  const handleConnect = async () => {
    if (selectedConnection === 'wifi') {
      setConnecting(true)
      updateRobotIP(inputIP)
      await new Promise(resolve => setTimeout(resolve, 500))
      connectWebSocket()
      setConnecting(false)
    } else {
      await requestSerialPort()
    }
  }

  const handleDisconnect = () => {
    if (selectedConnection === 'wifi') {
      disconnect()
    } else {
      disconnectSerial()
    }
  }

  const handleSaveSettings = async () => {
    if (!connected) {
      setSettingsMessage('❌ Robot tidak terhubung')
      return
    }
    if (apPassword.length < 8) {
      setSettingsMessage('❌ Password minimal 8 karakter')
      return
    }
    setSavingSettings(true)
    setSettingsMessage('')
    sendCommand({ 
      type: 'config', 
      robotName,
      apSSID: robotName,
      apPassword,
      wifiSSID,
      wifiPassword
    })
    setTimeout(() => {
      setSavingSettings(false)
      setSettingsMessage('✅ Pengaturan tersimpan! Robot akan restart.')
    }, 1500)
  }

  const isConnected = selectedConnection === 'wifi' ? connected : serialConnected

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
          className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 max-w-lg w-full mx-4 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display text-white flex items-center gap-2">
              {isConnected ? <Wifi className="text-green-400" /> : <WifiOff className="text-red-400" />}
              Pengaturan Robot
            </h2>
            <button
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              className={`flex-1 py-2 px-3 rounded-xl font-semibold text-sm transition-colors ${
                activeTab === 'connection' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('connection')}
            >
              <Wifi size={14} className="inline mr-1" />
              Koneksi
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-xl font-semibold text-sm transition-colors ${
                activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={14} className="inline mr-1" />
              Pengaturan
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-xl font-semibold text-sm transition-colors ${
                activeTab === 'upload' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              <Usb size={14} className="inline mr-1" />
              Upload
            </button>
          </div>

          {/* Connection Tab */}
          {activeTab === 'connection' && (
            <div className="space-y-4">
              {/* Connection Type */}
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    selectedConnection === 'wifi' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                  onClick={() => setSelectedConnection('wifi')}
                >
                  <Radio size={20} />
                  WiFi
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    selectedConnection === 'usb' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                  onClick={() => setSelectedConnection('usb')}
                >
                  <Usb size={20} />
                  USB/OTG
                </button>
              </div>

              {/* Status */}
              <div className={`p-4 rounded-xl ${isConnected ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className={`font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Terhubung' : 'Tidak Terhubung'}
                  </span>
                </div>
                {isConnected && (
                  <p className="text-green-300/70 text-sm mt-2 ml-7">
                    {selectedConnection === 'wifi' ? `IP: ${robotIP}` : 'USB Serial Connected'}
                  </p>
                )}
              </div>

              {selectedConnection === 'wifi' ? (
                <>
                  {/* IP Input */}
                  <div>
                    <label className="block text-white/70 text-sm font-semibold mb-2">Alamat IP Robot</label>
                    <input
                      type="text"
                      value={inputIP}
                      onChange={(e) => setInputIP(e.target.value)}
                      placeholder="192.168.4.1"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all"
                    />
                  </div>

                  {/* Quick IPs */}
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

                  {/* Scan */}
                  <button
                    onClick={scanNetworks}
                    disabled={!connected || scanning}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {scanning ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                    {scanning ? 'Memindai...' : 'Cari Jaringan'}
                  </button>

                  {availableNetworks.length > 0 && (
                    <div className="space-y-1">
                      {availableNetworks.map((network, i) => (
                        <button
                          key={i}
                          onClick={() => network.ssid.includes('Sirobo') && setInputIP('192.168.4.1')}
                          className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-between"
                        >
                          <span className="text-white/80 text-sm flex items-center gap-2">
                            <Wifi size={14} /> {network.ssid}
                          </span>
                          <span className="text-white/50 text-xs">{network.signal}dBm 🔒</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/60 text-sm mb-4">
                    {checkSerialSupport() 
                      ? 'Hubungkan robot via USB lalu klik tombol di bawah'
                      : '⚠️ Browser tidak mendukung. Gunakan Chrome/Edge.'}
                  </p>
                </div>
              )}

              {/* Connect Button */}
              <div className="flex gap-3">
                {isConnected ? (
                  <motion.button
                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2"
                    onClick={handleDisconnect}
                    whileTap={{ scale: 0.98 }}
                  >
                    <WifiOff size={20} />
                    Putuskan
                  </motion.button>
                ) : (
                  <motion.button
                    className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    onClick={handleConnect}
                    disabled={connecting || (selectedConnection === 'usb' && !checkSerialSupport())}
                    whileTap={{ scale: 0.98 }}
                  >
                    {connecting ? <Loader2 size={20} className="animate-spin" /> : (selectedConnection === 'wifi' ? <Wifi size={20} /> : <Usb size={20} />)}
                    {connecting ? 'Menghubungkan...' : 'Hubungkan'}
                  </motion.button>
                )}
              </div>

              {/* Help */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/80 text-sm font-semibold">Cara menghubungkan:</p>
                <ol className="text-white/60 text-sm mt-2 space-y-1 list-decimal list-inside">
                  <li>Nyalakan robot Sirobo</li>
                  <li>Hubungkan WiFi ke "Sirobo_XXXX"</li>
                  <li>Password: sirobo123</li>
                  <li>Klik tombol "Hubungkan"</li>
                </ol>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {!connected && (
                <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-2">
                  <AlertCircle className="text-yellow-400" size={18} />
                  <p className="text-yellow-300 text-sm">Hubungkan ke robot dulu untuk mengubah pengaturan</p>
                </div>
              )}

              <div>
                <label className="block text-white/70 text-sm font-semibold mb-2">Nama Robot (SSID)</label>
                <input
                  type="text"
                  value={robotName}
                  onChange={(e) => setRobotName(e.target.value)}
                  placeholder="Sirobo_Robot"
                  disabled={!connected}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-semibold mb-2">Password AP (min 8 karakter)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={apPassword}
                    onChange={(e) => setApPassword(e.target.value)}
                    placeholder="sirobo123"
                    disabled={!connected}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-white/60 text-sm mb-3">(Opsional) Hubungkan ke WiFi rumah/sekolah:</p>
                <input
                  type="text"
                  value={wifiSSID}
                  onChange={(e) => setWifiSSID(e.target.value)}
                  placeholder="Nama WiFi"
                  disabled={!connected}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 disabled:opacity-50 mb-3"
                />
                <input
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Password WiFi"
                  disabled={!connected}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 disabled:opacity-50"
                />
              </div>

              {settingsMessage && (
                <div className={`p-3 rounded-xl text-sm ${settingsMessage.includes('❌') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                  {settingsMessage}
                </div>
              )}

              <motion.button
                onClick={handleSaveSettings}
                disabled={!connected || savingSettings}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                whileTap={{ scale: 0.98 }}
              >
                {savingSettings ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {savingSettings ? 'Menyimpan...' : 'Simpan ke Robot'}
              </motion.button>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Radio className="text-blue-400" size={24} />
                  <div>
                    <h4 className="text-white font-semibold">Via WiFi (OTA)</h4>
                    <p className="text-white/50 text-xs">Upload via jaringan WiFi</p>
                  </div>
                </div>
                <button
                  disabled={!connected}
                  className="mt-2 w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  Upload via WiFi
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Usb className="text-green-400" size={24} />
                  <div>
                    <h4 className="text-white font-semibold">Via USB/OTG</h4>
                    <p className="text-white/50 text-xs">Upload via kabel USB</p>
                  </div>
                </div>
                <button
                  onClick={requestSerialPort}
                  disabled={!checkSerialSupport()}
                  className="mt-2 w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {checkSerialSupport() ? 'Pilih Port USB' : 'Browser tidak mendukung'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/80 text-sm font-semibold">💡 Tips:</p>
                <ul className="text-white/60 text-sm mt-2 space-y-1">
                  <li>• Upload via USB: gunakan Chrome/Edge</li>
                  <li>• Di HP Android: gunakan kabel OTG</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConnectionModal
