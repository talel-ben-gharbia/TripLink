package com.triplink.mobile.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream
import kotlinx.coroutines.launch

@Composable
fun AdminDestinationsScreen(
    navController: NavController
) {
    var destinations by remember { mutableStateOf<List<com.triplink.mobile.data.model.DestinationResponse>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val appContainer = LocalAppContainer.current
    
    LaunchedEffect(Unit) {
        scope.launch {
            isLoading = true
            val result = appContainer.adminRepository.getAdminDestinations()
            result.onSuccess {
                destinations = it
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
            
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(16.dp)
            ) {
                Text(
                    text = "Destination Management",
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            if (isLoading && destinations.isEmpty()) {
                LoadingSpinner()
            } else if (error != null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(error ?: "Error loading destinations")
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(destinations) { destination ->
                        DestinationCard(
                            destination = destination,
                            onToggleFeatured = {
                                scope.launch {
                                    appContainer.adminRepository.updateDestinationFeatured(
                                        destination.id,
                                        !destination.isFeatured
                                    )
                                    // Reload
                                    val result = appContainer.adminRepository.getAdminDestinations()
                                    result.onSuccess { destinations = it }
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DestinationCard(
    destination: com.triplink.mobile.data.model.DestinationResponse,
    onToggleFeatured: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = destination.name,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "${destination.city ?: ""}, ${destination.country}",
                style = MaterialTheme.typography.bodySmall
            )
            Text(
                text = "$${String.format("%.0f", destination.price)}",
                style = MaterialTheme.typography.bodyMedium
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onToggleFeatured,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (destination.isFeatured) Color(0xFF4CAF50) else MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text(if (destination.isFeatured) "Unfeature" else "Feature")
                }
            }
        }
    }
}

