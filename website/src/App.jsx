import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AyoMain from './pages/AyoMain'
import AyoRakit from './pages/AyoRakit'
import AyoProgram from './pages/AyoProgram'
import AyoLatihan from './pages/AyoLatihan'
import LatihanLevel from './pages/LatihanLevel'
import { RobotProvider } from './context/RobotContext'

function App() {
  return (
    <RobotProvider>
      <div className="w-full h-full overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<AyoMain />} />
          <Route path="/rakit" element={<AyoRakit />} />
          <Route path="/program" element={<AyoProgram />} />
          <Route path="/latihan" element={<AyoLatihan />} />
          <Route path="/latihan/:category/:level" element={<LatihanLevel />} />
        </Routes>
      </div>
    </RobotProvider>
  )
}

export default App
