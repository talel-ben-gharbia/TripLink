package com.triplink.mobile.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.navigation.Screen
import com.triplink.mobile.ui.components.Footer
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.components.ResetPasswordForm
import com.triplink.mobile.ui.theme.BackgroundCream

@Composable
fun ResetPasswordScreen(navController: NavController) {
    // Extract token from navigation arguments
    val token = navController.previousBackStackEntry?.arguments?.getString("token")
        ?: navController.currentBackStackEntry?.arguments?.getString("token")
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundCream)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Navbar(navController = navController, user = null, onOpenAuth = {}, onLogout = {})
            
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f)
                    .verticalScroll(rememberScrollState()),
                contentAlignment = Alignment.Center
            ) {
                ResetPasswordForm(
                    token = token,
                    authRepository = LocalAppContainer.current.authRepository,
                    onSuccess = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo("home") { inclusive = true }
                        }
                    },
                    onBack = {
                        navController.navigate(Screen.Home.route)
                    }
                )
            }
            
            Footer(navController = navController)
        }
    }
}

