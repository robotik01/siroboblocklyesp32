Website live di:
https://robotik01.github.io/siroboblocklyesp32/# 🤖 Sirobo - Educational Robot Platform

Platform robot edukasi berbasis web dengan Blockly visual programming untuk anak SD-SMP.

![Sirobo Robot](website/public/robot-icon.svg)

## ✨ Fitur Utama

### 🎮 Ayo Main
- Kontrol joystick real-time
- Pengaturan kecepatan motor
- Kontrol LED RGB dengan efek
- Musik & sound effects
- Live sensor display

### 🔧 Ayo Rakit
- Panduan assembly 3D interaktif
- 10 langkah perakitan detail
- Diagram wiring
- Daftar komponen lengkap

### 💻 Ayo Program
- Blockly visual programming
- Mode Simple & Advanced
- Arduino code generator
- Live programming via WebSocket
- Contoh program siap pakai
- Save/load projects

### 📚 Ayo Latihan
- 25+ level tutorial
- Beginner: 10 level dasar
- Advanced: 10 level lanjutan  
- Mini-games: 5 tantangan
- Sistem bintang & hints

## 🛠️ Tech Stack

### Frontend (Website)
- **Vite 5** - Build tool
- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Three.js** - 3D visualization
- **Blockly 10.4** - Visual programming
- **Framer Motion** - Animations
- **Zustand** - State management

### Firmware (ESP32-S2)
- **PlatformIO** - Build system
- **ESP32-S2** - Microcontroller
- **AsyncWebServer** - HTTP server
- **WebSocket** - Real-time communication
- **FastLED** - LED control
- **MPU6050** - IMU sensor
- **Adafruit SSD1306** - OLED display

## 🔌 Hardware

### Komponen Utama
- ESP32-S2 Wemos Lolin S2 Mini
- L298N Motor Driver
- 2x DC Gearmotor
- MPU6050 IMU (6-axis)
- OLED 0.96" I2C Display
- 2x WS2812 RGB LED
- 8x Line Follower Sensor
- 2x LDR Light Sensor
- HC-SR04 Ultrasonic Sensor
- 4x Push Button
- Piezo Buzzer

### Pin Configuration
```cpp
// Motor Driver L298N
MOTOR_LEFT_EN   = 9
MOTOR_LEFT_IN1  = 5
MOTOR_LEFT_IN2  = 6
MOTOR_RIGHT_EN  = 10
MOTOR_RIGHT_IN1 = 7
MOTOR_RIGHT_IN2 = 8

// I2C (OLED & IMU)
I2C_SDA = 35
I2C_SCL = 36

// WS2812 LEDs
LED_PIN = 18

// Sensors
LINE_SENSOR_1-8 = 1,2,3,4,11,12,13,14
LDR_LEFT  = 15
LDR_RIGHT = 21
ULTRASONIC_TRIG = 16
ULTRASONIC_ECHO = 17

// Inputs
BUTTON_1-4 = 37,38,39,40
BUZZER_PIN = 33
```

## 🚀 Quick Start

### Website Development
```bash
cd website
npm install
npm run dev
```

Website akan berjalan di http://localhost:5173

### Build untuk Production
```bash
npm run build
npm run preview
```

### Firmware Development
```bash
cd wemosS2mini
pio run              # Compile
pio run -t upload    # Upload ke ESP32
pio device monitor   # Serial monitor
```

## 📡 API WebSocket

Robot terhubung via WiFi AP:
- **SSID:** Sirobo_Robot
- **Password:** sirobo123
- **WebSocket:** ws://192.168.4.1/ws

### Perintah WebSocket
```javascript
// Kontrol motor
{ type: "move", x: 0, y: 100 }
{ type: "forward", speed: 50 }
{ type: "stop" }

// Kontrol LED
{ type: "led", index: 0, r: 255, g: 0, b: 0 }
{ type: "led_rainbow" }

// Musik
{ type: "music", melody: "happy" }

// Line Follower
{ type: "line_follower", enable: true, speed: 50 }

// Kalibrasi
{ type: "calibrate", left: 10, right: 0 }
{ type: "auto_calibrate" }

// Display
{ type: "display_text", line: 0, text: "Hello" }
{ type: "display_image", image: "happy" }
```

## 📁 Struktur Project

```
Blockly/
├── website/                 # React Web App
│   ├── src/
│   │   ├── pages/          # Ayo Main, Rakit, Program, Latihan
│   │   ├── components/     # Joystick, Robot3D, LEDControl, dll
│   │   ├── blockly/        # Custom blocks & generators
│   │   ├── context/        # RobotContext (WebSocket)
│   │   └── index.css       # Tailwind styles
│   ├── public/             # Static assets
│   └── package.json
│
└── wemosS2mini/            # ESP32 Firmware
    ├── src/
    │   └── main.cpp        # Main firmware (1100+ lines)
    ├── platformio.ini      # PlatformIO config
    └── include/            # Headers

```

## 🎯 Custom Blockly Blocks

### Kategori Blocks
- **🚗 Gerak** - forward, backward, turn, rotate, stop
- **📏 Sensor** - distance, line, light, button, IMU
- **💡 LED** - setColor, rainbow, blink, breathe
- **🎵 Suara** - playTone, playMelody
- **📺 Display** - showText, showNumber, showImage
- **🛣️ Line Follower** - followLine, detectIntersection
- **⚙️ Kalibrasi** - calibrateMotors, resetYaw
- **⏱️ Kontrol** - delay, repeat, forever

### Generator Output
- **Arduino Mode** - Generate C++ code untuk upload
- **Live Mode** - Generate JSON command untuk WebSocket

## 🎨 Tema & Animasi

Website menggunakan tema robot-friendly:
- **Colors:** Blue, Purple, Green, Orange
- **Fonts:** Fredoka One (headings), Nunito (body)
- **Animations:** Float, wiggle, pulse-glow, neon effects
- **Responsive:** Mobile-first design

## 🔒 Keamanan

- WiFi AP dengan password
- WebSocket connection monitoring
- Auto-stop saat disconnect
- EEPROM calibration backup
- Watchdog timer protection

## 📝 License

MIT License - bebas digunakan untuk edukasi

## 👨‍💻 Developer

Sirobo Educational Robot Platform
Untuk pembelajaran robotika & programming anak Indonesia

---

**Status Build:**
- ✅ Frontend: Production ready
- ✅ Firmware: Compiled successfully (RAM: 12.2%, Flash: 61.0%)
- 🚀 Ready to deploy!
