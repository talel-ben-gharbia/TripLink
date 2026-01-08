package com.triplink.mobile.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import kotlinx.coroutines.launch
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream
import com.triplink.mobile.ui.viewmodel.AdminDashboardViewModel
import com.triplink.mobile.ui.viewmodel.AdminTab
import com.triplink.mobile.ui.viewmodel.AuthStateManager
import com.triplink.mobile.ui.viewmodel.ViewModelFactory
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun AdminDashboardScreen(
    navController: NavController,
    viewModel: AdminDashboardViewModel = viewModel(
        factory = ViewModelFactory(
            authRepository = LocalAppContainer.current.authRepository,
            destinationRepository = LocalAppContainer.current.destinationRepository,
            apiService = LocalAppContainer.current.apiService
        )
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    val user by AuthStateManager.user.collectAsState()
    val authRepository = LocalAppContainer.current.authRepository
    val coroutineScope = rememberCoroutineScope()
    
    // Load data when screen is displayed
    LaunchedEffect(Unit) {
        viewModel.loadDashboard()
    }
    
    // Verify auth on mount like front-end AdminDashboard
    LaunchedEffect(Unit) {
        val storedUser = authRepository.getStoredUser()
        if (storedUser == null || !storedUser.isAdmin && storedUser.roles?.contains("ROLE_ADMIN") != true) {
            // Not admin, redirect handled by RequireAdmin guard
            return@LaunchedEffect
        }
        // Verify token is still valid
        val response = authRepository.getCurrentUser()
        response.onSuccess { userResponse ->
            if (!userResponse.user.isAdmin && userResponse.user.roles?.contains("ROLE_ADMIN") != true) {
                navController.navigate(com.triplink.mobile.navigation.Screen.Home.route) {
                    popUpTo(0)
                }
            }
        }.onFailure {
            // Token invalid, redirect handled by RequireAdmin guard
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
                user = user,
                onOpenAuth = {},
                onLogout = {
                    coroutineScope.launch {
                        try {
                            authRepository.logout()
                        } catch (e: Exception) {
                            // Log error but continue with logout
                        } finally {
                            AuthStateManager.clearUser()
                            navController.navigate(com.triplink.mobile.navigation.Screen.Home.route) {
                                popUpTo(0)
                            }
                        }
                    }
                }
            )
            
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f)
            ) {
                // Header
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Admin Dashboard",
                                style = MaterialTheme.typography.headlineLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "User Management & Analytics",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                            )
                        }
                    }
                }
                
                // Tabs
                TabRow(
                    selectedTabIndex = AdminTab.values().indexOf(uiState.activeTab),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    AdminTab.values().forEach { tab ->
                        Tab(
                            selected = uiState.activeTab == tab,
                            onClick = { viewModel.setActiveTab(tab) },
                            text = {
                                Text(
                                    text = when (tab) {
                                        AdminTab.OVERVIEW -> "Overview"
                                        AdminTab.USERS -> "Users"
                                        AdminTab.DESTINATIONS -> "Destinations"
                                        AdminTab.COLLECTIONS -> "Collections"
                                        AdminTab.BOOKINGS -> "Bookings"
                                        AdminTab.AGENTS -> "Agents"
                                        AdminTab.AGENT_APPLICATIONS -> "Applications${if (uiState.agentApplications.isNotEmpty()) " (${uiState.agentApplications.size})" else ""}"
                                    },
                                    maxLines = 1
                                )
                            }
                        )
                    }
                }
                
                // Tab Content
                if (uiState.isLoading && uiState.stats == null && uiState.activeTab == AdminTab.OVERVIEW) {
                    LoadingSpinner()
                } else {
                    when (uiState.activeTab) {
                        AdminTab.OVERVIEW -> OverviewTab(uiState, viewModel, navController)
                        AdminTab.USERS -> UsersTab(uiState, viewModel, navController)
                        AdminTab.DESTINATIONS -> DestinationsTab(uiState, viewModel, navController)
                        AdminTab.COLLECTIONS -> CollectionsTab(uiState, viewModel)
                        AdminTab.BOOKINGS -> BookingsTab(uiState, viewModel)
                        AdminTab.AGENTS -> AgentsTab(uiState, viewModel)
                        AdminTab.AGENT_APPLICATIONS -> AgentApplicationsTab(uiState, viewModel)
                    }
                }
            }
        }
    }
}

