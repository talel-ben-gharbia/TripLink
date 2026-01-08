package com.triplink.mobile.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.repository.AuthRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Token refresh manager - refreshes token every 10 minutes if user is active
 * Similar to authRefresh.js in front-end
 */
class TokenRefreshManager(
    application: Application,
    private val authRepository: AuthRepository
) : AndroidViewModel(application) {
    
    private var refreshJob: Job? = null
    private var lastActivity = System.currentTimeMillis()
    
    fun startTokenRefresh() {
        stopTokenRefresh()
        
        refreshJob = viewModelScope.launch {
            while (true) {
                delay(10 * 60 * 1000) // Every 10 minutes
                
                val idle = System.currentTimeMillis() - lastActivity > 5 * 60 * 1000 // 5 min idle
                if (idle) continue // don't refresh if idle
                
                val isAuth = authRepository.isAuthenticated()
                if (!isAuth) continue
                
                try {
                    val result = authRepository.refreshToken()
                    result.onFailure {
                        // Refresh failed - clear auth state
                        authRepository.logout()
                        AuthStateManager.clearUser()
                    }
                } catch (e: Exception) {
                    // Refresh failed - clear auth state
                    authRepository.logout()
                    AuthStateManager.clearUser()
                }
            }
        }
    }
    
    fun stopTokenRefresh() {
        refreshJob?.cancel()
        refreshJob = null
    }
    
    fun recordActivity() {
        lastActivity = System.currentTimeMillis()
    }
}

