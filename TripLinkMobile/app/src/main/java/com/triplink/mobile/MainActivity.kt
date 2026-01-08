package com.triplink.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.triplink.mobile.di.AppContainer
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.navigation.NavGraph
import com.triplink.mobile.ui.theme.TripLinkMobileTheme
import com.triplink.mobile.ui.utils.LocalWindowSize
import com.triplink.mobile.ui.utils.rememberWindowSize
import com.triplink.mobile.ui.viewmodel.AuthStateManager
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private lateinit var appContainer: AppContainer
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        // Initialize dependencies
        appContainer = AppContainer(this)
        
        setContent {
            TripLinkMobileTheme {
                val windowSize = rememberWindowSize()
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CompositionLocalProvider(
                        LocalAppContainer provides appContainer,
                        LocalWindowSize provides windowSize
                    ) {
                        // Initialize auth state on app start
                        LaunchedEffect(Unit) {
                            val user = appContainer.authRepository.getStoredUser()
                            if (user != null) {
                                AuthStateManager.setUser(user)
                                // Verify token is still valid
                                val result = appContainer.authRepository.getCurrentUser()
                                result.onSuccess { response ->
                                    AuthStateManager.setUser(response.user)
                                    appContainer.authRepository.saveUser(response.user)
                                    // Start token refresh service (matching front-end authRefresh.js)
                                    appContainer.tokenRefreshService.start()
                                }.onFailure {
                                    appContainer.authRepository.logout()
                                    AuthStateManager.clearUser()
                                }
                            } else {
                                AuthStateManager.clearUser()
                            }
                        }
                        
                        val navController = rememberNavController()
                        NavGraph(navController = navController)
                    }
                }
            }
        }
    }
}