@Composable
fun OverviewTab(
    uiState: com.triplink.mobile.ui.viewmodel.AdminDashboardUiState,
    viewModel: AdminDashboardViewModel,
    navController: NavController
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            val stats = uiState.stats
            val totalUsers = stats?.totalUsers ?: 0
            val totalDestinations = uiState.destinations.size
            val totalBookings = stats?.totalBookings ?: 0
            val totalCollections = uiState.collections.size
            val totalAgents = stats?.totalAgents ?: 0
            val pendingApplications = stats?.pendingApplications ?: 0
            val totalRevenue = stats?.totalRevenue ?: 0.0
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Total Users",
                    value = totalUsers.toString(),
                    icon = Icons.Default.People,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.setActiveTab(AdminTab.USERS) }
                )
                StatCard(
                    title = "Destinations",
                    value = totalDestinations.toString(),
                    icon = Icons.Default.LocationOn,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.setActiveTab(AdminTab.DESTINATIONS) }
                )
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Bookings",
                    value = totalBookings.toString(),
                    icon = Icons.Default.CalendarToday,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.setActiveTab(AdminTab.BOOKINGS) }
                )
                StatCard(
                    title = "Collections",
                    value = totalCollections.toString(),
                    icon = Icons.Default.Folder,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.setActiveTab(AdminTab.COLLECTIONS) }
                )
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Agents",
                    value = totalAgents.toString(),
                    icon = Icons.Default.Person,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.setActiveTab(AdminTab.AGENTS) }
                )
                StatCard(
                    title = "Pending Apps",
                    value = pendingApplications.toString(),
                    icon = Icons.Default.Schedule,
                    modifier = Modifier.weight(1f),
                    onClick = { viewModel.setActiveTab(AdminTab.AGENT_APPLICATIONS) }
                )
            }
            StatCard(
                title = "Total Revenue",
                value = "$${String.format("%.2f", totalRevenue)}",
                icon = Icons.Default.AttachMoney,
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        // Show error message if any
        uiState.error?.let { error ->
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = "Error: $error",
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
        }
    }
}

@Composable
fun UsersTab(
    uiState: com.triplink.mobile.ui.viewmodel.AdminDashboardUiState,
    viewModel: AdminDashboardViewModel,
    navController: NavController
) {
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Search and Filter
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = uiState.searchTerm,
                onValueChange = { viewModel.setSearchTerm(it) },
                label = { Text("Search users") },
                modifier = Modifier.weight(1f),
                leadingIcon = { Icon(Icons.Default.Search, null) }
            )
            var expanded by remember { mutableStateOf(false) }
            Box {
                FilterChip(
                    onClick = { expanded = true },
                    label = { Text(uiState.filterStatus) },
                    selected = uiState.filterStatus != "ALL"
                )
                DropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    listOf("ALL", "ACTIVE", "PENDING", "SUSPENDED").forEach { status ->
                        DropdownMenuItem(
                            text = { Text(status) },
                            onClick = {
                                viewModel.setFilterStatus(status)
                                expanded = false
                            }
                        )
                    }
                }
            }
        }
        
        val filteredUsers = viewModel.getFilteredUsers()
        
        if (uiState.isLoading) {
            LoadingSpinner()
        } else if (filteredUsers.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text("No users found")
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredUsers) { user ->
                    UserCard(user, viewModel, navController)
                }
            }
        }
    }
}

