package com.triplink.mobile.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.triplink.mobile.ui.components.Footer
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream

@Composable
fun PublicProfileScreen(
    navController: NavController,
    userId: Int
) {
    var loading by remember { mutableStateOf(true) }
    var profile by remember { mutableStateOf<Any?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    
    // TODO: Load profile data from API
    
    LaunchedEffect(userId) {
        // TODO: Implement profile loading
        loading = false
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundCream)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Navbar(navController = navController, user = null, onOpenAuth = {}, onLogout = {})
            
            if (loading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    LoadingSpinner()
                }
            } else if (error != null || profile == null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "Profile Not Found",
                            style = MaterialTheme.typography.headlineMedium
                        )
                        Text(
                            text = error ?: "The profile you are looking for does not exist."
                        )
                        Button(onClick = { navController.navigate("home") }) {
                            Text("Go Home")
                        }
                    }
                }
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // TODO: Display profile information
                    Text(
                        text = "Public Profile",
                        style = MaterialTheme.typography.headlineLarge
                    )
                    Text("User ID: $userId")
                }
            }
            
            Footer(navController = navController)
        }
    }
}

