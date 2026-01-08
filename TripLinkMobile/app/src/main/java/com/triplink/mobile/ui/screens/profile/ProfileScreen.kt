package com.triplink.mobile.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.navigation.Screen
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream
import com.triplink.mobile.ui.utils.TextUtils
import com.triplink.mobile.ui.viewmodel.ProfileTab
import com.triplink.mobile.ui.viewmodel.ProfileViewModel
import com.triplink.mobile.ui.viewmodel.PreferencesSubTab
import com.triplink.mobile.ui.viewmodel.ViewModelFactory
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun ProfileScreen(
    navController: NavController,
    viewModel: ProfileViewModel = viewModel(
        factory = ViewModelFactory(
            authRepository = LocalAppContainer.current.authRepository,
            destinationRepository = LocalAppContainer.current.destinationRepository,
            apiService = LocalAppContainer.current.apiService
        )
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAuthModal by remember { mutableStateOf(false) }
    
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
                user = uiState.user,
                onOpenAuth = { showAuthModal = true },
                onLogout = {
                    viewModel.logout()
                    navController.navigate(Screen.Home.route) {
                        popUpTo("home") { inclusive = true }
                    }
                }
            )
            
            if (uiState.isLoading && uiState.user == null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else if (uiState.user != null) {
                ProfileContent(
                    uiState = uiState,
                    viewModel = viewModel,
                    navController = navController
                )
            } else {
                // Not logged in
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
                            text = "Please log in to view your profile",
                            style = MaterialTheme.typography.titleLarge
                        )
                        Button(
                            onClick = { showAuthModal = true }
                        ) {
                            Text("Sign In")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileContent(
    uiState: com.triplink.mobile.ui.viewmodel.ProfileUiState,
    viewModel: ProfileViewModel,
    navController: NavController
) {
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Profile Header
        ProfileHeader(
            user = uiState.user,
            saving = uiState.saving,
            lastSaved = uiState.lastSaved,
            completion = viewModel.getProfileCompletion(),
            navController = navController
        )
        
        // Tabs
        TabRow(
            selectedTabIndex = ProfileTab.values().indexOf(uiState.activeTab),
            modifier = Modifier.fillMaxWidth()
        ) {
            ProfileTab.values().forEach { tab ->
                Tab(
                    selected = uiState.activeTab == tab,
                    onClick = { viewModel.setActiveTab(tab) },
                    text = {
                        Text(
                            text = when (tab) {
                                ProfileTab.OVERVIEW -> "Overview"
                                ProfileTab.BOOKINGS -> "Bookings"
                                ProfileTab.PREFERENCES -> "Preferences"
                                ProfileTab.WISHLIST -> "Wishlist${if (tab == ProfileTab.WISHLIST && uiState.wishlist.isNotEmpty()) " (${uiState.wishlist.size})" else ""}"
                                ProfileTab.REVIEWS -> "Reviews"
                                ProfileTab.ACTIVITY -> "Activity"
                                ProfileTab.SETTINGS -> "Settings"
                            }
                        )
                    }
                )
            }
        }
        
        // Tab Content
        when (uiState.activeTab) {
            ProfileTab.OVERVIEW -> OverviewTab(uiState, viewModel, navController)
            ProfileTab.BOOKINGS -> BookingsTab(uiState, viewModel, navController)
            ProfileTab.PREFERENCES -> PreferencesTab(uiState, viewModel)
            ProfileTab.WISHLIST -> WishlistTab(uiState, viewModel, navController)
            ProfileTab.REVIEWS -> ReviewsTab(uiState)
            ProfileTab.ACTIVITY -> ActivityTab(uiState)
            ProfileTab.SETTINGS -> SettingsTab(uiState, viewModel, navController)
        }
    }
}

@Composable
fun ProfileHeader(
    user: com.triplink.mobile.data.model.UserData?,
    saving: Boolean,
    lastSaved: Date?,
    completion: Int,
    navController: NavController
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Profile Image
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                user?.let {
                    if (it.profileImage != null) {
                        AsyncImage(
                            model = it.profileImage,
                            contentDescription = "Profile",
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
            
            user?.let {
                Text(
                    text = TextUtils.formatUserName(it.firstName, it.lastName, it.email),
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )
                
                Text(
                    text = it.email,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
            
            // Profile Completion
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Profile Completion",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "$completion%",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                LinearProgressIndicator(
                    progress = completion / 100f,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp))
                )
            }
            
            // Auto-save indicator
            if (saving) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp
                    )
                    Text(
                        text = "Auto-saving...",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            } else if (lastSaved != null) {
                Text(
                    text = "Last saved: ${SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(lastSaved)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
        }
    }
}

@Composable
fun OverviewTab(
    uiState: com.triplink.mobile.ui.viewmodel.ProfileUiState,
    viewModel: ProfileViewModel,
    navController: NavController
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Personal Information",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    
                    uiState.user?.let { user ->
                        ProfileInfoRow("Name", "${user.firstName ?: ""} ${user.lastName ?: ""}".trim())
                        ProfileInfoRow("Email", user.email)
                        user.phone?.let { ProfileInfoRow("Phone", it) }
                        if (!user.roles.isNullOrEmpty()) {
                            ProfileInfoRow("Role", user.roles!!.joinToString(", "))
                        }
                        ProfileInfoRow("Profile Completion", "${viewModel.getProfileCompletion()}%")
                    }
                }
            }
        }
        
        item {
            // Top Preferences
            val topPrefs = viewModel.getTopPreferences()
            if (topPrefs.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Top Preferences",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(topPrefs) { (key, value) ->
                                Surface(
                                    shape = RoundedCornerShape(16.dp),
                                    color = MaterialTheme.colorScheme.primaryContainer
                                ) {
                                    Text(
                                        text = "${key.replace(Regex("([A-Z])"), " $1").trimStart()} $value%",
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
        
        item {
            // Quick Stats
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "Wishlist",
                    value = uiState.wishlist.size.toString(),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Bookings",
                    value = uiState.bookings.size.toString(),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Reviews",
                    value = uiState.reviews.size.toString(),
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
fun BookingsTab(
    uiState: com.triplink.mobile.ui.viewmodel.ProfileUiState,
    viewModel: ProfileViewModel,
    navController: NavController
) {
    if (uiState.bookings.isEmpty() && !uiState.bookingsLoading) {
        viewModel.loadBookings()
    }
    
    if (uiState.bookingsLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    } else if (uiState.bookings.isEmpty()) {
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
                    text = "No bookings yet",
                    style = MaterialTheme.typography.titleLarge
                )
                Button(
                    onClick = { navController.navigate("destinations") }
                ) {
                    Text("Browse Destinations")
                }
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(uiState.bookings) { booking ->
                BookingCardItem(booking, navController)
            }
        }
    }
}

@Composable
fun BookingCardItem(
    booking: com.triplink.mobile.data.model.BookingResponse,
    navController: NavController
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { navController.navigate("bookings") },
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
                        "CANCELLED" -> Color(0xFFF44336).copy(alpha = 0.2f)
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    }
                ) {
                    Text(
                        text = booking.status ?: "UNKNOWN",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = when (booking.status) {
                            "CONFIRMED" -> Color(0xFF4CAF50)
                            "PENDING" -> Color(0xFFFF9800)
                            "CANCELLED" -> Color(0xFFF44336)
                            else -> MaterialTheme.colorScheme.onSurface
                        }
                    )
                }
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Total: ${booking.totalPrice?.let { "$${String.format("%.0f", it)}" } ?: "Not available"}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = booking.checkInDate ?: booking.travelDate ?: "Date not set",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
        }
    }
}

