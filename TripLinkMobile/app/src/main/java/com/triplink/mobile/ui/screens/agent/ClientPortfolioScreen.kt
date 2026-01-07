package com.triplink.mobile.ui.screens.agent

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.triplink.mobile.ui.components.Footer
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream

@Composable
fun ClientPortfolioScreen(navController: NavController) {
    var loading by remember { mutableStateOf(false) }
    var clients by remember { mutableStateOf<List<Any>>(emptyList()) }
    
    // TODO: Load clients from API
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundCream)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Navbar(navController = navController, user = null, onOpenAuth = {}, onLogout = {})
            
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f)
                    .padding(16.dp)
            ) {
                Text(
                    text = "Client Portfolio",
                    style = MaterialTheme.typography.headlineLarge
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                if (loading) {
                    LoadingSpinner()
                } else if (clients.isEmpty()) {
                    Text("No clients found")
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(clients.size) { index ->
                            Card {
                                Text("Client ${index + 1}")
                            }
                        }
                    }
                }
            }
            
            Footer(navController = navController)
        }
    }
}

