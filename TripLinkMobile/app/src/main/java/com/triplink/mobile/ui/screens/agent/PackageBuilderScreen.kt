package com.triplink.mobile.ui.screens.agent

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.foundation.background
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.triplink.mobile.ui.components.Footer
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream

@Composable
fun PackageBuilderScreen(navController: NavController) {
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
                    text = "Package Builder",
                    style = MaterialTheme.typography.headlineLarge
                )
                // TODO: Implement package builder UI
            }
            
            Footer(navController = navController)
        }
    }
}