@Composable
fun PreferencesTab(
    uiState: com.triplink.mobile.ui.viewmodel.ProfileUiState,
    viewModel: ProfileViewModel
) {
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Sub-tabs
        TabRow(
            selectedTabIndex = PreferencesSubTab.values().indexOf(uiState.preferencesSubTab),
            modifier = Modifier.fillMaxWidth()
        ) {
            PreferencesSubTab.values().forEach { tab ->
                Tab(
                    selected = uiState.preferencesSubTab == tab,
                    onClick = { viewModel.setPreferencesSubTab(tab) },
                    text = {
                        Text(
                            text = when (tab) {
                                PreferencesSubTab.PERSONALITY -> "Personality"
                                PreferencesSubTab.CATEGORIES -> "Categories"
                            }
                        )
                    }
                )
            }
        }
        
        when (uiState.preferencesSubTab) {
            PreferencesSubTab.PERSONALITY -> PersonalityTab(uiState, viewModel)
            PreferencesSubTab.CATEGORIES -> CategoriesTab(uiState, viewModel)
        }
    }
}

@Composable
fun PersonalityTab(
    uiState: com.triplink.mobile.ui.viewmodel.ProfileUiState,
    viewModel: ProfileViewModel
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Personality Assessment",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = { viewModel.resetPersonalityAxis() }) {
                    Text("Reset")
                }
            }
        }
        
        items(uiState.personalityAxis.toList()) { (axis, value) ->
            PersonalitySlider(
                axis = axis,
                value = value,
                onValueChange = { viewModel.updatePersonalityAxis(axis, it) }
            )
        }
    }
}