@Composable
fun UserCard(
    user: com.triplink.mobile.data.model.UserData,
    viewModel: AdminDashboardViewModel,
    navController: NavController
) {
    var showActions by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { navController.navigate("admin/users/${user.id}") },
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "${user.firstName ?: ""} ${user.lastName ?: ""}".trim().ifEmpty { user.email },
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = user.email,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = when (user.status) {
                        "ACTIVE" -> Color(0xFF4CAF50).copy(alpha = 0.2f)
                        "PENDING" -> Color(0xFFFF9800).copy(alpha = 0.2f)
                        "SUSPENDED" -> Color(0xFFF44336).copy(alpha = 0.2f)
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    }
                ) {
                    Text(
                        text = user.status ?: "UNKNOWN",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = when (user.status) {
                            "ACTIVE" -> Color(0xFF4CAF50)
                            "PENDING" -> Color(0xFFFF9800)
                            "SUSPENDED" -> Color(0xFFF44336)
                            else -> MaterialTheme.colorScheme.onSurface
                        }
                    )
                }
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (user.status != "SUSPENDED") {
                    OutlinedButton(
                        onClick = { viewModel.suspendUser(user.id) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Suspend")
                    }
                } else {
                    Button(
                        onClick = { viewModel.activateUser(user.id) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Activate")
                    }
                }
                Button(
                    onClick = { viewModel.deleteUser(user.id) },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Delete")
                }
            }
        }
    }
}

@Composable
fun DestinationsTab(
    uiState: com.triplink.mobile.ui.viewmodel.AdminDashboardUiState,
    viewModel: AdminDashboardViewModel,
    navController: NavController
) {
    if (uiState.isLoading) {
        LoadingSpinner()
    } else if (uiState.destinations.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("No destinations")
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.destinations) { destination ->
                DestinationCard(destination, viewModel)
            }
        }
    }
}

@Composable
fun DestinationCard(
    destination: com.triplink.mobile.data.model.DestinationResponse,
    viewModel: AdminDashboardViewModel
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = destination.name ?: "Destination",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${destination.city ?: ""}, ${destination.country ?: ""}",
                    style = MaterialTheme.typography.bodySmall
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(
                    onClick = {
                        if (destination.isFeatured) {
                            viewModel.unfeatureDestination(destination.id)
                        } else {
                            viewModel.featureDestination(destination.id)
                        }
                    }
                ) {
                    Icon(
                        imageVector = if (destination.isFeatured) Icons.Default.Star else Icons.Default.StarBorder,
                        contentDescription = "Feature",
                        tint = if (destination.isFeatured) Color(0xFFFFD700) else MaterialTheme.colorScheme.onSurface
                    )
                }
                IconButton(
                    onClick = {
                        if (destination.isPinned) {
                            viewModel.unpinDestination(destination.id)
                        } else {
                            viewModel.pinDestination(destination.id)
                        }
                    }
                ) {
                    Icon(
                        imageVector = if (destination.isPinned) Icons.Default.PushPin else Icons.Default.PushPin,
                        contentDescription = "Pin",
                        tint = if (destination.isPinned) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            }
        }
    }
}

@Composable
fun CollectionsTab(
    uiState: com.triplink.mobile.ui.viewmodel.AdminDashboardUiState,
    viewModel: AdminDashboardViewModel
) {
    if (uiState.isLoading) {
        LoadingSpinner()
    } else if (uiState.collections.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("No collections")
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.collections) { collection ->
                CollectionCard(collection)
            }
        }
    }
}

@Composable
fun CollectionCard(collection: com.triplink.mobile.data.model.CollectionResponse) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = collection.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${collection.destinationCount} destinations",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

@Composable
fun BookingsTab(
    uiState: com.triplink.mobile.ui.viewmodel.AdminDashboardUiState,
    viewModel: AdminDashboardViewModel
) {
    if (uiState.loadingBookings) {
        LoadingSpinner()
    } else {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            uiState.bookingStats?.let { stats ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = "Total",
                        value = stats.totalBookings.toString(),
                        icon = Icons.Default.CalendarToday,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Pending",
                        value = stats.pendingBookings.toString(),
                        icon = Icons.Default.Schedule,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Confirmed",
                        value = stats.confirmedBookings.toString(),
                        icon = Icons.Default.CheckCircle,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            if (uiState.bookings.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No bookings")
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.bookings) { booking ->
                        AdminBookingCard(booking, viewModel)
                    }
                }
            }
        }
    }
}

