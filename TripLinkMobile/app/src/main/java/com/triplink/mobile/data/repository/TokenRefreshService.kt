package com.triplink.mobile.data.repository

import android.app.Activity
import android.util.Log
import com.triplink.mobile.data.local.AuthTokenManager
import com.triplink.mobile.data.remote.ApiService
import com.triplink.mobile.ui.viewmodel.AuthStateManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.concurrent.atomic.AtomicLong

/**
 * Token refresh service - matches front-end authRefresh.js behavior
 * Refreshes token every 10 minutes if user was active in the last 5 minutes
 */
class TokenRefreshService(
    private val apiService: ApiService,
    private val tokenManager: AuthTokenManager
) {
    private var refreshJob: Job? = null
    private val lastActivity = AtomicLong(System.currentTimeMillis())
    private val scope = CoroutineScope(Dispatchers.IO)
    
    fun recordActivity() {
        lastActivity.set(System.currentTimeMillis())
    }
    
    fun start() {
        stop() // Stop any existing refresh job
        
        refreshJob = scope.launch {
            while (true) {
                delay(10 * 60 * 1000) // Every 10 minutes
                
                val idle = System.currentTimeMillis() - lastActivity.get() > 5 * 60 * 1000 // 5 min idle
                if (idle) continue // Don't refresh if idle
                
                val token = tokenManager.getToken()
                if (token == null) {
                    // No token, stop refreshing
                    stop()
                    return@launch
                }
                
                try {
                    val response = apiService.refreshToken()
                    if (response.isSuccessful && response.body() != null) {
                        val authResponse = response.body()!!
                        // Refresh token always returns a new token
                        authResponse.token?.let { tokenManager.saveToken(it) }
                        authResponse.refresh_token?.let { tokenManager.saveRefreshToken(it) }
                        Log.d("TokenRefresh", "Token refreshed successfully")
                    } else {
                        // Refresh failed - clear auth state
                        Log.w("TokenRefresh", "Token refresh failed")
                        tokenManager.clearToken()
                        AuthStateManager.clearUser()
                        stop()
                    }
                } catch (e: Exception) {
                    Log.e("TokenRefresh", "Token refresh error", e)
                    tokenManager.clearToken()
                    AuthStateManager.clearUser()
                    stop()
                }
            }
        }
    }
    
    fun stop() {
        refreshJob?.cancel()
        refreshJob = null
    }
}

