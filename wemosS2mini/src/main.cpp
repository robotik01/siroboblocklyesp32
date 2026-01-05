/*
 * ███████╗██╗██████╗  ██████╗ ██████╗  ██████╗ 
 * ██╔════╝██║██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗
 * ███████╗██║██████╔╝██║   ██║██████╔╝██║   ██║
 * ╚════██║██║██╔══██╗██║   ██║██╔══██╗██║   ██║
 * ███████║██║██║  ██║╚██████╔╝██████╔╝╚██████╔╝
 * ╚══════╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝ 
 * 
 * Sirobo - Educational Robot Platform
 * Firmware for ESP32-S2 Wemos Lolin S2 Mini
 * 
 * Hardware:
 * - OLED 0.96" I2C Display
 * - MPU6050 IMU (Gyroscope + Accelerometer)
 * - L298N Motor Driver (2 DC Motors)
 * - WS2812 RGB LEDs (2 LEDs)
 * - 8 Line Follower Sensors (Photodiode)
 * - 2 LDR Light Sensors
 * - HC-SR04 Ultrasonic Distance Sensor
 * - 4 Push Buttons
 * - Piezo Buzzer
 * 
 * Communication:
 * - WiFi Access Point Mode
 * - WebSocket for real-time control
 * - HTTP Server for code upload
 */

#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <FastLED.h>
#include <EEPROM.h>

// Use Serial1 for logging (hardware UART)
#define LOG Serial1

// =====================================================
// PIN DEFINITIONS
// =====================================================

// I2C Pins
#define I2C_SDA 35
#define I2C_SCL 36

// Motor Driver L298N
#define MOTOR_LEFT_EN   9
#define MOTOR_LEFT_IN1  5
#define MOTOR_LEFT_IN2  6
#define MOTOR_RIGHT_EN  10
#define MOTOR_RIGHT_IN1 7
#define MOTOR_RIGHT_IN2 8

// WS2812 LEDs
#define LED_PIN 18
#define NUM_LEDS 2

// Line Follower Sensors (8 sensors)
#define LINE_SENSOR_1  1   // Leftmost
#define LINE_SENSOR_2  2
#define LINE_SENSOR_3  3
#define LINE_SENSOR_4  4
#define LINE_SENSOR_5  11
#define LINE_SENSOR_6  12
#define LINE_SENSOR_7  13
#define LINE_SENSOR_8  14  // Rightmost

// LDR Sensors
#define LDR_LEFT  15
#define LDR_RIGHT 21

// Ultrasonic Sensor
#define ULTRASONIC_TRIG 16
#define ULTRASONIC_ECHO 17

// Push Buttons
#define BUTTON_1 37
#define BUTTON_2 38
#define BUTTON_3 39
#define BUTTON_4 40

// Buzzer
#define BUZZER_PIN 33

// =====================================================
// CONSTANTS
// =====================================================

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

#define PWM_FREQUENCY 5000
#define PWM_RESOLUTION 8

#define EEPROM_SIZE 512
#define EEPROM_CALIBRATION_ADDR 0
#define EEPROM_CONFIG_ADDR 10
#define EEPROM_CONFIG_MAGIC 0xABCD

// Configuration structure stored in EEPROM
struct RobotConfig {
  uint16_t magic;           // Magic number to check if config is valid
  char apSSID[32];          // Access Point SSID (robot name)
  char apPassword[32];      // Access Point password
  char wifiSSID[32];        // Optional: connect to existing WiFi
  char wifiPassword[32];    // Optional: WiFi password
  bool stationMode;         // Enable station mode
};

RobotConfig config;

// Default WiFi Configuration
const char* DEFAULT_AP_SSID = "Sirobo_Robot";
const char* DEFAULT_AP_PASSWORD = "sirobo123";

// =====================================================
// GLOBAL OBJECTS
// =====================================================

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_MPU6050 mpu;
CRGB leds[NUM_LEDS];

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// =====================================================
// GLOBAL VARIABLES
// =====================================================

// Motor state
int motorLeftSpeed = 0;
int motorRightSpeed = 0;
int motorLeftCalibration = 0;
int motorRightCalibration = 0;
int baseSpeed = 150;

// IMU data
float yaw = 0, pitch = 0, roll = 0;
float yawOffset = 0;
unsigned long lastIMUUpdate = 0;

// Sensor data
int lineSensors[8] = {0};
int ldrLeft = 0, ldrRight = 0;
int distance = 0;
bool buttons[4] = {false};

// Line follower state
bool lineFollowerEnabled = false;
int lineFollowerSpeed = 50;
float lineFollowerKp = 0.5;

// LED effects
int ledEffect = 0; // 0=off, 1=solid, 2=rainbow, 3=blink, 4=breathe
unsigned long lastLEDUpdate = 0;

