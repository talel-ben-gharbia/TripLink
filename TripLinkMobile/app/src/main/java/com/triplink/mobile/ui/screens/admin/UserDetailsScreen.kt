package com.triplink.mobile.ui.screens.admin

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream
import kotlinx.coroutines.launch

@Composable
fun UserDetailsScreen(
    navController: NavController,
    userId: Int
) {
    var userDetails by remember { mutableStateOf<com.triplink.mobile.data.model.UserDetailsResponse?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val appContainer = LocalAppContainer.current
    
    LaunchedEffect(userId) {
        scope.launch {
            isLoading = true
            val result = appContainer.adminRepository.getUserDetails(userId)
            result.onSuccess {
                userDetails = it
                isLoading = false
            }.onFailure {
                error = it.message
                isLoading = false
            }
        }
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundCream)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Navbar(
                navController = navController,
                user = null,
                onOpenAuth = {},
                onLogout = {}
            )
            
            if (isLoading) {
                LoadingSpinner()
            } else if (error != null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(error ?: "Error loading user details")
                }
            } else if (userDetails != null) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    val user = userDetails!!.user
                    val stats = userDetails!!.stats
                    
                    Text(
                        text = "User Details",
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold
                    )
                    
                    // User Info Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = "${user.firstName} ${user.lastName}",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(text = "Email: ${user.email}")
                            user.phone?.let { Text(text = "Phone: $it") }
                            Text(text = "Status: ${user.status ?: "PENDING"}")
                            Text(text = "Roles: ${user.roles.joinToString(", ")}")
                        }
                    }
                    
                    // Stats Card
                    stats?.let {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = "Statistics",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(text = "Bookings: ${it.bookings}")
                                Text(text = "Reviews: ${it.reviews}")
                                Text(text = "Wishlist: ${it.wishlist}")
                                Text(text = "Total Spent: $${String.format("%.2f", it.totalSpent)}")
                            }
                        }
                    }
                }
            }
        }
    }
}

