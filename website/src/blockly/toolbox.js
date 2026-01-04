// Sirobo Blockly Toolbox Configuration
// Defines all available block categories and blocks

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '🚀 Mulai',
      colour: '#f97316',
      contents: [
        {
          kind: 'block',
          type: 'saat_mulai'
        },
        {
          kind: 'block',
          type: 'selalu_ulangi'
        }
      ]
    },
    {
      kind: 'category',
      name: '🚗 Gerakan',
      colour: '#22c55e',
      contents: [
        {
          kind: 'block',
          type: 'robot_maju',
          inputs: {
            SPEED: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 50 }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'robot_mundur',
          inputs: {
            SPEED: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 50 }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'robot_belok_kiri',
          inputs: {
            SPEED: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 50 }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'robot_belok_kanan',
          inputs: {
            SPEED: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 50 }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'robot_putar_sudut'
        },
        {
          kind: 'block',
          type: 'robot_putar',
          inputs: {
            ANGLE: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 90 }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'robot_stop'
        },
        {
          kind: 'block',
          type: 'robot_atur_motor',
          inputs: {
            LEFT: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 50 }
              }
            },
            RIGHT: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 50 }
              }
            }
          }
        }
      ]
    },
    {
      kind: 'category',
      name: '📊 Sensor',
      colour: '#3b82f6',
      contents: [
        {
          kind: 'label',
          text: '📊 Sensor Garis'
        },
        {
          kind: 'block',
          type: 'sensor_garis'
        },
        {
          kind: 'block',
          type: 'sensor_garis_deteksi'
        },
        {
          kind: 'sep',
          gap: 20
        },
        {
          kind: 'label',
          text: '📡 Sensor Jarak'
        },
        {
          kind: 'block',
          type: 'sensor_jarak'
        },
        {
          kind: 'block',
          type: 'sensor_jarak_kondisi',
          inputs: {
            DISTANCE: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 20 }
              }
            }
          }
        },
        {
          kind: 'sep',
          gap: 20
        },
        {
          kind: 'label',
          text: '🧭 Sensor IMU'
        },
        {
          kind: 'block',
          type: 'sensor_imu_yaw'
        },
        {
          kind: 'block',
          type: 'sensor_imu_pitch'
        },
        {
          kind: 'block',
          type: 'sensor_imu_roll'
        },
        {
          kind: 'block',
          type: 'sensor_imu_reset'
        },
        {
          kind: 'sep',
          gap: 20
        },
        {
          kind: 'label',
          text: '☀️ Sensor Cahaya'
        },
        {
          kind: 'block',
          type: 'sensor_ldr'
        },
        {
          kind: 'sep',
          gap: 20
        },
        {
          kind: 'label',
          text: '🔘 Tombol'
        },
        {
          kind: 'block',
          type: 'sensor_button'
        }
      ]
    },
    {
      kind: 'category',
      name: '🛤️ Line Follower',
      colour: '#10b981',
      contents: [
        {
          kind: 'block',
          type: 'line_follower_mulai',
          inputs: {
            SPEED: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 50 }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'line_follower_stop'
        },
        {
          kind: 'block',
          type: 'line_follower_sampai_persimpangan'
        }
      ]
    },
    {
      kind: 'category',
      name: '💡 LED',
      colour: '#a855f7',
      contents: [
        {
          kind: 'block',
          type: 'led_nyala'
        },
        {
          kind: 'block',
          type: 'led_rgb',
          inputs: {
            R: { shadow: { type: 'math_number', fields: { NUM: 255 } } },
            G: { shadow: { type: 'math_number', fields: { NUM: 0 } } },
            B: { shadow: { type: 'math_number', fields: { NUM: 0 } } }
          }
        },
        {
          kind: 'block',
          type: 'led_mati'
        },
        {
          kind: 'block',
          type: 'led_kedip',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 3 }
              }
            }
          }
        }
      ]
    },
    {
      kind: 'category',
      name: '🎵 Suara',
      colour: '#ec4899',
      contents: [
        {
          kind: 'block',
          type: 'bunyi_nada',
          inputs: {
            DURATION: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 200 }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'bunyi_frekuensi',
          inputs: {
            FREQ: { shadow: { type: 'math_number', fields: { NUM: 440 } } },
            DURATION: { shadow: { type: 'math_number', fields: { NUM: 200 } } }
          }
        },
        {
          kind: 'block',
          type: 'bunyi_melody'
        },
        {
          kind: 'block',
          type: 'bunyi_stop'
        }
      ]
    },
    {
      kind: 'category',
      name: '📺 Layar',
      colour: '#6366f1',
      contents: [
        {
          kind: 'block',
          type: 'oled_tampilkan_teks',
          inputs: {
            TEXT: {
              shadow: {
                type: 'text',
                fields: { TEXT: 'Hello!' }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'oled_tampilkan_angka',
          inputs: {
            NUMBER: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 0 }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'oled_hapus'
        },
        {
          kind: 'block',
          type: 'oled_gambar'
        }
      ]
    },
    {
      kind: 'sep'
    },
    {
      kind: 'category',
      name: '🔁 Perulangan',
      colour: '#06b6d4',
      contents: [
        {
          kind: 'block',
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 10 }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'controls_whileUntil'
        },
        {
          kind: 'block',
          type: 'tunggu',
          inputs: {
            TIME: {
              shadow: {
                type: 'math_number',
                fields: { NUM: 1 }
              }
            }
          }
        },
        {
          kind: 'block',
          type: 'waktu_berjalan'
        }
      ]
    },
    {
      kind: 'category',
      name: '🤔 Logika',
      colour: '#f59e0b',
      contents: [
        {
          kind: 'block',
          type: 'controls_if'
        },
        {
          kind: 'block',
          type: 'controls_if',
          extraState: {
            hasElse: true
          }
        },
        {
          kind: 'block',
          type: 'logic_compare'
        },
        {
          kind: 'block',
          type: 'logic_operation'
        },
        {
          kind: 'block',
          type: 'logic_negate'
        },
        {
          kind: 'block',
          type: 'logic_boolean'
        }
      ]
    },
    {
      kind: 'category',
      name: '🔢 Matematika',
      colour: '#ef4444',
      contents: [
        {
          kind: 'block',
          type: 'math_number',
          fields: { NUM: 0 }
        },
        {
          kind: 'block',
          type: 'math_arithmetic',
          inputs: {
            A: { shadow: { type: 'math_number', fields: { NUM: 1 } } },
            B: { shadow: { type: 'math_number', fields: { NUM: 1 } } }
          }
        },
        {
          kind: 'block',
          type: 'math_random_int',
          inputs: {
            FROM: { shadow: { type: 'math_number', fields: { NUM: 1 } } },
            TO: { shadow: { type: 'math_number', fields: { NUM: 100 } } }
          }
        }
      ]
    },
    {
      kind: 'category',
      name: '📝 Teks',
      colour: '#84cc16',
      contents: [
        {
          kind: 'block',
          type: 'text',
          fields: { TEXT: '' }
        }
      ]
    },
    {
      kind: 'sep'
    },
    {
      kind: 'category',
      name: '⚙️ Kalibrasi',
      colour: '#64748b',
      contents: [
        {
          kind: 'block',
          type: 'kalibrasi_motor',
          inputs: {
            LEFT: { shadow: { type: 'math_number', fields: { NUM: 0 } } },
            RIGHT: { shadow: { type: 'math_number', fields: { NUM: 0 } } }
          }
        },
        {
          kind: 'block',
          type: 'auto_kalibrasi'
        },
        {
          kind: 'block',
          type: 'simpan_kalibrasi'
        }
      ]
    }
  ]
}

