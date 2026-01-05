# Sirobo Firmware

Pre-built firmware binaries for Sirobo educational robot.

## Latest Version

- **v1.0.0** - Initial release with OTA support

## Features

- WiFi Access Point mode (SSID: siroboXXXXX, Password: siroboayo)
- WebSocket real-time control
- OTA (Over-The-Air) firmware updates
- Live and Offline programming modes
- Full sensor support (IMU, line followers, LDR, ultrasonic)
- LED control with effects
- Motor control with calibration

## Hardware

- ESP32-S2 Wemos Lolin S2 Mini
- OLED 0.96" I2C Display
- MPU6050 IMU
- L298N Motor Driver
- WS2812 RGB LEDs (2x)
- 8 Line Follower Sensors
- 2 LDR Light Sensors
- HC-SR04 Ultrasonic Sensor
- 4 Push Buttons
- Piezo Buzzer

## Flashing Instructions

### Using PlatformIO
```bash
cd wemosS2mini
pio run --target upload
```

### Using esptool.py
```bash
esptool.py --chip esp32s2 --port /dev/ttyUSB0 write_flash 0x10000 sirobo_firmware_v1.0.0.bin
```

### Using OTA
Upload via the Sirobo app or web interface at `http://192.168.4.1/update`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ping` | GET | Robot discovery |
| `/status` | GET | Get robot status |
| `/info` | GET | Get firmware info |
| `/update` | POST | OTA firmware upload |
| `/mode` | POST | Switch firmware mode |
| `/ws` | WebSocket | Real-time control |

## Changelog

### v1.0.0
- Initial release
- WebSocket-based real-time control
- OTA update support
- Random SSID generation (siroboXXXXX)
- Live and Offline programming modes