// Music/Buzzer
bool isBuzzerPlaying = false;
int* currentMelody = nullptr;
int* currentDurations = nullptr;
int melodyLength = 0;
int melodyIndex = 0;
unsigned long nextNoteTime = 0;

// System state
unsigned long lastSensorRead = 0;
unsigned long lastWebSocketUpdate = 0;
bool clientConnected = false;

// =====================================================
// FUNCTION PROTOTYPES
// =====================================================

void setupPins();
void setupMotors();
void setupSensors();
void setupIMU();
void setupDisplay();
void setupLEDs();
void setupWiFi();
void setupWebServer();
void setupWebSocket();

void readSensors();
void updateIMU();
void updateMotors();
void updateLEDs();
void updateBuzzer();
void updateLineFollower();
void sendSensorData();

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len);
void processCommand(JsonDocument& doc);

void setMotorSpeed(int left, int right);
void robotForward(int speed);
void robotBackward(int speed);
void robotTurnLeft(int speed);
void robotTurnRight(int speed);
void robotStop();
void robotRotate(float angle);

void setLED(int index, uint8_t r, uint8_t g, uint8_t b);
void setAllLEDs(uint8_t r, uint8_t g, uint8_t b);
void setLEDEffect(int effect);

void playTone(int frequency, int duration);
void playMelody(const char* melody);
void stopTone();

int getDistance();
bool isLineDetected(int sensorIndex);
bool detectIntersection(const char* type);

void displayText(int line, const char* text);
void displayNumber(int line, int number);
void clearDisplay();
void displayImage(const char* image);
void showWelcomeScreen();
void updateStatusDisplay();

void loadCalibration();
void saveCalibration();
void autoCalibrateStraight();
void loadConfig();
void saveConfig();
void sendConfig();

// =====================================================
// SETUP
// =====================================================

void setup() {
  LOG.begin(115200);
  LOG.println("\n\n");
  LOG.println("███████╗██╗██████╗  ██████╗ ██████╗  ██████╗ ");
  LOG.println("██╔════╝██║██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗");
  LOG.println("███████╗██║██████╔╝██║   ██║██████╔╝██║   ██║");
  LOG.println("╚════██║██║██╔══██╗██║   ██║██╔══██╗██║   ██║");
  LOG.println("███████║██║██║  ██║╚██████╔╝██████╔╝╚██████╔╝");
  LOG.println("╚══════╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝ ");
  LOG.println("\nSirobo Robot - Initializing...\n");
  
  EEPROM.begin(EEPROM_SIZE);
  
  setupPins();
  setupMotors();
  setupLEDs();
  
  Wire.begin(I2C_SDA, I2C_SCL);
  
  setupDisplay();
  setupIMU();
  setupSensors();
  
  loadCalibration();
  
  setupWiFi();
  setupWebSocket();
  setupWebServer();
  
  showWelcomeScreen();
  
  LOG.println("✓ Sirobo ready!");
}

// =====================================================
// MAIN LOOP
// =====================================================

void loop() {
  unsigned long currentMillis = millis();
  
  // Read sensors every 20ms (50Hz)
  if (currentMillis - lastSensorRead >= 20) {
    readSensors();
    lastSensorRead = currentMillis;
  }
  
  // Update IMU every 10ms (100Hz)
  if (currentMillis - lastIMUUpdate >= 10) {
    updateIMU();
    lastIMUUpdate = currentMillis;
  }
  
  // Update line follower
  if (lineFollowerEnabled) {
    updateLineFollower();
  }
  
  // Update LED effects
  updateLEDs();
  
  // Update buzzer/music
  updateBuzzer();
  
  // Send sensor data via WebSocket every 100ms
  if (currentMillis - lastWebSocketUpdate >= 100) {
    if (clientConnected) {
      sendSensorData();
    }
    lastWebSocketUpdate = currentMillis;
  }
  
  // Clean up WebSocket
  ws.cleanupClients();
  
  // Small delay to prevent watchdog issues
  yield();
}

// =====================================================
// SETUP FUNCTIONS
// =====================================================

void setupPins() {
  // Buttons
  pinMode(BUTTON_1, INPUT_PULLUP);
  pinMode(BUTTON_2, INPUT_PULLUP);
  pinMode(BUTTON_3, INPUT_PULLUP);
  pinMode(BUTTON_4, INPUT_PULLUP);
  
  // Ultrasonic
  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);
  
  // Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  
  LOG.println("✓ Pins configured");
}