// Simple toolbox for beginners
export const simpleToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '🚗 Gerakan',
      colour: '#22c55e',
      contents: [
        {
          kind: 'block',
          type: 'robot_maju',
          inputs: { SPEED: { shadow: { type: 'math_number', fields: { NUM: 50 } } } }
        },
        {
          kind: 'block',
          type: 'robot_mundur',
          inputs: { SPEED: { shadow: { type: 'math_number', fields: { NUM: 50 } } } }
        },
        {
          kind: 'block',
          type: 'robot_belok_kiri',
          inputs: { SPEED: { shadow: { type: 'math_number', fields: { NUM: 50 } } } }
        },
        {
          kind: 'block',
          type: 'robot_belok_kanan',
          inputs: { SPEED: { shadow: { type: 'math_number', fields: { NUM: 50 } } } }
        },
        {
          kind: 'block',
          type: 'robot_stop'
        }
      ]
    },
    {
      kind: 'category',
      name: '💡 LED',
      colour: '#a855f7',
      contents: [
        {
          kind: 'block',
          type: 'led_nyala'
        },
        {
          kind: 'block',
          type: 'led_mati'
        }
      ]
    },
    {
      kind: 'category',
      name: '🎵 Suara',
      colour: '#ec4899',
      contents: [
        {
          kind: 'block',
          type: 'bunyi_melody'
        }
      ]
    },
    {
      kind: 'category',
      name: '⏱️ Waktu',
      colour: '#06b6d4',
      contents: [
        {
          kind: 'block',
          type: 'tunggu',
          inputs: { TIME: { shadow: { type: 'math_number', fields: { NUM: 1 } } } }
        },
        {
          kind: 'block',
          type: 'controls_repeat_ext',
          inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: 3 } } } }
        }
      ]
    },
    {
      kind: 'category',
      name: '🔢 Angka',
      colour: '#ef4444',
      contents: [
        {
          kind: 'block',
          type: 'math_number',
          fields: { NUM: 50 }
        }
      ]
    }
  ]
}

export default toolbox
