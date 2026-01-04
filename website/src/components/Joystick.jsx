import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

function Joystick({ size = 200, onMove, onEnd }) {
  const containerRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const maxDistance = size / 2 - 30

  const calculatePosition = useCallback((clientX, clientY) => {
    if (!containerRef.current) return { x: 0, y: 0 }

    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let deltaX = clientX - centerX
    let deltaY = -(clientY - centerY) // Invert Y for proper direction

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance
      deltaY = (deltaY / distance) * maxDistance
    }

    return { x: deltaX, y: deltaY }
  }, [maxDistance])

  const handleMove = useCallback((clientX, clientY) => {
    const pos = calculatePosition(clientX, clientY)
    setPosition(pos)

    // Normalize to -100 to 100 range
    const normalizedX = Math.round((pos.x / maxDistance) * 100)
    const normalizedY = Math.round((pos.y / maxDistance) * 100)
    onMove?.(normalizedX, normalizedY)
  }, [calculatePosition, maxDistance, onMove])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onEnd?.()
  }, [onEnd])

  // Touch handlers
  const handleTouchStart = (e) => {
    e.preventDefault()
    setIsDragging(true)
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    handleEnd()
  }

  // Mouse handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    handleMove(e.clientX, e.clientY)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      handleMove(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      if (isDragging) handleEnd()
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMove, handleEnd])

  const knobSize = 70
  const visualX = position.x
  const visualY = -position.y // Invert back for visual display

  return (
    <div
      ref={containerRef}
      className="relative joystick-outer rounded-full select-none"
      style={{ width: size, height: size }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Cross lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-full h-0.5 bg-white/20" />
        <div className="absolute w-0.5 h-full bg-white/20" />
      </div>

      {/* Direction indicators */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-white/40 text-sm font-bold">MAJU</span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40 text-sm font-bold">MUNDUR</span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">KIRI</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">KANAN</span>
      </div>

      {/* Joystick knob */}
      <motion.div
        className="absolute joystick-inner rounded-full cursor-grab active:cursor-grabbing"
        style={{
          width: knobSize,
          height: knobSize,
          left: size / 2 - knobSize / 2,
          top: size / 2 - knobSize / 2,
        }}
        animate={{
          x: visualX,
          y: visualY,
          scale: isDragging ? 1.1 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/30" />
        </div>
      </motion.div>

      {/* Value display */}
      {isDragging && (
        <motion.div
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-black/50 text-white text-sm font-mono"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          X: {Math.round((position.x / maxDistance) * 100)} | Y: {Math.round((position.y / maxDistance) * 100)}
        </motion.div>
      )}
    </div>
  )
}

export default Joystick