void setupMotors() {
  // Motor pins
  pinMode(MOTOR_LEFT_IN1, OUTPUT);
  pinMode(MOTOR_LEFT_IN2, OUTPUT);
  pinMode(MOTOR_RIGHT_IN1, OUTPUT);
  pinMode(MOTOR_RIGHT_IN2, OUTPUT);
  
  // PWM setup for motor enable pins
  ledcSetup(0, PWM_FREQUENCY, PWM_RESOLUTION);
  ledcSetup(1, PWM_FREQUENCY, PWM_RESOLUTION);
  ledcAttachPin(MOTOR_LEFT_EN, 0);
  ledcAttachPin(MOTOR_RIGHT_EN, 1);
  
  robotStop();
  
  LOG.println("✓ Motors configured");
}

void setupSensors() {
  // Line sensors are analog, no special setup needed
  // LDR sensors are analog, no special setup needed
  LOG.println("✓ Sensors configured");
}

void setupIMU() {
  if (!mpu.begin()) {
    LOG.println("✗ MPU6050 not found!");
    return;
  }
  
  mpu.setAccelerometerRange(MPU6050_RANGE_2_G);
  mpu.setGyroRange(MPU6050_RANGE_250_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  
  // Initial calibration - take some readings
  delay(100);
  sensors_event_t a, g, temp;
  for (int i = 0; i < 10; i++) {
    mpu.getEvent(&a, &g, &temp);
    delay(10);
  }
  
  LOG.println("✓ IMU configured");
}

void setupDisplay() {
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    LOG.println("✗ OLED not found!");
    return;
  }
  
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.display();
  
  LOG.println("✓ Display configured");
}

void setupLEDs() {
  FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
  FastLED.setBrightness(128);
  setAllLEDs(0, 0, 0);
  
  LOG.println("✓ LEDs configured");
}

void setupWiFi() {
  // Load configuration from EEPROM
  loadConfig();
  
  // If station mode enabled and valid credentials, try to connect
  if (config.stationMode && strlen(config.wifiSSID) > 0) {
    WiFi.mode(WIFI_AP_STA);
    WiFi.begin(config.wifiSSID, config.wifiPassword);
    
    LOG.print("Connecting to WiFi: ");
    LOG.println(config.wifiSSID);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      LOG.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      LOG.println();
      LOG.print("✓ Connected to WiFi! IP: ");
      LOG.println(WiFi.localIP());
    } else {
      LOG.println();
      LOG.println("✗ Failed to connect to WiFi");
    }
  } else {
    WiFi.mode(WIFI_AP);
  }
  
  // Always start Access Point
  WiFi.softAP(config.apSSID, config.apPassword);
  
  IPAddress IP = WiFi.softAPIP();
  LOG.print("✓ WiFi AP started: ");
  LOG.println(config.apSSID);
  LOG.print("  IP Address: ");
  LOG.println(IP);
}

void setupWebSocket() {
  ws.onEvent([](AsyncWebSocket *server, AsyncWebSocketClient *client, 
                AwsEventType type, void *arg, uint8_t *data, size_t len) {
    switch (type) {
      case WS_EVT_CONNECT:
        LOG.printf("WebSocket client #%u connected\n", client->id());
        clientConnected = true;
        break;
      case WS_EVT_DISCONNECT:
        LOG.printf("WebSocket client #%u disconnected\n", client->id());
        clientConnected = ws.count() > 0;
        robotStop();
        break;
      case WS_EVT_DATA:
        handleWebSocketMessage(arg, data, len);
        break;
      case WS_EVT_PONG:
      case WS_EVT_ERROR:
        break;
    }
  });
  
  server.addHandler(&ws);
  LOG.println("✓ WebSocket configured");
}

void setupWebServer() {
  // CORS headers
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Root endpoint
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "text/html", 
      "<!DOCTYPE html><html><head><title>Sirobo</title></head>"
      "<body style='font-family:sans-serif;text-align:center;padding:50px;'>"
      "<h1>🤖 Sirobo Robot</h1>"
      "<p>Robot is online and ready!</p>"
      "<p>Connect via the Sirobo app.</p>"
      "</body></html>");
  });
  
  // Status endpoint
  server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request) {
    JsonDocument doc;
    doc["status"] = "ok";
    doc["uptime"] = millis();
    doc["clients"] = ws.count();
    doc["heap"] = ESP.getFreeHeap();
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });
  
  // Calibration endpoint
  server.on("/calibration", HTTP_GET, [](AsyncWebServerRequest *request) {
    JsonDocument doc;
    doc["left"] = motorLeftCalibration;
    doc["right"] = motorRightCalibration;
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });
  
  server.begin();
  LOG.println("✓ Web server started");
}

// =====================================================
// WEBSOCKET HANDLING
// =====================================================

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, (char*)data);
    
    if (!error) {
      processCommand(doc);
    }
  }
}

