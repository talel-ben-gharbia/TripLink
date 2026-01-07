package com.triplink.mobile.ui.screens.agent

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import com.triplink.mobile.ui.viewmodel.AgentDashboardViewModel
import com.triplink.mobile.ui.viewmodel.ViewModelFactory

@Composable
fun AgentDashboardScreen(
    navController: NavController,
    viewModel: AgentDashboardViewModel = viewModel(
        factory = ViewModelFactory(
            authRepository = LocalAppContainer.current.authRepository,
            destinationRepository = LocalAppContainer.current.destinationRepository,
            apiService = LocalAppContainer.current.apiService
        )
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    
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
                user = null, // TODO: Get from auth state
                onOpenAuth = {},
                onLogout = {}
            )
            
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                Text(
                    text = "Agent Dashboard",
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(16.dp)
                )
                
                // Tabs
                TabRow(
                    selectedTabIndex = com.triplink.mobile.ui.viewmodel.AgentTab.values().indexOf(uiState.activeTab),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    com.triplink.mobile.ui.viewmodel.AgentTab.values().forEach { tab ->
                        Tab(
                            selected = uiState.activeTab == tab,
                            onClick = { viewModel.setActiveTab(tab) },
                            text = {
                                Text(
                                    text = when (tab) {
                                        com.triplink.mobile.ui.viewmodel.AgentTab.OVERVIEW -> "Overview"
                                        com.triplink.mobile.ui.viewmodel.AgentTab.PENDING -> "Pending${if (uiState.pendingBookings.isNotEmpty()) " (${uiState.pendingBookings.size})" else ""}"
                                        com.triplink.mobile.ui.viewmodel.AgentTab.MY_BOOKINGS -> "My Bookings"
                                        com.triplink.mobile.ui.viewmodel.AgentTab.CLIENTS -> "Clients"
                                    }
                                )
                            }
                        )
                    }
                }
                
                // Tab Content
                if (uiState.isLoading && uiState.stats == null && uiState.activeTab == com.triplink.mobile.ui.viewmodel.AgentTab.OVERVIEW) {
                    LoadingSpinner()
                } else {
                    when (uiState.activeTab) {
                        com.triplink.mobile.ui.viewmodel.AgentTab.OVERVIEW -> OverviewTab(uiState, viewModel)
                        com.triplink.mobile.ui.viewmodel.AgentTab.PENDING -> PendingTab(uiState, viewModel)
                        com.triplink.mobile.ui.viewmodel.AgentTab.MY_BOOKINGS -> MyBookingsTab(uiState, viewModel)
                        com.triplink.mobile.ui.viewmodel.AgentTab.CLIENTS -> ClientsTab(navController)
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Purple600,
                modifier = Modifier.size(24.dp)
            )
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
        }
    }
}

@Composable
fun OverviewTab(
    uiState: com.triplink.mobile.ui.viewmodel.AgentDashboardUiState,
    viewModel: AgentDashboardViewModel
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            uiState.stats?.let { stats ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = "Total Bookings",
                        value = stats.bookings.toString(),
                        icon = Icons.Default.CalendarToday,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Revenue",
                        value = "$${String.format("%.0f", stats.totalRevenue)}",
                        icon = Icons.Default.AttachMoney,
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = "Pending",
                        value = stats.pendingBookings.toString(),
                        icon = Icons.Default.Schedule,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Clients",
                        value = stats.clients.toString(),
                        icon = Icons.Default.People,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
        
        if (uiState.recentBookings.isNotEmpty()) {
            item {
                Text(
                    text = "Recent Bookings",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            items(uiState.recentBookings.take(5)) { booking ->
                BookingCard(
                    booking = booking,
                    onAssign = null,
                    onConfirm = null
                )
            }
        }
    }
}

@Composable
fun PendingTab(
    uiState: com.triplink.mobile.ui.viewmodel.AgentDashboardUiState,
    viewModel: AgentDashboardViewModel
) {
    if (uiState.isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    } else if (uiState.pendingBookings.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Schedule,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
                Text(
                    text = "No pending bookings",
                    style = MaterialTheme.typography.titleLarge
                )
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.pendingBookings) { booking ->
                BookingCard(
                    booking = booking,
                    onAssign = { viewModel.assignBooking(booking.id) },
                    onConfirm = null
                )
            }
        }
    }
}

@Composable
fun MyBookingsTab(
    uiState: com.triplink.mobile.ui.viewmodel.AgentDashboardUiState,
    viewModel: AgentDashboardViewModel
) {
    if (uiState.isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    } else if (uiState.myBookings.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.CalendarToday,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
                Text(
                    text = "No bookings assigned",
                    style = MaterialTheme.typography.titleLarge
                )
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.myBookings) { booking ->
                BookingCard(
                    booking = booking,
                    onAssign = null,
                    onConfirm = if (booking.status == "PENDING") { { viewModel.confirmBooking(booking.id) } } else null
                )
            }
        }
    }
}

@Composable
fun ClientsTab(navController: NavController) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.People,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
            )
            Text(
                text = "Client Portfolio",
                style = MaterialTheme.typography.titleLarge
            )
            Button(
                onClick = { navController.navigate("agent/clients") }
            ) {
                Text("View Client Portfolio")
            }
        }
    }
}

@Composable
fun BookingCard(
    booking: com.triplink.mobile.data.model.BookingResponse,
    onAssign: (() -> Unit)?,
    onConfirm: (() -> Unit)?
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = booking.destination?.name ?: "Destination",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${booking.destination?.city ?: ""}, ${booking.destination?.country ?: ""}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = when (booking.status) {
                        "CONFIRMED" -> Color(0xFF4CAF50).copy(alpha = 0.2f)
                        "PENDING" -> Color(0xFFFF9800).copy(alpha = 0.2f)
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    }
                ) {
                    Text(
                        text = booking.status,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
            
            Text(
                text = "Date: ${booking.checkInDate ?: booking.travelDate}",
                style = MaterialTheme.typography.bodySmall
            )
            Text(
                text = "Guests: ${booking.numberOfGuests ?: booking.numberOfTravelers}",
                style = MaterialTheme.typography.bodySmall
            )
            Text(
                text = "Total: $${String.format("%.0f", booking.totalPrice)}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold
            )
            
            booking.user?.let { user ->
                Text(
                    text = "Client: ${user.firstName ?: ""} ${user.lastName ?: ""} (${user.email})",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
            
            if (onAssign != null || onConfirm != null) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    onAssign?.let {
                        Button(
                            onClick = it,
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Assign to Me")
                        }
                    }
                    onConfirm?.let {
                        Button(
                            onClick = it,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF4CAF50)
                            )
                        ) {
                            Text("Confirm")
                        }
                    }
                }
            }
        }
    }
}

