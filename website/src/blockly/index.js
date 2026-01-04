// Sirobo Blockly initialization
import Blockly from 'blockly'
import 'blockly/blocks'
import './blocks'
import { arduinoGenerator, liveGenerator } from './generators'
import { toolbox, simpleToolbox } from './toolbox'

// Custom theme for Sirobo
const siroboTheme = Blockly.Theme.defineTheme('sirobo', {
  base: Blockly.Themes.Classic,
  blockStyles: {
    logic_blocks: { colourPrimary: '#f59e0b' },
    loop_blocks: { colourPrimary: '#06b6d4' },
    math_blocks: { colourPrimary: '#ef4444' },
    text_blocks: { colourPrimary: '#84cc16' },
    list_blocks: { colourPrimary: '#8b5cf6' },
    colour_blocks: { colourPrimary: '#a855f7' },
    variable_blocks: { colourPrimary: '#8b5cf6' },
    procedure_blocks: { colourPrimary: '#f97316' },
  },
  categoryStyles: {
    logic_category: { colour: '#f59e0b' },
    loop_category: { colour: '#06b6d4' },
    math_category: { colour: '#ef4444' },
    text_category: { colour: '#84cc16' },
    list_category: { colour: '#8b5cf6' },
    colour_category: { colour: '#a855f7' },
    variable_category: { colour: '#8b5cf6' },
    procedure_category: { colour: '#f97316' },
  },
  componentStyles: {
    workspaceBackgroundColour: '#1e1b4b',
    toolboxBackgroundColour: '#312e81',
    toolboxForegroundColour: '#fff',
    flyoutBackgroundColour: '#1e1b4b',
    flyoutForegroundColour: '#fff',
    flyoutOpacity: 0.95,
    scrollbarColour: '#6366f1',
    insertionMarkerColour: '#fff',
    insertionMarkerOpacity: 0.3,
    scrollbarOpacity: 0.4,
    cursorColour: '#fff',
  },
  fontStyle: {
    family: 'Nunito, sans-serif',
    weight: 'bold',
    size: 12,
  },
  startHats: true
})

// Initialize a Blockly workspace
export function initBlocklyWorkspace(container, options = {}) {
  const defaultOptions = {
    toolbox: options.simple ? simpleToolbox : toolbox,
    theme: siroboTheme,
    grid: {
      spacing: 20,
      length: 3,
      colour: '#4338ca',
      snap: true
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 0.9,
      maxScale: 2,
      minScale: 0.3,
      scaleSpeed: 1.2
    },
    trashcan: true,
    move: {
      scrollbars: true,
      drag: true,
      wheel: true
    },
    renderer: 'zelos',
    sounds: true,
  }

  const workspace = Blockly.inject(container, { ...defaultOptions, ...options })
  
  // Add resize handler
  const resizeObserver = new ResizeObserver(() => {
    Blockly.svgResize(workspace)
  })
  resizeObserver.observe(container)

  return workspace
}

// Generate Arduino code from workspace
export function generateArduinoCode(workspace) {
  return arduinoGenerator.workspaceToCode(workspace)
}

// Generate live commands from workspace
export function generateLiveCommands(workspace) {
  const code = liveGenerator.workspaceToCode(workspace)
  return code.split('\n').filter(line => line.trim()).map(line => {
    try {
      return JSON.parse(line)
    } catch {
      return null
    }
  }).filter(Boolean)
}

// Save workspace to JSON
export function saveWorkspace(workspace) {
  const state = Blockly.serialization.workspaces.save(workspace)
  return JSON.stringify(state)
}

// Load workspace from JSON
export function loadWorkspace(workspace, json) {
  try {
    const state = typeof json === 'string' ? JSON.parse(json) : json
    Blockly.serialization.workspaces.load(state, workspace)
    return true
  } catch (error) {
    console.error('Failed to load workspace:', error)
    return false
  }
}

// Clear workspace
export function clearWorkspace(workspace) {
  workspace.clear()
}

// Example programs
export const examplePrograms = {
  basic_move: {
    name: 'Gerakan Dasar',
    description: 'Robot bergerak maju, mundur, dan berputar',
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'robot_maju',
            inputs: { SPEED: { shadow: { type: 'math_number', fields: { NUM: 50 } } } },
            next: {
              block: {
                type: 'tunggu',
                inputs: { TIME: { shadow: { type: 'math_number', fields: { NUM: 2 } } } },
                fields: { UNIT: 'seconds' },
                next: {
                  block: {
                    type: 'robot_stop'
                  }
                }
              }
            }
          }
        ]
      }
    }
  },
  line_follower: {
    name: 'Line Follower Sederhana',
    description: 'Robot mengikuti garis hitam',
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'line_follower_mulai',
            inputs: { SPEED: { shadow: { type: 'math_number', fields: { NUM: 50 } } } }
          }
        ]
      }
    }
  },
  led_rainbow: {
    name: 'LED Pelangi',
    description: 'LED berubah warna pelangi',
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'selalu_ulangi',
            inputs: {
              DO: {
                block: {
                  type: 'led_nyala',
                  fields: { INDEX: 'all', COLOR: 'rainbow' }
                }
              }
            }
          }
        ]
      }
    }
  }
}

export { toolbox, simpleToolbox, siroboTheme, arduinoGenerator, liveGenerator }
export default Blockly