void processCommand(JsonDocument& doc) {
  const char* type = doc["type"];
  
  if (strcmp(type, "move") == 0) {
    int x = doc["x"];
    int y = doc["y"];
    
    // Convert joystick x,y to motor speeds
    int leftSpeed = constrain(y + x, -100, 100);
    int rightSpeed = constrain(y - x, -100, 100);
    
    setMotorSpeed(map(leftSpeed, -100, 100, -255, 255),
                  map(rightSpeed, -100, 100, -255, 255));
  }
  else if (strcmp(type, "forward") == 0) {
    int speed = doc["speed"] | 50;
    robotForward(speed);
  }
  else if (strcmp(type, "backward") == 0) {
    int speed = doc["speed"] | 50;
    robotBackward(speed);
  }
  else if (strcmp(type, "stop") == 0) {
    robotStop();
  }
  else if (strcmp(type, "speed") == 0) {
    baseSpeed = map(doc["value"] | 50, 0, 100, 0, 255);
  }
  else if (strcmp(type, "led") == 0) {
    int index = doc["index"];
    int r = doc["r"];
    int g = doc["g"];
    int b = doc["b"];
    setLED(index, r, g, b);
  }
  else if (strcmp(type, "led_all") == 0) {
    int r = doc["r"];
    int g = doc["g"];
    int b = doc["b"];
    setAllLEDs(r, g, b);
  }
  else if (strcmp(type, "led_rainbow") == 0) {
    setLEDEffect(2);
  }
  else if (strcmp(type, "led_blink") == 0) {
    setLEDEffect(3);
  }
  else if (strcmp(type, "led_breathe") == 0) {
    setLEDEffect(4);
  }
  else if (strcmp(type, "music") == 0) {
    const char* melody = doc["melody"];
    playMelody(melody);
  }
  else if (strcmp(type, "music_stop") == 0) {
    stopTone();
  }
  else if (strcmp(type, "tone") == 0) {
    int freq = doc["freq"];
    int duration = doc["duration"];
    playTone(freq, duration);
  }
  else if (strcmp(type, "turn") == 0) {
    float angle = doc["angle"];
    robotRotate(angle);
  }
  else if (strcmp(type, "line_follower") == 0) {
    lineFollowerEnabled = doc["enable"];
    if (lineFollowerEnabled) {
      lineFollowerSpeed = doc["speed"] | 50;
    }
  }
  else if (strcmp(type, "calibrate") == 0) {
    motorLeftCalibration = doc["left"];
    motorRightCalibration = doc["right"];
  }
  else if (strcmp(type, "save_calibration") == 0) {
    saveCalibration();
  }
  else if (strcmp(type, "auto_calibrate") == 0) {
    autoCalibrateStraight();
  }
  else if (strcmp(type, "display_text") == 0) {
    int line = doc["line"];
    const char* text = doc["text"];
    displayText(line, text);
  }
  else if (strcmp(type, "display_clear") == 0) {
    clearDisplay();
  }
  else if (strcmp(type, "display_image") == 0) {
    const char* image = doc["image"];
    displayImage(image);
  }
  else if (strcmp(type, "reset_yaw") == 0) {
    yawOffset = yaw;
  }
  else if (strcmp(type, "config") == 0) {
    // Update robot configuration
    const char* robotName = doc["robotName"];
    const char* apPassword = doc["apPassword"];
    const char* wifiSSID = doc["wifiSSID"];
    const char* wifiPassword = doc["wifiPassword"];
    
    if (robotName && strlen(robotName) > 0) {
      strncpy(config.apSSID, robotName, 31);
      config.apSSID[31] = '\0';
    }
    if (apPassword && strlen(apPassword) >= 8) {
      strncpy(config.apPassword, apPassword, 31);
      config.apPassword[31] = '\0';
    }
    if (wifiSSID) {
      strncpy(config.wifiSSID, wifiSSID, 31);
      config.wifiSSID[31] = '\0';
      config.stationMode = strlen(wifiSSID) > 0;
    }
    if (wifiPassword) {
      strncpy(config.wifiPassword, wifiPassword, 31);
      config.wifiPassword[31] = '\0';
    }
    
    saveConfig();
    
    // Send confirmation
    JsonDocument response;
    response["type"] = "config_saved";
    response["success"] = true;
    String output;
    serializeJson(response, output);
    ws.textAll(output);
    
    // Restart after 2 seconds
    delay(2000);
    ESP.restart();
  }
  else if (strcmp(type, "get_config") == 0) {
    sendConfig();
  }
  else if (strcmp(type, "scan_wifi") == 0) {
    // Scan for WiFi networks
    int n = WiFi.scanNetworks();
    JsonDocument response;
    response["type"] = "wifi_scan";
    JsonArray networks = response["networks"].to<JsonArray>();
    
    for (int i = 0; i < n && i < 10; i++) {
      JsonObject net = networks.add<JsonObject>();
      net["ssid"] = WiFi.SSID(i);
      net["rssi"] = WiFi.RSSI(i);
      net["secured"] = WiFi.encryptionType(i) != WIFI_AUTH_OPEN;
    }
    
    String output;
    serializeJson(response, output);
    ws.textAll(output);
    WiFi.scanDelete();
  }
}