@Composable
fun AdminBookingCard(
    booking: com.triplink.mobile.data.model.BookingResponse,
    viewModel: AdminDashboardViewModel
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
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = booking.destination?.name ?: "Destination",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${booking.destination?.city ?: ""}, ${booking.destination?.country ?: ""}",
                        style = MaterialTheme.typography.bodySmall
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
                        text = booking.status ?: "UNKNOWN",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
            Text(
                text = booking.totalPrice?.let { "$${String.format("%.2f", it)}" } ?: "N/A",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (booking.status == "CONFIRMED") {
                    Button(
                        onClick = { viewModel.completeBooking(booking.id) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Complete")
                    }
                }
            }
        }
    }
}

@Composable
fun AgentsTab(
    uiState: com.triplink.mobile.ui.viewmodel.AdminDashboardUiState,
    viewModel: AdminDashboardViewModel
) {
    if (uiState.loadingAgents) {
        LoadingSpinner()
    } else if (uiState.agents.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("No agents")
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.agents) { agent ->
                AgentCard(agent, viewModel)
            }
        }
    }
}

@Composable
fun AgentCard(
    agent: com.triplink.mobile.data.model.UserData,
    viewModel: AdminDashboardViewModel
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "${agent.firstName ?: ""} ${agent.lastName ?: ""}".trim().ifEmpty { agent.email },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = agent.email,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            Button(
                onClick = { viewModel.removeAgentRole(agent.id) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                )
            ) {
                Text("Remove Role")
            }
        }
    }
}

@Composable
fun AgentApplicationsTab(
    uiState: com.triplink.mobile.ui.viewmodel.AdminDashboardUiState,
    viewModel: AdminDashboardViewModel
) {
    if (uiState.loadingApplications) {
        LoadingSpinner()
    } else if (uiState.agentApplications.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("No applications")
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.agentApplications) { application ->
                AgentApplicationCard(application, viewModel)
            }
        }
    }
}

@Composable
fun AgentApplicationCard(
    application: com.triplink.mobile.data.model.AgentApplicationResponse,
    viewModel: AdminDashboardViewModel
) {
    var showApproveDialog by remember { mutableStateOf(false) }
    var showRejectDialog by remember { mutableStateOf(false) }
    var adminNotes by remember { mutableStateOf("") }
    
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
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "${application.firstName} ${application.lastName}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = application.email,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = when (application.status) {
                        "APPROVED" -> Color(0xFF4CAF50).copy(alpha = 0.2f)
                        "REJECTED" -> Color(0xFFF44336).copy(alpha = 0.2f)
                        else -> Color(0xFFFF9800).copy(alpha = 0.2f)
                    }
                ) {
                    Text(
                        text = application.status ?: "UNKNOWN",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
            
            application.company?.let {
                Text(
                    text = "Company: $it",
                    style = MaterialTheme.typography.bodySmall
                )
            }
            
            if (application.status == "PENDING") {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { showApproveDialog = true },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50)
                        )
                    ) {
                        Text("Approve")
                    }
                    Button(
                        onClick = { showRejectDialog = true },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Text("Reject")
                    }
                }
            }
        }
    }
    
    if (showApproveDialog) {
        AlertDialog(
            onDismissRequest = { showApproveDialog = false },
            title = { Text("Approve Application") },
            text = {
                OutlinedTextField(
                    value = adminNotes,
                    onValueChange = { adminNotes = it },
                    label = { Text("Admin Notes (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.approveAgentApplication(application.id, adminNotes.takeIf { it.isNotEmpty() })
                        showApproveDialog = false
                        adminNotes = ""
                    }
                ) {
                    Text("Approve")
                }
            },
            dismissButton = {
                TextButton(onClick = { showApproveDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    if (showRejectDialog) {
        AlertDialog(
            onDismissRequest = { showRejectDialog = false },
            title = { Text("Reject Application") },
            text = {
                OutlinedTextField(
                    value = adminNotes,
                    onValueChange = { adminNotes = it },
                    label = { Text("Rejection Reason") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.rejectAgentApplication(application.id, adminNotes)
                        showRejectDialog = false
                        adminNotes = ""
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Reject")
                }
            },
            dismissButton = {
                TextButton(onClick = { showRejectDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {}
) {
    Card(
        modifier = modifier.clickable(enabled = onClick != {}) { onClick() },
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
                tint = MaterialTheme.colorScheme.primary,
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
