import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Play, Square, Upload, Download, Save, FolderOpen,
  Wifi, WifiOff, Code, Eye, Trash2, Settings, Undo, Redo,
  ZoomIn, ZoomOut, Maximize2, HelpCircle, Lightbulb
} from 'lucide-react'
import { useRobot } from '../context/RobotContext'
import { 
  initBlocklyWorkspace, 
  generateArduinoCode, 
  generateLiveCommands,
  saveWorkspace,
  loadWorkspace,
  clearWorkspace,
  examplePrograms
} from '../blockly'

function AyoProgram({ simple = false, tutorialMode = false, tutorialConfig = null }) {
  const navigate = useNavigate()
  const { connected, executeCode, uploadCode, sendCommand } = useRobot()
  const blocklyRef = useRef(null)
  const workspaceRef = useRef(null)
  
  const [isRunning, setIsRunning] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // Initialize Blockly
  useEffect(() => {
    if (blocklyRef.current && !workspaceRef.current) {
      workspaceRef.current = initBlocklyWorkspace(blocklyRef.current, { simple })
      
      // Listen for changes
      workspaceRef.current.addChangeListener(() => {
        if (showCode) {
          setGeneratedCode(generateArduinoCode(workspaceRef.current))
        }
      })

      // Load saved workspace
      const saved = localStorage.getItem('sirobo_workspace')
      if (saved) {
        loadWorkspace(workspaceRef.current, saved)
      }
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose()
        workspaceRef.current = null
      }
    }
  }, [simple])

  // Update code when showing
  useEffect(() => {
    if (showCode && workspaceRef.current) {
      setGeneratedCode(generateArduinoCode(workspaceRef.current))
    }
  }, [showCode])

  // Handle run
  const handleRun = async () => {
    if (!workspaceRef.current) return
    
    setIsRunning(true)
    const commands = generateLiveCommands(workspaceRef.current)
    
    for (const command of commands) {
      if (!isRunning) break
      sendCommand(command)
      if (command.type === 'delay') {
        await new Promise(resolve => setTimeout(resolve, command.ms))
      } else {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    setIsRunning(false)
  }

  // Handle stop
  const handleStop = () => {
    setIsRunning(false)
    sendCommand({ type: 'stop' })
  }

  // Handle upload
  const handleUpload = async () => {
    if (!workspaceRef.current) return
    
    const code = generateArduinoCode(workspaceRef.current)
    const success = await uploadCode(code)
    
    if (success) {
      alert('✅ Program berhasil diupload ke robot!')
    } else {
      alert('❌ Gagal mengupload program. Pastikan robot terhubung.')
    }
  }

  // Handle save
  const handleSave = () => {
    if (!workspaceRef.current) return
    const data = saveWorkspace(workspaceRef.current)
    localStorage.setItem('sirobo_workspace', data)
    alert('✅ Program tersimpan!')
  }

  // Handle download
  const handleDownload = () => {
    if (!workspaceRef.current) return
    const data = saveWorkspace(workspaceRef.current)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sirobo_program.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Handle load
  const handleLoad = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          loadWorkspace(workspaceRef.current, e.target.result)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Handle clear
  const handleClear = () => {
    if (confirm('Hapus semua blok?')) {
      clearWorkspace(workspaceRef.current)
    }
  }

  // Load example
  const handleLoadExample = (key) => {
    const example = examplePrograms[key]
    if (example && workspaceRef.current) {
      loadWorkspace(workspaceRef.current, example.blocks)
      setShowExamples(false)
    }
  }

  // Undo/Redo
  const handleUndo = () => workspaceRef.current?.undo(false)
  const handleRedo = () => workspaceRef.current?.undo(true)

  // Zoom
  const handleZoomIn = () => workspaceRef.current?.zoomCenter(1)
  const handleZoomOut = () => workspaceRef.current?.zoomCenter(-1)
  const handleZoomReset = () => workspaceRef.current?.setScale(0.9)

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-4">
          <motion.button
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-xl font-display text-white">
              {simple ? 'Mode Sederhana' : 'Ayo Program!'} 💻
            </h1>
            <p className="text-blue-300 text-xs">Buat program untuk robotmu</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex gap-1 mr-2">
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              onClick={handleUndo}
              whileTap={{ scale: 0.9 }}
              title="Undo"
            >
              <Undo size={18} />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              onClick={handleRedo}
              whileTap={{ scale: 0.9 }}
              title="Redo"
            >
              <Redo size={18} />
            </motion.button>
          </div>

          {/* Zoom */}
          <div className="flex gap-1 mr-2">
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              onClick={handleZoomOut}
              whileTap={{ scale: 0.9 }}
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              onClick={handleZoomReset}
              whileTap={{ scale: 0.9 }}
              title="Reset Zoom"
            >
              <Maximize2 size={18} />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              onClick={handleZoomIn}
              whileTap={{ scale: 0.9 }}
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </motion.button>
          </div>

          {/* File operations */}
          <div className="flex gap-1 mr-2">
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              onClick={handleSave}
              whileTap={{ scale: 0.9 }}
              title="Simpan"
            >
              <Save size={18} />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              onClick={handleLoad}
              whileTap={{ scale: 0.9 }}
              title="Buka"
            >
              <FolderOpen size={18} />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              onClick={handleDownload}
              whileTap={{ scale: 0.9 }}
              title="Download"
            >
              <Download size={18} />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
              onClick={handleClear}
              whileTap={{ scale: 0.9 }}
              title="Hapus Semua"
            >
              <Trash2 size={18} />
            </motion.button>
          </div>

          {/* View code toggle */}
          <motion.button
            className={`p-2 rounded-lg transition-colors ${showCode ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'}`}
            onClick={() => setShowCode(!showCode)}
            whileTap={{ scale: 0.9 }}
            title="Lihat Kode"
          >
            <Code size={18} />
          </motion.button>

          {/* Examples */}
          <motion.button
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-yellow-400"
            onClick={() => setShowExamples(!showExamples)}
            whileTap={{ scale: 0.9 }}
            title="Contoh Program"
          >
            <Lightbulb size={18} />
          </motion.button>

          {/* Help */}
          <motion.button
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
            onClick={() => setShowHelp(!showHelp)}
            whileTap={{ scale: 0.9 }}
            title="Bantuan"
          >
            <HelpCircle size={18} />
          </motion.button>

          {/* Connection status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-xs font-semibold">{connected ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Blockly Workspace */}
        <div ref={blocklyRef} className="flex-1" />

        {/* Code Panel */}
        <AnimatePresence>
          {showCode && (
            <motion.div
              className="w-96 border-l border-white/10 bg-gray-900 flex flex-col"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
            >
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-white font-semibold">📄 Kode Arduino</span>
                <button
                  className="text-white/50 hover:text-white"
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                >
                  📋
                </button>
              </div>
              <pre className="flex-1 p-4 text-sm text-green-400 overflow-auto font-mono">
                {generatedCode || '// Tambahkan blok untuk melihat kode'}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Examples Modal */}
        <AnimatePresence>
          {showExamples && (
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExamples(false)}
            >
              <motion.div
                className="bg-indigo-900 rounded-2xl p-6 max-w-lg w-full mx-4 border border-white/20"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-2xl font-display text-white mb-4">💡 Contoh Program</h2>
                <div className="space-y-3">
                  {Object.entries(examplePrograms).map(([key, example]) => (
                    <motion.button
                      key={key}
                      className="w-full p-4 rounded-xl bg-white/10 hover:bg-white/20 text-left transition-colors"
                      onClick={() => handleLoadExample(key)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <h3 className="text-white font-semibold">{example.name}</h3>
                      <p className="text-white/60 text-sm">{example.description}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Modal */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
            >
              <motion.div
                className="bg-indigo-900 rounded-2xl p-6 max-w-lg w-full mx-4 border border-white/20 max-h-[80vh] overflow-auto"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-2xl font-display text-white mb-4">❓ Cara Menggunakan</h2>
                <div className="space-y-4 text-white/80">
                  <div>
                    <h3 className="text-white font-semibold mb-2">🧱 Menambah Blok</h3>
                    <p>Klik kategori di sebelah kiri, lalu drag blok ke area kerja.</p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">🔗 Menghubungkan Blok</h3>
                    <p>Drag blok mendekati blok lain sampai terhubung.</p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">▶️ Menjalankan Program</h3>
                    <p>Klik tombol hijau "Jalankan" untuk mengirim perintah ke robot.</p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">📤 Upload ke Robot</h3>
                    <p>Klik "Upload" untuk menyimpan program secara permanen di robot.</p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">🗑️ Menghapus Blok</h3>
                    <p>Drag blok ke tempat sampah di pojok kanan bawah.</p>
                  </div>
                </div>
                <button
                  className="mt-6 w-full py-3 rounded-xl bg-blue-500 text-white font-semibold"
                  onClick={() => setShowHelp(false)}
                >
                  Mengerti! 👍
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Control Bar */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-sm">Mode:</span>
          <button
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${!simple ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
            onClick={() => window.location.reload()}
          >
            Advanced
          </button>
          <button
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${simple ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}
            onClick={() => window.location.reload()}
          >
            Simple
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Run/Stop buttons */}
          {isRunning ? (
            <motion.button
              className="px-8 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-500/30"
              onClick={handleStop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Square size={20} />
              STOP
            </motion.button>
          ) : (
            <motion.button
              className="px-8 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRun}
              disabled={!connected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={20} />
              JALANKAN
            </motion.button>
          )}

          {/* Upload button */}
          <motion.button
            className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleUpload}
            disabled={!connected}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload size={20} />
            UPLOAD
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default AyoProgram