// =====================================================
// MOTOR CONTROL
// =====================================================

void setMotorSpeed(int left, int right) {
  // Apply calibration
  left += motorLeftCalibration;
  right += motorRightCalibration;
  
  // Constrain values
  left = constrain(left, -255, 255);
  right = constrain(right, -255, 255);
  
  motorLeftSpeed = left;
  motorRightSpeed = right;
  
  // Left motor
  if (left > 0) {
    digitalWrite(MOTOR_LEFT_IN1, HIGH);
    digitalWrite(MOTOR_LEFT_IN2, LOW);
  } else if (left < 0) {
    digitalWrite(MOTOR_LEFT_IN1, LOW);
    digitalWrite(MOTOR_LEFT_IN2, HIGH);
  } else {
    digitalWrite(MOTOR_LEFT_IN1, LOW);
    digitalWrite(MOTOR_LEFT_IN2, LOW);
  }
  ledcWrite(0, abs(left));
  
  // Right motor
  if (right > 0) {
    digitalWrite(MOTOR_RIGHT_IN1, HIGH);
    digitalWrite(MOTOR_RIGHT_IN2, LOW);
  } else if (right < 0) {
    digitalWrite(MOTOR_RIGHT_IN1, LOW);
    digitalWrite(MOTOR_RIGHT_IN2, HIGH);
  } else {
    digitalWrite(MOTOR_RIGHT_IN1, LOW);
    digitalWrite(MOTOR_RIGHT_IN2, LOW);
  }
  ledcWrite(1, abs(right));
}

void robotForward(int speedPercent) {
  int speed = map(speedPercent, 0, 100, 0, 255);
  setMotorSpeed(speed, speed);
}

void robotBackward(int speedPercent) {
  int speed = map(speedPercent, 0, 100, 0, 255);
  setMotorSpeed(-speed, -speed);
}

void robotTurnLeft(int speedPercent) {
  int speed = map(speedPercent, 0, 100, 0, 255);
  setMotorSpeed(-speed, speed);
}

void robotTurnRight(int speedPercent) {
  int speed = map(speedPercent, 0, 100, 0, 255);
  setMotorSpeed(speed, -speed);
}

void robotStop() {
  setMotorSpeed(0, 0);
}

void robotRotate(float targetAngle) {
  float startYaw = yaw - yawOffset;
  float targetYaw = startYaw + targetAngle;
  
  int direction = targetAngle > 0 ? 1 : -1;
  int speed = 100;
  
  setMotorSpeed(speed * direction, -speed * direction);
  
  unsigned long startTime = millis();
  while (millis() - startTime < 5000) { // Timeout 5 seconds
    updateIMU();
    float currentYaw = yaw - yawOffset;
    
    if (direction > 0 && currentYaw >= targetYaw) break;
    if (direction < 0 && currentYaw <= targetYaw) break;
    
    delay(10);
  }
  
  robotStop();
}

// =====================================================
// LINE FOLLOWER
// =====================================================

void updateLineFollower() {
  if (!lineFollowerEnabled) return;
  
  // Calculate line position (weighted average)
  long weightedSum = 0;
  long totalValue = 0;
  
  for (int i = 0; i < 8; i++) {
    int value = lineSensors[i] > 500 ? 1000 : 0;
    weightedSum += (long)value * (i * 1000);
    totalValue += value;
  }
  
  if (totalValue == 0) {
    // No line detected - could be at intersection or lost
    return;
  }
  
  float position = (float)weightedSum / totalValue;
  float center = 3500; // Center position (0-7000)
  float error = position - center;
  
  // PD control
  int correction = error * lineFollowerKp;
  
  int baseSpd = map(lineFollowerSpeed, 0, 100, 0, 200);
  int leftSpeed = baseSpd + correction;
  int rightSpeed = baseSpd - correction;
  
  setMotorSpeed(constrain(leftSpeed, -255, 255), 
                constrain(rightSpeed, -255, 255));
}

bool detectIntersection(const char* type) {
  bool leftEdge = lineSensors[0] > 500;
  bool rightEdge = lineSensors[7] > 500;
  bool center = false;
  
  for (int i = 2; i < 6; i++) {
    if (lineSensors[i] > 500) {
      center = true;
      break;
    }
  }
  
  if (strcmp(type, "left") == 0) {
    return leftEdge && center && !rightEdge;
  }
  else if (strcmp(type, "right") == 0) {
    return rightEdge && center && !leftEdge;
  }
  else if (strcmp(type, "t") == 0) {
    return leftEdge && rightEdge && center;
  }
  else if (strcmp(type, "cross") == 0) {
    return leftEdge && rightEdge && center;
  }
  
  return false;
}

