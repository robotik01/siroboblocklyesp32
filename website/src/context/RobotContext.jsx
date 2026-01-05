import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const RobotContext = createContext()

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
    stationMode: false
  })
  const [availableNetworks, setAvailableNetworks] = useState([])
  const [isLiveMode, setIsLiveMode] = useState(true)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

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
    isLiveMode,
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
    uploadCode
  }

  return (
    <RobotContext.Provider value={value}>
      {children}
    </RobotContext.Provider>
  )
}
