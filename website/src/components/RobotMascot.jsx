import React from 'react'
import { motion } from 'framer-motion'

function RobotMascot({ size = 200, animate = true }) {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size * 1.2 }}
      animate={animate ? { y: [0, -10, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 200 240" className="w-full h-full">
        <defs>
          <linearGradient id="mascotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#60a5fa' }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6' }} />
          </linearGradient>
          <linearGradient id="mascotAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f97316' }} />
            <stop offset="100%" style={{ stopColor: '#ea580c' }} />
          </linearGradient>
          <linearGradient id="mascotEyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#22c55e' }} />
            <stop offset="100%" style={{ stopColor: '#16a34a' }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Shadow */}
        <ellipse cx="100" cy="230" rx="60" ry="10" fill="rgba(0,0,0,0.3)" />

        {/* Wheels */}
        <motion.g
          animate={animate ? { rotate: [0, 360] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '50px 200px' }}
        >
          <circle cx="50" cy="200" r="25" fill="#374151" filter="url(#shadow)" />
          <circle cx="50" cy="200" r="15" fill="#6b7280" />
          <circle cx="50" cy="200" r="5" fill="#9ca3af" />
        </motion.g>
        <motion.g
          animate={animate ? { rotate: [0, 360] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '150px 200px' }}
        >
          <circle cx="150" cy="200" r="25" fill="#374151" filter="url(#shadow)" />
          <circle cx="150" cy="200" r="15" fill="#6b7280" />
          <circle cx="150" cy="200" r="5" fill="#9ca3af" />
        </motion.g>

        {/* Body */}
        <rect x="35" y="90" width="130" height="90" rx="20" fill="url(#mascotBodyGrad)" filter="url(#shadow)" />
        
        {/* Chest panel */}
        <rect x="55" y="105" width="90" height="50" rx="10" fill="#1e3a5f" />
        <rect x="65" y="115" width="15" height="15" rx="3" fill="#22c55e" filter="url(#glow)">
          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
        </rect>
        <rect x="85" y="115" width="15" height="15" rx="3" fill="#eab308" filter="url(#glow)">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </rect>
        <rect x="105" y="115" width="15" height="15" rx="3" fill="#ef4444" filter="url(#glow)">
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="125" y="115" width="15" height="15" rx="3" fill="#3b82f6" filter="url(#glow)">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
        <rect x="65" y="140" width="70" height="8" rx="4" fill="#3b82f6" />

        {/* Arms */}
        <motion.g
          animate={animate ? { rotate: [-5, 5, -5] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ transformOrigin: '25px 110px' }}
        >
          <rect x="10" y="100" width="25" height="60" rx="10" fill="url(#mascotBodyGrad)" filter="url(#shadow)" />
          <circle cx="22" cy="165" r="12" fill="url(#mascotAccentGrad)" />
        </motion.g>
        <motion.g
          animate={animate ? { rotate: [5, -5, 5] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ transformOrigin: '175px 110px' }}
        >
          <rect x="165" y="100" width="25" height="60" rx="10" fill="url(#mascotBodyGrad)" filter="url(#shadow)" />
          <circle cx="178" cy="165" r="12" fill="url(#mascotAccentGrad)" />
        </motion.g>

        {/* Head */}
        <rect x="45" y="25" width="110" height="70" rx="15" fill="url(#mascotBodyGrad)" filter="url(#shadow)" />
        
        {/* Antenna */}
        <motion.g
          animate={animate ? { rotate: [-10, 10, -10] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ transformOrigin: '100px 25px' }}
        >
          <line x1="100" y1="25" x2="100" y2="8" stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="5" r="8" fill="url(#mascotAccentGrad)" filter="url(#glow)">
            <animate attributeName="r" values="8;10;8" dur="1s" repeatCount="indefinite" />
          </circle>
        </motion.g>

        {/* Eyes */}
        <motion.g
          animate={animate ? { scaleY: [1, 0.1, 1] } : {}}
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
          style={{ transformOrigin: '75px 55px' }}
        >
          <circle cx="75" cy="55" r="15" fill="url(#mascotEyeGrad)" filter="url(#glow)" />
          <circle cx="80" cy="50" r="5" fill="white" />
        </motion.g>
        <motion.g
          animate={animate ? { scaleY: [1, 0.1, 1] } : {}}
          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
          style={{ transformOrigin: '125px 55px' }}
        >
          <circle cx="125" cy="55" r="15" fill="url(#mascotEyeGrad)" filter="url(#glow)" />
          <circle cx="130" cy="50" r="5" fill="white" />
        </motion.g>

        {/* Smile */}
        <motion.path
          d="M 75 75 Q 100 95 125 75"
          stroke="white"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          animate={animate ? { d: ["M 75 75 Q 100 95 125 75", "M 75 80 Q 100 90 125 80", "M 75 75 Q 100 95 125 75"] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Cheeks */}
        <ellipse cx="55" cy="65" rx="8" ry="5" fill="#fca5a5" opacity="0.6" />
        <ellipse cx="145" cy="65" rx="8" ry="5" fill="#fca5a5" opacity="0.6" />
      </svg>
    </motion.div>
  )
}

export default RobotMascot