// =====================================================
// SENSOR READING
// =====================================================

void readSensors() {
  // Line sensors
  lineSensors[0] = analogRead(LINE_SENSOR_1);
  lineSensors[1] = analogRead(LINE_SENSOR_2);
  lineSensors[2] = analogRead(LINE_SENSOR_3);
  lineSensors[3] = analogRead(LINE_SENSOR_4);
  lineSensors[4] = analogRead(LINE_SENSOR_5);
  lineSensors[5] = analogRead(LINE_SENSOR_6);
  lineSensors[6] = analogRead(LINE_SENSOR_7);
  lineSensors[7] = analogRead(LINE_SENSOR_8);
  
  // LDR sensors
  ldrLeft = analogRead(LDR_LEFT);
  ldrRight = analogRead(LDR_RIGHT);
  
  // Buttons (active low)
  buttons[0] = !digitalRead(BUTTON_1);
  buttons[1] = !digitalRead(BUTTON_2);
  buttons[2] = !digitalRead(BUTTON_3);
  buttons[3] = !digitalRead(BUTTON_4);
  
  // Distance sensor (non-blocking would be better)
  static unsigned long lastDistanceRead = 0;
  if (millis() - lastDistanceRead > 100) {
    distance = getDistance();
    lastDistanceRead = millis();
  }
}

int getDistance() {
  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(ULTRASONIC_TRIG, LOW);
  
  long duration = pulseIn(ULTRASONIC_ECHO, HIGH, 30000);
  int dist = duration * 0.034 / 2;
  
  return (dist > 400 || dist == 0) ? 400 : dist;
}

bool isLineDetected(int sensorIndex) {
  if (sensorIndex < 0 || sensorIndex > 7) return false;
  return lineSensors[sensorIndex] > 500;
}

// =====================================================
// IMU PROCESSING
// =====================================================

void updateIMU() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  // Simple complementary filter for yaw
  static float gyroYaw = 0;
  float dt = 0.01; // 10ms
  
  gyroYaw += g.gyro.z * dt * (180.0 / M_PI);
  yaw = gyroYaw;
  
  // Pitch and roll from accelerometer
  pitch = atan2(a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + 
                                        a.acceleration.z * a.acceleration.z)) * 180.0 / M_PI;
  roll = atan2(a.acceleration.y, a.acceleration.z) * 180.0 / M_PI;
}

// =====================================================
// LED CONTROL
// =====================================================

void setLED(int index, uint8_t r, uint8_t g, uint8_t b) {
  if (index >= 0 && index < NUM_LEDS) {
    leds[index] = CRGB(r, g, b);
    FastLED.show();
  }
  ledEffect = 1;
}

void setAllLEDs(uint8_t r, uint8_t g, uint8_t b) {
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CRGB(r, g, b);
  }
  FastLED.show();
  ledEffect = 1;
}

void setLEDEffect(int effect) {
  ledEffect = effect;
}

void updateLEDs() {
  if (millis() - lastLEDUpdate < 20) return;
  lastLEDUpdate = millis();
  
  switch (ledEffect) {
    case 2: // Rainbow
      {
        static uint8_t hue = 0;
        for (int i = 0; i < NUM_LEDS; i++) {
          leds[i] = CHSV(hue + (i * 30), 255, 255);
        }
        hue++;
        FastLED.show();
      }
      break;
      
    case 3: // Blink
      {
        static bool blinkState = false;
        static unsigned long lastBlink = 0;
        if (millis() - lastBlink > 500) {
          blinkState = !blinkState;
          for (int i = 0; i < NUM_LEDS; i++) {
            leds[i] = blinkState ? CRGB::White : CRGB::Black;
          }
          FastLED.show();
          lastBlink = millis();
        }
      }
      break;
      
    case 4: // Breathe
      {
        static int brightness = 0;
        static int direction = 5;
        brightness += direction;
        if (brightness >= 255 || brightness <= 0) {
          direction = -direction;
        }
        FastLED.setBrightness(brightness);
        FastLED.show();
      }
      break;
  }
}

// =====================================================
// BUZZER/SOUND
// =====================================================

void playTone(int frequency, int duration) {
  if (frequency > 0) {
    tone(BUZZER_PIN, frequency, duration);
  }
}

