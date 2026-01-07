package com.triplink.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.triplink.mobile.di.AppContainer
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.navigation.NavGraph
import com.triplink.mobile.ui.theme.TripLinkMobileTheme
import com.triplink.mobile.ui.utils.LocalWindowSize
import com.triplink.mobile.ui.utils.rememberWindowSize

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
                        val navController = rememberNavController()
                        NavGraph(navController = navController)
                    }
                }
            }
        }
    }
}