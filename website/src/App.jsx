import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import AyoMain from './pages/AyoMain'
import AyoRakit from './pages/AyoRakit'
import AyoProgram from './pages/AyoProgram'
import AyoLatihan from './pages/AyoLatihan'
import LatihanLevel from './pages/LatihanLevel'
import { RobotProvider } from './context/RobotContext'
import SplashScreen from './components/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    // Only show splash on first load
    const hasVisited = sessionStorage.getItem('sirobo_visited')
    if (hasVisited) {
      setShowSplash(false)
      setIsFirstLoad(false)
    }
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    sessionStorage.setItem('sirobo_visited', 'true')
  }

  return (
    <RobotProvider>
      <AnimatePresence mode="wait">
        {showSplash && isFirstLoad ? (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        ) : (
          <div key="app" className="w-full h-full overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/main" element={<AyoMain />} />
              <Route path="/rakit" element={<AyoRakit />} />
              <Route path="/program" element={<AyoProgram />} />
              <Route path="/latihan" element={<AyoLatihan />} />
              <Route path="/latihan/:category/:level" element={<LatihanLevel />} />
            </Routes>
          </div>
        )}
      </AnimatePresence>
    </RobotProvider>
  )
}

export default App