void playMelody(const char* melody) {
  // Simple melodies
  if (strcmp(melody, "happy") == 0) {
    int notes[] = {523, 587, 659, 784, 880, 784, 659};
    int durations[] = {150, 150, 150, 150, 300, 150, 300};
    for (int i = 0; i < 7; i++) {
      playTone(notes[i], durations[i]);
      delay(durations[i] + 50);
    }
  }
  else if (strcmp(melody, "victory") == 0) {
    int notes[] = {392, 523, 659, 784, 659, 784, 880};
    int durations[] = {150, 150, 150, 300, 150, 150, 500};
    for (int i = 0; i < 7; i++) {
      playTone(notes[i], durations[i]);
      delay(durations[i] + 50);
    }
  }
  else if (strcmp(melody, "error") == 0) {
    playTone(200, 200);
    delay(100);
    playTone(150, 400);
  }
  else if (strcmp(melody, "startup") == 0) {
    int notes[] = {262, 330, 392, 523};
    int durations[] = {100, 100, 100, 300};
    for (int i = 0; i < 4; i++) {
      playTone(notes[i], durations[i]);
      delay(durations[i] + 20);
    }
  }
}

void stopTone() {
  noTone(BUZZER_PIN);
}

void updateBuzzer() {
  // For non-blocking melody playback (if needed)
}

// =====================================================
// DISPLAY
// =====================================================

void displayText(int line, const char* text) {
  display.setTextSize(1);
  display.setCursor(0, line * 16);
  display.print(text);
  display.display();
}

void displayNumber(int line, int number) {
  char buffer[16];
  sprintf(buffer, "%d", number);
  displayText(line, buffer);
}

void clearDisplay() {
  display.clearDisplay();
  display.display();
}

void displayImage(const char* image) {
  display.clearDisplay();
  
  if (strcmp(image, "happy") == 0) {
    // Draw happy face
    display.drawCircle(42, 32, 20, SSD1306_WHITE);  // Left eye
    display.drawCircle(86, 32, 20, SSD1306_WHITE);  // Right eye
    display.fillCircle(42, 32, 5, SSD1306_WHITE);
    display.fillCircle(86, 32, 5, SSD1306_WHITE);
  }
  else if (strcmp(image, "sad") == 0) {
    display.drawCircle(42, 32, 20, SSD1306_WHITE);
    display.drawCircle(86, 32, 20, SSD1306_WHITE);
    display.fillCircle(42, 38, 5, SSD1306_WHITE);
    display.fillCircle(86, 38, 5, SSD1306_WHITE);
  }
  else if (strcmp(image, "heart") == 0) {
    // Draw heart shape
    display.fillCircle(54, 25, 15, SSD1306_WHITE);
    display.fillCircle(74, 25, 15, SSD1306_WHITE);
    display.fillTriangle(40, 30, 88, 30, 64, 55, SSD1306_WHITE);
  }
  else if (strcmp(image, "robot") == 0) {
    // Draw robot face
    display.drawRect(24, 10, 80, 44, SSD1306_WHITE);
    display.fillRect(34, 20, 20, 15, SSD1306_WHITE);
    display.fillRect(74, 20, 20, 15, SSD1306_WHITE);
    display.drawLine(44, 45, 84, 45, SSD1306_WHITE);
  }
  
  display.display();
}

void showWelcomeScreen() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(20, 10);
  display.println("SIROBO");
  display.setTextSize(1);
  display.setCursor(25, 35);
  display.println("Robot Ready!");
  display.setCursor(20, 50);
  display.println(WiFi.softAPIP().toString());
  display.display();
  
  // Play startup melody
  playMelody("startup");
  
  // Flash LEDs
  setAllLEDs(0, 255, 0);
  delay(200);
  setAllLEDs(0, 0, 255);
  delay(200);
  setAllLEDs(255, 0, 0);
  delay(200);
  setAllLEDs(0, 0, 0);
}

void updateStatusDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  
  display.setCursor(0, 0);
  display.print("IP: ");
  display.println(WiFi.softAPIP().toString());
  
  display.setCursor(0, 12);
  display.print("Clients: ");
  display.println(ws.count());
  
  display.setCursor(0, 24);
  display.print("Yaw: ");
  display.print(yaw - yawOffset, 1);
  display.println(" deg");
  
  display.setCursor(0, 36);
  display.print("Distance: ");
  display.print(distance);
  display.println(" cm");
  
  display.setCursor(0, 48);
  display.print("Line: ");
  for (int i = 0; i < 8; i++) {
    display.print(lineSensors[i] > 500 ? "1" : "0");
  }
  
  display.display();
}

// =====================================================
// CALIBRATION
// =====================================================

