#!/usr/bin/env python3
"""
Client example untuk mengakses PlatformIO Compiler API dari komputer lain
Ganti SERVER_IP dengan IP server Anda
"""

import requests
import sys

# GANTI IP INI DENGAN IP SERVER ANDA
SERVER_IP = "192.168.1.77"  # Atau gunakan IP lain dari show_network_info.sh
SERVER_PORT = 8080
BASE_URL = f"http://{SERVER_IP}:{SERVER_PORT}"

def test_connection():
    """Test koneksi ke server"""
    print(f"Testing connection to {BASE_URL}...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        data = response.json()
        print(f"✓ Connected! Server status: {data['status']}")
        print(f"  PlatformIO: {data['platformio']['version']}")
        return True
    except requests.exceptions.ConnectionError:
        print(f"✗ Cannot connect to {BASE_URL}")
        print(f"  Make sure:")
        print(f"  1. Server is running on {SERVER_IP}")
        print(f"  2. Port {SERVER_PORT} is open in firewall")
        print(f"  3. You're on the same network")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def list_boards():
    """List available boards"""
    print("\nGetting available boards...")
    response = requests.get(f"{BASE_URL}/boards")
    data = response.json()
    print(f"✓ {len(data['boards'])} boards available:")
    print(f"  {', '.join(data['boards'])}")
    return data['boards']

def compile_blink(board="uno"):
    """Compile a simple blink program"""
    print(f"\nCompiling blink program for {board}...")
    
    code = """#include <Arduino.h>

void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.begin(9600);
    Serial.println("Blink Example");
}

void loop() {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(500);
    digitalWrite(LED_BUILTIN, LOW);
    delay(500);
}
"""
    
    response = requests.post(f"{BASE_URL}/compile", json={
        "board": board,
        "code": code
    })
    
    data = response.json()
    
    if data['success']:
        print(f"✓ Compilation successful!")
        print(f"  Job ID: {data['job_id']}")
        print(f"  Firmware size: {data['firmware_size']:,} bytes")
        
        # Download firmware
        print(f"\nDownloading firmware...")
        firmware_response = requests.get(f"{BASE_URL}{data['firmware_url']}")
        
        filename = f"firmware_{board}_{data['job_id']}.hex"
        if board.startswith('esp'):
            filename = f"firmware_{board}_{data['job_id']}.bin"
        
        with open(filename, 'wb') as f:
            f.write(firmware_response.content)
        
        print(f"✓ Firmware saved to: {filename}")
        print(f"  Size: {len(firmware_response.content):,} bytes")
        
        return True
    else:
        print(f"✗ Compilation failed!")
        print(f"  Error: {data.get('errors', 'Unknown error')[:500]}")
        return False

def compile_with_libraries(board="uno"):
    """Compile with additional libraries"""
    print(f"\nCompiling program with libraries for {board}...")
    
    code = """#include <Arduino.h>
#include <Wire.h>

void setup() {
    Serial.begin(9600);
    Wire.begin();
    pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
    Serial.println("Hello from PlatformIO API!");
    digitalWrite(LED_BUILTIN, HIGH);
    delay(1000);
    digitalWrite(LED_BUILTIN, LOW);
    delay(1000);
}
"""
    
    response = requests.post(f"{BASE_URL}/compile", json={
        "board": board,
        "code": code,
        "libraries": ["Wire"]
    })
    
    data = response.json()
    
    if data['success']:
        print(f"✓ Compilation successful with libraries!")
        print(f"  Firmware size: {data['firmware_size']:,} bytes")
        return True
    else:
        print(f"✗ Compilation failed: {data.get('message')}")
        return False

def main():
    print("=" * 60)
    print("PlatformIO Compiler API - Remote Client Test")
    print("=" * 60)
    print(f"Server: {BASE_URL}")
    print()
    
    # Test connection
    if not test_connection():
        sys.exit(1)
    
    # List boards
    boards = list_boards()
    
    # Compile for Arduino Uno
    compile_blink("uno")
    
    # Compile for ESP32 (if you want)
    if "esp32" in boards:
        print("\n" + "-" * 60)
        compile_blink("esp32")
    
    # Compile with libraries
    print("\n" + "-" * 60)
    compile_with_libraries("nano")
    
    print("\n" + "=" * 60)
    print("✓ All tests completed!")
    print("=" * 60)
    print(f"\nAPI Documentation: {BASE_URL}/docs")
    print(f"Health Check: {BASE_URL}/health")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n✗ Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)
