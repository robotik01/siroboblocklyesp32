# Sirobo Android App

Android WebView wrapper untuk menjalankan website Sirobo dalam mode fullscreen immersive.

## Cara Build

### Prasyarat
- Android Studio (Hedgehog atau lebih baru)
- Android SDK 24+ (Android 7.0 Nougat)
- Java 17

### Langkah Build

1. Buka folder `android` di Android Studio
2. Sync Gradle files
3. Build APK: `Build > Build Bundle(s) / APK(s) > Build APK(s)`
4. APK akan berada di `app/build/outputs/apk/release/`

## Fitur

- ✅ WebView fullscreen immersive mode
- ✅ Dukungan WebSocket untuk koneksi real-time
- ✅ Web Serial API support (Chrome custom tabs fallback)
- ✅ Landscape dan Portrait orientation
- ✅ File access untuk upload/download
- ✅ JavaScript enabled
- ✅ Auto-hide system bars
- ✅ Back button handling
- ✅ Loading progress indicator
- ✅ Offline detection

## Konfigurasi

Edit `app/src/main/java/com/sirobo/app/MainActivity.kt` untuk mengubah URL website:

```kotlin
private const val WEBSITE_URL = "https://sirobo.web.app"
```

Atau untuk development lokal:
```kotlin
private const val WEBSITE_URL = "http://192.168.1.100:5173"
```

## Permissions

App membutuhkan:
- `INTERNET` - untuk akses web
- `ACCESS_NETWORK_STATE` - untuk cek koneksi
- `ACCESS_WIFI_STATE` - untuk WiFi info
- `CHANGE_WIFI_STATE` - untuk WiFi scanning
- `USB_PERMISSION` - untuk USB OTG (opsional)