void loadCalibration() {
  motorLeftCalibration = (int8_t)EEPROM.read(EEPROM_CALIBRATION_ADDR);
  motorRightCalibration = (int8_t)EEPROM.read(EEPROM_CALIBRATION_ADDR + 1);
  
  // Validate
  if (motorLeftCalibration < -50 || motorLeftCalibration > 50) motorLeftCalibration = 0;
  if (motorRightCalibration < -50 || motorRightCalibration > 50) motorRightCalibration = 0;
  
  LOG.printf("✓ Calibration loaded: L=%d, R=%d\n", motorLeftCalibration, motorRightCalibration);
}

void saveCalibration() {
  EEPROM.write(EEPROM_CALIBRATION_ADDR, (uint8_t)motorLeftCalibration);
  EEPROM.write(EEPROM_CALIBRATION_ADDR + 1, (uint8_t)motorRightCalibration);
  EEPROM.commit();
  
  LOG.printf("✓ Calibration saved: L=%d, R=%d\n", motorLeftCalibration, motorRightCalibration);
}

void autoCalibrateStraight() {
  LOG.println("Starting auto-calibration...");
  
  // Reset yaw
  yawOffset = yaw;
  
  // Drive forward at low speed
  int testSpeed = 100;
  motorLeftCalibration = 0;
  motorRightCalibration = 0;
  
  setMotorSpeed(testSpeed, testSpeed);
  
  delay(500); // Let it stabilize
  
  // Measure yaw drift over 2 seconds
  float startYaw = yaw - yawOffset;
  delay(2000);
  updateIMU();
  float endYaw = yaw - yawOffset;
  
  robotStop();
  
  float drift = endYaw - startYaw;
  
  // Adjust calibration based on drift
  // Positive drift = drifting right = left motor faster
  if (drift > 0) {
    motorRightCalibration = constrain((int)(drift * 2), 0, 50);
  } else {
    motorLeftCalibration = constrain((int)(-drift * 2), 0, 50);
  }
  
  LOG.printf("Drift: %.1f deg, Calibration: L=%d, R=%d\n", 
                drift, motorLeftCalibration, motorRightCalibration);
  
  saveCalibration();
}

// =====================================================
// WEBSOCKET DATA SENDING
// =====================================================

void sendSensorData() {
  JsonDocument doc;
  
  doc["battery"] = 100; // TODO: Implement battery monitoring
  
  JsonArray line = doc["sensors"]["line"].to<JsonArray>();
  for (int i = 0; i < 8; i++) {
    line.add(lineSensors[i]);
  }
  
  JsonArray ldr = doc["sensors"]["ldr"].to<JsonArray>();
  ldr.add(ldrLeft);
  ldr.add(ldrRight);
  
  doc["sensors"]["distance"] = distance;
  doc["sensors"]["yaw"] = yaw - yawOffset;
  doc["sensors"]["pitch"] = pitch;
  doc["sensors"]["roll"] = roll;
  
  JsonArray btns = doc["buttons"].to<JsonArray>();
  for (int i = 0; i < 4; i++) {
    btns.add(buttons[i]);
  }
  
  doc["motorCalibration"]["left"] = motorLeftCalibration;
  doc["motorCalibration"]["right"] = motorRightCalibration;
  
  String output;
  serializeJson(doc, output);
  
  ws.textAll(output);
}

// =====================================================
// CONFIGURATION MANAGEMENT
// =====================================================

void loadConfig() {
  EEPROM.get(EEPROM_CONFIG_ADDR, config);
  
  // Check if config is valid (magic number)
  if (config.magic != EEPROM_CONFIG_MAGIC) {
    // Initialize with defaults
    LOG.println("No valid config found, using defaults");
    config.magic = EEPROM_CONFIG_MAGIC;
    strncpy(config.apSSID, DEFAULT_AP_SSID, 31);
    strncpy(config.apPassword, DEFAULT_AP_PASSWORD, 31);
    config.wifiSSID[0] = '\0';
    config.wifiPassword[0] = '\0';
    config.stationMode = false;
    saveConfig();
  }
  
  LOG.printf("✓ Config loaded: AP=%s\n", config.apSSID);
}

void saveConfig() {
  config.magic = EEPROM_CONFIG_MAGIC;
  EEPROM.put(EEPROM_CONFIG_ADDR, config);
  EEPROM.commit();
  
  LOG.println("✓ Config saved to EEPROM");
}

void sendConfig() {
  JsonDocument doc;
  doc["type"] = "config";
  doc["robotName"] = config.apSSID;
  doc["apPassword"] = "********"; // Don't send actual password
  doc["wifiSSID"] = config.wifiSSID;
  doc["stationMode"] = config.stationMode;
  
  // Add IP addresses
  doc["apIP"] = WiFi.softAPIP().toString();
  if (WiFi.status() == WL_CONNECTED) {
    doc["stationIP"] = WiFi.localIP().toString();
  }
  
  String output;
  serializeJson(doc, output);
  ws.textAll(output);
}