@Composable
fun PersonalitySlider(
    axis: String,
    value: Int,
    onValueChange: (Int) -> Unit
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
                Text(
                    text = axis.replace(Regex("([A-Z])"), " $1").trimStart().capitalize(),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "$value%",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            Slider(
                value = value.toFloat(),
                onValueChange = { onValueChange(it.toInt()) },
                valueRange = 0f..100f,
                modifier = Modifier.fillMaxWidth()
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Low",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                Text(
                    text = "High",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
        }
    }
}

@Composable
fun CategoriesTab(
    uiState: com.triplink.mobile.ui.viewmodel.ProfileUiState,
    viewModel: ProfileViewModel
) {
    val categories = listOf(
        "Accommodation" to listOf("hotels", "hostels", "apartments", "resorts"),
        "Activities" to listOf("adventure", "culture", "nature", "nightlife"),
        "Food" to listOf("local", "fineDining", "streetFood", "vegetarian"),
        "Transportation" to listOf("flights", "trains", "buses", "cars")
    )
    
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        items(categories) { (title, items) ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    items.forEach { item ->
                        val value = uiState.preferenceCategories[item] ?: 50
                        PreferenceSlider(
                            category = item,
                            value = value,
                            onValueChange = { viewModel.updatePreferenceCategory(item, it) }
                        )
                    }
                }
            }
        }
        
        item {
            TextButton(
                onClick = { viewModel.resetPreferenceCategories() },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Reset All Categories")
            }
        }
    }
}

@Composable
fun PreferenceSlider(
    category: String,
    value: Int,
    onValueChange: (Int) -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = category.replace(Regex("([A-Z])"), " $1").trimStart().capitalize(),
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = "$value%",
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.Bold
            )
        }
        Slider(
            value = value.toFloat(),
            onValueChange = { onValueChange(it.toInt()) },
            valueRange = 0f..100f,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
fun WishlistTab(
    uiState: com.triplink.mobile.ui.viewmodel.ProfileUiState,
    viewModel: ProfileViewModel,
    navController: NavController
) {
    if (uiState.wishlist.isEmpty() && !uiState.wishlistLoading) {
        viewModel.loadWishlist()
    }
    
    if (uiState.wishlistLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    } else if (uiState.wishlist.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Favorite,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
                Text(
                    text = "No items in wishlist",
                    style = MaterialTheme.typography.titleLarge
                )
                Button(
                    onClick = { navController.navigate("destinations") }
                ) {
                    Text("Browse Destinations")
                }
            }
        }
    } else {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${uiState.wishlist.size} items",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = { viewModel.clearWishlist() }) {
                    Text("Clear All")
                }
            }
            
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(uiState.wishlist) { destination ->
                    WishlistItemCard(
                        destination = destination,
                        onRemove = { viewModel.removeFromWishlist(destination.id) },
                        onClick = { navController.navigate("destination/${destination.id}") }
                    )
                }
            }
        }
    }
}

