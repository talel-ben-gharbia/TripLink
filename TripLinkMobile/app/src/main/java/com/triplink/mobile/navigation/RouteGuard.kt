package com.triplink.mobile.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavController
import com.triplink.mobile.ui.viewmodel.AuthStateManager

/**
 * Route guard composable - protects routes based on authentication and roles
 * Similar to AdminRoute in front-end
 */
@Composable
fun RequireAuth(
    navController: NavController,
    content: @Composable () -> Unit
) {
    val isAuthenticated by AuthStateManager.isAuthenticated.collectAsState()
    
    LaunchedEffect(isAuthenticated) {
        if (!isAuthenticated) {
            navController.navigate(Screen.Home.route) {
                popUpTo(Screen.Home.route) { inclusive = false }
            }
        }
    }
    
    if (isAuthenticated) {
        content()
    }
}

@Composable
fun RequireAdmin(
    navController: NavController,
    content: @Composable () -> Unit
) {
    val isAuthenticated by AuthStateManager.isAuthenticated.collectAsState()
    val isAdmin = AuthStateManager.isAdmin()
    
    LaunchedEffect(isAuthenticated, isAdmin) {
        if (!isAuthenticated || !isAdmin) {
            navController.navigate(Screen.Home.route) {
                popUpTo(Screen.Home.route) { inclusive = false }
            }
        }
    }
    
    if (isAuthenticated && isAdmin) {
        content()
    }
}

@Composable
fun RequireAgent(
    navController: NavController,
    content: @Composable () -> Unit
) {
    val isAuthenticated by AuthStateManager.isAuthenticated.collectAsState()
    val isAgent = AuthStateManager.isAgent()
    
    LaunchedEffect(isAuthenticated, isAgent) {
        if (!isAuthenticated || !isAgent) {
            navController.navigate(Screen.Home.route) {
                popUpTo(Screen.Home.route) { inclusive = false }
            }
        }
    }
    
    if (isAuthenticated && isAgent) {
        content()
    }
}

