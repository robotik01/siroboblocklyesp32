package com.sirobo.app

import android.annotation.SuppressLint
import android.content.pm.ActivityInfo
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.net.wifi.WifiManager
import android.content.Context
import android.util.Log
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private var wifiManager: WifiManager? = null

    companion object {
        private const val TAG = "SiroboApp"
        private const val WEBSITE_URL = "https://www.sirobo.codes"
    }

    @SuppressLint("SetJavaScriptEnabled", "ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Force landscape orientation immediately
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
        
        // Enable fullscreen immersive mode BEFORE setContentView
        enableImmersiveMode()
        
        // Keep screen on
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        
        setContentView(R.layout.activity_main)

        // Initialize WiFi manager for robot discovery
        wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager

        webView = findViewById(R.id.webView)

        // Configure WebView for optimal touch handling
        configureWebView()

        // Add JavaScript interface for native features
        webView.addJavascriptInterface(SiroboJSInterface(), "Android")

        // Set WebView clients
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                return false
            }
            
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                injectBlocklyTouchFix()
            }
        }
        
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                Log.d(TAG, "JS: ${consoleMessage?.message()}")
                return true
            }
        }

        // Handle back press
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Load website
        webView.loadUrl(WEBSITE_URL)
    }
    
    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            loadWithOverviewMode = true
            useWideViewPort = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            mediaPlaybackRequiresUserGesture = false
        }
        
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false
        WebView.setWebContentsDebuggingEnabled(true)
    }
    
    private fun injectBlocklyTouchFix() {
        val js = """
            (function() {
                if (window._siroboTouchFixed) return;
                window._siroboTouchFixed = true;
                
                // Fix Blockly touch/drag issues in Android WebView
                var fixTouchEvent = function(e) {
                    var target = e.target;
                    while (target) {
                        if (target.classList && (
                            target.classList.contains('blocklyWorkspace') ||
                            target.classList.contains('blocklyFlyout') ||
                            target.classList.contains('blocklyToolboxDiv') ||
                            target.classList.contains('blocklySvg')
                        )) {
                            return;
                        }
                        target = target.parentElement;
                    }
                };
                
                // Prevent WebView from capturing touch events meant for Blockly
                document.addEventListener('touchstart', fixTouchEvent, {passive: true, capture: false});
                document.addEventListener('touchmove', fixTouchEvent, {passive: true, capture: false});
                document.addEventListener('touchend', fixTouchEvent, {passive: true, capture: false});
                
                // Override Blockly.TouchGesture to handle Android WebView better
                if (window.Blockly && window.Blockly.TouchGesture) {
                    var originalStart = window.Blockly.TouchGesture.prototype.handleTouchStart;
                    window.Blockly.TouchGesture.prototype.handleTouchStart = function(e) {
                        e.preventDefault();
                        return originalStart.call(this, e);
                    };
                }
                
                console.log('Sirobo: Touch fix applied for Android WebView');
            })();
        """.trimIndent()
        
        webView.evaluateJavascript(js, null)
    }

    private fun enableImmersiveMode() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_FULLSCREEN
        )
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsControllerCompat(window, window.decorView).let { controller ->
                controller.hide(WindowInsetsCompat.Type.systemBars())
                controller.systemBarsBehavior = 
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) enableImmersiveMode()
    }
    
    override fun onResume() {
        super.onResume()
        enableImmersiveMode()
        webView.onResume()
    }
    
    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    @SuppressLint("MissingPermission")
    private fun scanWifiNetworks(): String {
        try {
            wifiManager?.startScan()
            val results = wifiManager?.scanResults ?: emptyList()
            val siroboNetworks = JSONArray()
            
            for (result in results) {
                if (result.SSID.lowercase().startsWith("sirobo")) {
                    val network = JSONObject().apply {
                        put("ssid", result.SSID)
                        put("signal", result.level)
                        put("bssid", result.BSSID)
                    }
                    siroboNetworks.put(network)
                }
            }
            
            return siroboNetworks.toString()
        } catch (e: Exception) {
            Log.e(TAG, "Error scanning WiFi", e)
            return "[]"
        }
    }

    inner class SiroboJSInterface {
        @JavascriptInterface
        fun getDeviceInfo(): String {
            return JSONObject().apply {
                put("platform", "Android")
                put("model", Build.MODEL)
                put("version", Build.VERSION.SDK_INT)
                put("manufacturer", Build.MANUFACTURER)
            }.toString()
        }

        @JavascriptInterface
        fun showToast(message: String) {
            runOnUiThread {
                android.widget.Toast.makeText(
                    this@MainActivity,
                    message,
                    android.widget.Toast.LENGTH_SHORT
                ).show()
            }
        }
        
        @JavascriptInterface
        fun scanForRobots(): String {
            return scanWifiNetworks()
        }
        
        @JavascriptInterface
        fun isAndroidApp(): Boolean {
            return true
        }
        
        @JavascriptInterface
        fun vibrate(ms: Int) {
            try {
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as android.os.Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(android.os.VibrationEffect.createOneShot(ms.toLong(), android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(ms.toLong())
                }
            } catch (e: Exception) {
                Log.e(TAG, "Vibration error", e)
            }
        }
        
        @JavascriptInterface
        fun log(message: String) {
            Log.d(TAG, "JS: $message")
        }
    }
}
