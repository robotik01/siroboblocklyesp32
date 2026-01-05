import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const RobotContext = createContext()

// API Server for compilation
const API_SERVER = 'https://involuntary-cryptonymous-delaine.ngrok-free.dev'

export function useRobot() {
  return useContext(RobotContext)
}

export function RobotProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [robotIP, setRobotIP] = useState(localStorage.getItem('robotIP') || '192.168.4.1')
  const [robotData, setRobotData] = useState({
    battery: 100,
    sensors: {
      line: [0, 0, 0, 0, 0, 0, 0, 0],
      ldr: [0, 0],
      distance: 0,
      yaw: 0,
      pitch: 0,
      roll: 0
    },
    buttons: [false, false, false, false],
    motorCalibration: { left: 0, right: 0 }
  })
  const [robotConfig, setRobotConfig] = useState({
    robotName: 'Sirobo_Robot',
    apIP: '192.168.4.1',
    stationIP: null,
    stationMode: false,
    firmwareMode: 'live' // 'live' or 'offline'
  })
  const [availableNetworks, setAvailableNetworks] = useState([])
  const [nearbyRobots, setNearbyRobots] = useState([])
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [compileStatus, setCompileStatus] = useState({ status: 'idle', message: '' })
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  // Check if running in Android WebView
  const isAndroidApp = useCallback(() => {
    return typeof window !== 'undefined' && window.Android && window.Android.isAndroidApp && window.Android.isAndroidApp()
  }, [])

  // Scan for nearby robots (uses Android native WiFi scan)
  const scanForRobots = useCallback(async () => {
    setIsScanning(true)
    try {
      if (isAndroidApp() && window.Android.scanForRobots) {
        const result = window.Android.scanForRobots()
        const robots = JSON.parse(result)
        setNearbyRobots(robots)
        return robots
      } else {
        // Fallback: try common IPs
        const commonIPs = ['192.168.4.1', '192.168.1.1', '192.168.0.1']
        const foundRobots = []
        
        for (const ip of commonIPs) {
          try {
            const response = await fetch(`http://${ip}/ping`, { 
              method: 'GET',
              timeout: 2000 
            })
            if (response.ok) {
              const data = await response.json()
              foundRobots.push({ ssid: data.robotName || 'Sirobo', ip, signal: -50 })
            }
          } catch (e) {
            // IP not responding
          }
        }
        
        setNearbyRobots(foundRobots)
        return foundRobots
      }
    } catch (error) {
      console.error('Error scanning for robots:', error)
      return []
    } finally {
      setIsScanning(false)
    }
  }, [isAndroidApp])

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      wsRef.current = new WebSocket(`ws://${robotIP}/ws`)

      wsRef.current.onopen = () => {
        console.log('Connected to robot')
        setConnected(true)
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Handle different message types
          if (data.type === 'config') {
            setRobotConfig(prev => ({
              ...prev,
              robotName: data.robotName || prev.robotName,
              apIP: data.apIP || prev.apIP,
              stationIP: data.stationIP || null,
              stationMode: data.stationMode || false
            }))
          } else if (data.type === 'wifi_scan') {
            setAvailableNetworks(data.networks || [])
          } else if (data.type === 'config_saved') {
            console.log('Config saved successfully')
          } else {
            // Regular sensor data
            setRobotData(prev => ({ ...prev, ...data }))
          }
        } catch (e) {
          console.error('Failed to parse robot data:', e)
        }
      }

      wsRef.current.onclose = () => {
        console.log('Disconnected from robot')
        setConnected(false)
        // Attempt reconnection
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000)
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        wsRef.current?.close()
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      setConnected(false)
    }
  }, [robotIP])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnected(false)
  }, [])

  // Send command to robot
  const sendCommand = useCallback((command) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(command))
      return true
    }
    return false
  }, [])

  // Robot control functions
  const moveRobot = useCallback((x, y) => {
    // x: -100 to 100 (left/right), y: -100 to 100 (backward/forward)
    sendCommand({ type: 'move', x, y })
  }, [sendCommand])

  const stopRobot = useCallback(() => {
    sendCommand({ type: 'stop' })
  }, [sendCommand])

  const setSpeed = useCallback((speed) => {
    sendCommand({ type: 'speed', value: speed })
  }, [sendCommand])

  const setLED = useCallback((index, r, g, b) => {
    sendCommand({ type: 'led', index, r, g, b })
  }, [sendCommand])

  const setAllLEDs = useCallback((r, g, b) => {
    sendCommand({ type: 'led_all', r, g, b })
  }, [sendCommand])

  const playMusic = useCallback((melody) => {
    sendCommand({ type: 'music', melody })
  }, [sendCommand])

  const stopMusic = useCallback(() => {
    sendCommand({ type: 'music_stop' })
  }, [sendCommand])

  const calibrateMotors = useCallback((left, right) => {
    sendCommand({ type: 'calibrate', left, right })
  }, [sendCommand])

  const saveCalibration = useCallback(() => {
    sendCommand({ type: 'save_calibration' })
  }, [sendCommand])

  const runLineFollower = useCallback((enable) => {
    sendCommand({ type: 'line_follower', enable })
  }, [sendCommand])

  const turnToAngle = useCallback((angle) => {
    sendCommand({ type: 'turn', angle })
  }, [sendCommand])

  // Execute Blockly-generated code
  const executeCode = useCallback((code) => {
    sendCommand({ type: 'execute', code })
  }, [sendCommand])

  // Upload compiled code
  const uploadCode = useCallback(async (code) => {
    try {
      const response = await fetch(`http://${robotIP}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      return response.ok
    } catch (error) {
      console.error('Upload failed:', error)
      return false
    }
  }, [robotIP])

  // Compile code using API server
  const compileCode = useCallback(async (code) => {
    setCompileStatus({ status: 'compiling', message: 'Mengkompilasi program...' })
    try {
      const response = await fetch(`${API_SERVER}/compile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ code, board: 'lolin_s2_mini' })
      })
      
      if (!response.ok) {
        const error = await response.json()
        setCompileStatus({ status: 'error', message: error.message || 'Kompilasi gagal' })
        return null
      }
      
      const result = await response.json()
      setCompileStatus({ status: 'success', message: 'Kompilasi berhasil!' })
      return result
    } catch (error) {
      console.error('Compile failed:', error)
      setCompileStatus({ status: 'error', message: 'Server tidak tersedia' })
      return null
    }
  }, [])

  // Upload firmware via OTA
  const uploadFirmwareOTA = useCallback(async (firmwareData) => {
    setCompileStatus({ status: 'uploading', message: 'Mengupload firmware via OTA...' })
    try {
      const response = await fetch(`http://${robotIP}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: firmwareData
      })
      
      if (response.ok) {
        setCompileStatus({ status: 'success', message: 'Firmware berhasil diupload!' })
        return true
      } else {
        setCompileStatus({ status: 'error', message: 'Upload firmware gagal' })
        return false
      }
    } catch (error) {
      console.error('OTA upload failed:', error)
      setCompileStatus({ status: 'error', message: 'Upload OTA gagal' })
      return false
    }
  }, [robotIP])

  // Switch firmware mode (live/offline)
  const switchFirmwareMode = useCallback(async (mode) => {
    if (mode === 'live' && robotConfig.firmwareMode !== 'live') {
      // Need to upload live firmware first
      setCompileStatus({ status: 'switching', message: 'Mengupload firmware live programming...' })
      const response = await fetch(`${API_SERVER}/firmware/live`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      })
      
      if (response.ok) {
        const firmware = await response.arrayBuffer()
        await uploadFirmwareOTA(firmware)
      }
    }
    
    setRobotConfig(prev => ({ ...prev, firmwareMode: mode }))
    setIsLiveMode(mode === 'live')
  }, [robotConfig.firmwareMode, uploadFirmwareOTA])

  // Save robot IP
  const updateRobotIP = useCallback((ip) => {
    setRobotIP(ip)
    localStorage.setItem('robotIP', ip)
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  const value = {
    connected,
    robotIP,
    updateRobotIP,
    robotData,
    robotConfig,
    availableNetworks,
    nearbyRobots,
    isLiveMode,
    isScanning,
    compileStatus,
    isAndroidApp,
    setIsLiveMode,
    connectWebSocket,
    disconnect,
    sendCommand,
    moveRobot,
    stopRobot,
    setSpeed,
    setLED,
    setAllLEDs,
    playMusic,
    stopMusic,
    calibrateMotors,
    saveCalibration,
    runLineFollower,
    turnToAngle,
    executeCode,
    uploadCode,
    scanForRobots,
    compileCode,
    uploadFirmwareOTA,
    switchFirmwareMode
  }

  return (
    <RobotContext.Provider value={value}>
      {children}
    </RobotContext.Provider>
  )
}