@Composable
fun WishlistItemCard(
    destination: com.triplink.mobile.data.model.DestinationResponse,
    onRemove: () -> Unit,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Image placeholder
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Image,
                    contentDescription = null,
                    modifier = Modifier.size(40.dp)
                )
            }
            
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = destination.name ?: "Destination",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${destination.city ?: ""}, ${destination.country ?: ""}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                destination.priceMin?.let {
                    Text(
                        text = "$$it - $${destination.priceMax ?: it}",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
            
            IconButton(onClick = onRemove) {
                Icon(
                    imageVector = Icons.Default.Favorite,
                    contentDescription = "Remove",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
fun ReviewsTab(uiState: com.triplink.mobile.ui.viewmodel.ProfileUiState) {
    if (uiState.reviews.isEmpty() && !uiState.reviewsLoading) {
        // Reviews should be loaded when profile loads
    }
    
    if (uiState.reviewsLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    } else if (uiState.reviews.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
                Text(
                    text = "No reviews yet",
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
            items(uiState.reviews) { review ->
                ReviewCard(review)
            }
        }
    }
}

@Composable
fun ReviewCard(review: com.triplink.mobile.data.model.ReviewResponse) {
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
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    repeat(review.rating) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = Color(0xFFFFD700)
                        )
                    }
                }
                review.createdAt?.let {
                    Text(
                        text = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(
                            SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(it) ?: Date()
                        ),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
            }
            review.comment?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}

@Composable
fun ActivityTab(uiState: com.triplink.mobile.ui.viewmodel.ProfileUiState) {
    if (uiState.activityLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    } else if (uiState.activity == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.History,
                    contentDescription = null,
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
                Text(
                    text = "No activity data",
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
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    StatCard(
                        title = "Total Bookings",
                        value = uiState.activity.totalBookings.toString(),
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Total Reviews",
                        value = uiState.activity.totalReviews.toString(),
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Wishlist",
                        value = uiState.activity.totalWishlist.toString(),
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            if (uiState.activity.recentActivity.isNotEmpty()) {
                item {
                    Text(
                        text = "Recent Activity",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
                
                items(uiState.activity.recentActivity) { activity ->
                    ActivityItemCard(activity)
                }
            }
        }
    }
}

@Composable
fun ActivityItemCard(activity: com.triplink.mobile.data.model.ActivityItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.History,
                contentDescription = null,
                modifier = Modifier.size(24.dp)
            )
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = activity.action,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
                activity.description?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
            }
            Text(
                text = SimpleDateFormat("MMM dd", Locale.getDefault()).format(
                    SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(activity.createdAt) ?: Date()
                ),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
        }
    }
}

@Composable
fun SettingsTab(
    uiState: com.triplink.mobile.ui.viewmodel.ProfileUiState,
    viewModel: ProfileViewModel,
    navController: NavController
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Account Settings",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Update Profile",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    OutlinedTextField(
                        value = uiState.accountData.firstName,
                        onValueChange = { viewModel.updateAccountData(uiState.accountData.copy(firstName = it)) },
                        label = { Text("First Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    OutlinedTextField(
                        value = uiState.accountData.lastName,
                        onValueChange = { viewModel.updateAccountData(uiState.accountData.copy(lastName = it)) },
                        label = { Text("Last Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    OutlinedTextField(
                        value = uiState.accountData.phone,
                        onValueChange = { viewModel.updateAccountData(uiState.accountData.copy(phone = it)) },
                        label = { Text("Phone") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    Button(
                        onClick = { viewModel.saveAccountData() },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Save Changes")
                    }
                }
            }
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Change Password",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    OutlinedTextField(
                        value = uiState.passwordData.current,
                        onValueChange = { viewModel.updatePasswordData(uiState.passwordData.copy(current = it)) },
                        label = { Text("Current Password") },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = PasswordVisualTransformation()
                    )
                    
                    OutlinedTextField(
                        value = uiState.passwordData.next,
                        onValueChange = { viewModel.updatePasswordData(uiState.passwordData.copy(next = it)) },
                        label = { Text("New Password") },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = PasswordVisualTransformation()
                    )
                    
                    OutlinedTextField(
                        value = uiState.passwordData.confirm,
                        onValueChange = { viewModel.updatePasswordData(uiState.passwordData.copy(confirm = it)) },
                        label = { Text("Confirm Password") },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = PasswordVisualTransformation()
                    )
                    
                    uiState.passwordError?.let {
                        Text(
                            text = it,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                    
                    uiState.passwordSuccess?.let {
                        Text(
                            text = it,
                            color = Color(0xFF4CAF50),
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                    
                    Button(
                        onClick = { viewModel.changePassword() },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Change Password")
                    }
                }
            }
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Delete Account",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.error
                    )
                    
                    Text(
                        text = "Permanently delete your account and all associated data. This action cannot be undone.",
                        style = MaterialTheme.typography.bodySmall
                    )
                    
                    if (uiState.showDeleteConfirm) {
                        OutlinedTextField(
                            value = uiState.deletePassword,
                            onValueChange = { viewModel.setDeletePassword(it) },
                            label = { Text("Enter Password to Confirm") },
                            modifier = Modifier.fillMaxWidth(),
                            visualTransformation = PasswordVisualTransformation()
                        )
                        
                        uiState.deleteError?.let {
                            Text(
                                text = it,
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = { viewModel.deleteAccount() },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.error
                                )
                            ) {
                                Text("Delete Account")
                            }
                            OutlinedButton(
                                onClick = { viewModel.setShowDeleteConfirm(false) },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Cancel")
                            }
                        }
                    } else {
                        Button(
                            onClick = { viewModel.setShowDeleteConfirm(true) },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error
                            )
                        ) {
                            Text("Delete Account")
                        }
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
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
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
fun ProfileInfoRow(
    label: String,
    value: String?
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )
        Text(
            text = value ?: "Not set",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold
        )
    }
}
