package com.triplink.mobile.ui.screens.destinationdetails

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.components.BookingModal
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.components.ReviewSection
import com.triplink.mobile.ui.components.TravelInfo
import com.triplink.mobile.ui.components.SocialShare
import com.triplink.mobile.ui.theme.BackgroundCream
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import com.triplink.mobile.ui.utils.LocalWindowSize
import com.triplink.mobile.ui.utils.heroHeight
import com.triplink.mobile.ui.utils.horizontalPadding
import com.triplink.mobile.ui.viewmodel.DestinationDetailsViewModel

// Helper composable for info cards
@Composable
fun InfoCard(
    label: String,
    value: String,
    isRating: Boolean = false,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(4.dp))
            if (isRating && value != "No ratings yet") {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = null,
                        tint = Color(0xFFFFB300),
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = value,
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            } else {
                Text(
                    text = value,
                    style = if (value == "No ratings yet") {
                        MaterialTheme.typography.bodySmall
                    } else {
                        MaterialTheme.typography.bodyLarge
                    },
                    fontWeight = if (value == "No ratings yet") FontWeight.Normal else FontWeight.SemiBold,
                    color = if (value == "No ratings yet") {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    } else {
                        MaterialTheme.colorScheme.onSurface
                    }
                )
            }
        }
    }
}

@Composable
fun DestinationDetailsScreen(
    navController: NavController,
    destinationId: Int
) {
    val appContainer = LocalAppContainer.current
    val destinationRepository = appContainer.destinationRepository
    val authRepository = appContainer.authRepository
    val wishlistRepository = appContainer.wishlistRepository
    
    var currentUser by remember { mutableStateOf<com.triplink.mobile.data.model.UserData?>(null) }
    
    LaunchedEffect(Unit) {
        currentUser = authRepository.getStoredUser()
        // Also try to get fresh user data
        authRepository.getCurrentUser().onSuccess { response ->
            currentUser = response.user
        }
    }
    
    val viewModel: DestinationDetailsViewModel = remember(destinationId) {
        DestinationDetailsViewModel(
            destinationRepository = destinationRepository,
            authRepository = authRepository,
            wishlistRepository = wishlistRepository,
            destinationId = destinationId
        )
    }
    
    val uiState by viewModel.uiState.collectAsState()
    
    when {
        uiState.isLoading -> {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                LoadingSpinner()
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Loading destination details...",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
        }
        uiState.destination == null -> {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Destination Not Found",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "The destination you're looking for doesn't exist or has been removed.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = { navController.navigate("destinations") }
                ) {
                    Text("Browse All Destinations")
                }
            }
        }
        else -> {
            DestinationDetailsContent(
                navController = navController,
                viewModel = viewModel,
                uiState = uiState,
                currentUser = currentUser
            )
        }
    }
}

@Composable
fun DestinationDetailsContent(
    navController: NavController,
    viewModel: DestinationDetailsViewModel,
    uiState: com.triplink.mobile.ui.viewmodel.DestinationDetailsUiState,
    currentUser: com.triplink.mobile.data.model.UserData?
) {
    val destination = uiState.destination!!
    val images = destination.images?.ifEmpty { 
        listOf("https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200") 
    } ?: listOf("https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200")
    
    var currentImageIndex by remember { mutableIntStateOf(0) }
    var showImageModal by remember { mutableStateOf(false) }
    var modalImageIndex by remember { mutableIntStateOf(0) }
    
    val windowSize = LocalWindowSize.current
    val padding = horizontalPadding(windowSize)
    
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Navbar
        Navbar(
            navController = navController,
            user = null, // TODO: Get from auth state
            onOpenAuth = {},
            onLogout = {}
        )
        
        // Content with scroll
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(padding),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Back button
            TextButton(
                onClick = { navController.popBackStack() },
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Back to Destinations")
            }
            
            // Main Card Container (matching frontend white card)
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column {
                    // Image Section (h-80 md:h-96 equivalent - responsive)
                    val imageHeight = when (windowSize.width) {
                        com.triplink.mobile.ui.utils.WindowType.Compact -> 320.dp // h-80
                        com.triplink.mobile.ui.utils.WindowType.Medium -> 360.dp // md
                        com.triplink.mobile.ui.utils.WindowType.Expanded -> 384.dp // h-96
                    }
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(imageHeight)
                            .clickable { 
                                showImageModal = true
                                modalImageIndex = currentImageIndex
                            }
                    ) {
                        AsyncImage(
                            model = images[currentImageIndex],
                            contentDescription = destination.name,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                        
                        // Navigation buttons (shown on hover equivalent - always visible on mobile)
                        if (images.size > 1) {
                            IconButton(
                                onClick = {
                                    currentImageIndex = (currentImageIndex - 1 + images.size) % images.size
                                },
                                modifier = Modifier
                                    .align(Alignment.CenterStart)
                                    .padding(16.dp)
                                    .background(
                                        color = Color.White.copy(alpha = 0.9f),
                                        shape = CircleShape
                                    )
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ArrowBack,
                                    contentDescription = "Previous",
                                    tint = MaterialTheme.colorScheme.onSurface
                                )
                            }
                            
                            IconButton(
                                onClick = {
                                    currentImageIndex = (currentImageIndex + 1) % images.size
                                },
                                modifier = Modifier
                                    .align(Alignment.CenterEnd)
                                    .padding(16.dp)
                                    .background(
                                        color = Color.White.copy(alpha = 0.9f),
                                        shape = CircleShape
                                    )
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ArrowForward,
                                    contentDescription = "Next",
                                    tint = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                    
                    // Thumbnail strip (if multiple images) - responsive padding
                    if (images.size > 1) {
                        val thumbnailPadding = when (windowSize.width) {
                            com.triplink.mobile.ui.utils.WindowType.Compact -> 16.dp
                            com.triplink.mobile.ui.utils.WindowType.Medium -> 20.dp
                            com.triplink.mobile.ui.utils.WindowType.Expanded -> 24.dp
                        }
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = thumbnailPadding, vertical = 16.dp)
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            images.forEachIndexed { index, imageUrl ->
                                Box(
                                    modifier = Modifier
                                        .size(width = 80.dp, height = 56.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .clickable { currentImageIndex = index }
                                        .then(
                                            if (currentImageIndex == index) {
                                                Modifier.border(
                                                    width = 2.dp,
                                                    color = Purple600,
                                                    shape = RoundedCornerShape(8.dp)
                                                )
                                            } else {
                                                Modifier.border(
                                                    width = 2.dp,
                                                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                                                    shape = RoundedCornerShape(8.dp)
                                                )
                                            }
                                        )
                                ) {
                                    AsyncImage(
                                        model = imageUrl,
                                        contentDescription = "Thumbnail ${index + 1}",
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )
                                }
                            }
                        }
                    }
                    
                    // Content Section (responsive padding)
                    val contentPadding = when (windowSize.width) {
                        com.triplink.mobile.ui.utils.WindowType.Compact -> 16.dp
                        com.triplink.mobile.ui.utils.WindowType.Medium -> 20.dp
                        com.triplink.mobile.ui.utils.WindowType.Expanded -> 24.dp
                    }
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(contentPadding),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Title and Wishlist Button Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                // Title with badges (responsive text size)
                                val titleStyle = when (windowSize.width) {
                                    com.triplink.mobile.ui.utils.WindowType.Compact -> MaterialTheme.typography.headlineMedium
                                    com.triplink.mobile.ui.utils.WindowType.Medium -> MaterialTheme.typography.headlineLarge
                                    com.triplink.mobile.ui.utils.WindowType.Expanded -> MaterialTheme.typography.displaySmall
                                }
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    modifier = Modifier.padding(bottom = 8.dp)
                                ) {
                                    Text(
                                        text = destination.name,
                                        style = titleStyle,
                                        fontWeight = FontWeight.Bold
                                    )
                                    
                                    if (destination.isFeatured) {
                                        Surface(
                                            shape = RoundedCornerShape(20.dp),
                                            color = Color.Transparent
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .background(
                                                        brush = Brush.horizontalGradient(
                                                            colors = listOf(Purple600, Blue500)
                                                        ),
                                                        shape = RoundedCornerShape(20.dp)
                                                    )
                                                    .padding(horizontal = 12.dp, vertical = 4.dp)
                                            ) {
                                                Row(
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                                ) {
                                                    Icon(
                                                        imageVector = Icons.Default.AutoAwesome,
                                                        contentDescription = null,
                                                        tint = Color.White,
                                                        modifier = Modifier.size(14.dp)
                                                    )
                                                    Text(
                                                        text = "Featured",
                                                        style = MaterialTheme.typography.labelSmall,
                                                        color = Color.White,
                                                        fontWeight = FontWeight.Bold
                                                    )
                                                }
                                            }
                                        }
                                    }
                                    
                                    if (destination.isPinned) {
                                        Surface(
                                            shape = RoundedCornerShape(20.dp),
                                            color = Color(0xFFFFEB3B).copy(alpha = 0.9f)
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Bookmark,
                                                    contentDescription = null,
                                                    tint = Color(0xFFF57F17),
                                                    modifier = Modifier.size(14.dp)
                                                )
                                                Text(
                                                    text = "Pinned",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = Color(0xFFF57F17),
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                        }
                                    }
                                }
                                
                                // Location
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.LocationOn,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = destination.city?.let { "$it, ${destination.country}" } ?: destination.country,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                    )
                                }
                            }
                            
                            // Wishlist button (matching frontend style)
                            Button(
                                onClick = { viewModel.toggleWishlist() },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (uiState.wishlisted) {
                                        Color(0xFFFEE2E2)
                                    } else {
                                        MaterialTheme.colorScheme.surface
                                    }
                                ),
                                border = androidx.compose.foundation.BorderStroke(
                                    width = 1.dp,
                                    color = if (uiState.wishlisted) {
                                        Color(0xFFFCA5A5)
                                    } else {
                                        MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                                    }
                                )
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        imageVector = if (uiState.wishlisted) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                        contentDescription = null,
                                        tint = if (uiState.wishlisted) Color(0xFFDC2626) else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Text(
                                        text = if (uiState.wishlisted) "Saved" else "Save",
                                        color = if (uiState.wishlisted) Color(0xFFDC2626) else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                    )
                                }
                            }
                        }
                        
                        // Description
                        if (destination.description.isNotEmpty()) {
                            Text(
                                text = destination.description,
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                                lineHeight = androidx.compose.ui.unit.TextUnit(24f, androidx.compose.ui.unit.TextUnitType.Sp)
                            )
                        }
                        
                        // Social Share
                        SocialShare(
                            url = "https://triplink.com/destinations/${destination.id}",
                            title = destination.name,
                            description = destination.description,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                        
                        // Info Cards Grid (responsive: 1 column mobile, 3 columns tablet/desktop)
                        val infoCardColumns = when (windowSize.width) {
                            com.triplink.mobile.ui.utils.WindowType.Compact -> 1
                            else -> 3
                        }
                        if (infoCardColumns == 1) {
                            // Single column on mobile
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // Category Card
                                InfoCard(
                                    label = "Category",
                                    value = destination.category?.replaceFirstChar { 
                                        if (it.isLowerCase()) it.titlecase() else it.toString() 
                                    } ?: "—"
                                )
                                
                                // Price Range Card
                                InfoCard(
                                    label = "Price Range",
                                    value = when {
                                        destination.priceMin != null && destination.priceMax != null -> 
                                            "$${destination.priceMin} - $${destination.priceMax}"
                                        destination.priceMin != null -> 
                                            "$${destination.priceMin}"
                                        destination.price != null -> 
                                            "$${String.format("%.0f", destination.price)}"
                                        else -> ""
                                    }
                                )
                                
                                // Average Rating Card
                                InfoCard(
                                    label = "Average Rating",
                                    value = if (destination.rating != null) {
                                        String.format("%.1f", destination.rating)
                                    } else {
                                        "No ratings yet"
                                    },
                                    isRating = destination.rating != null
                                )
                            }
                        } else {
                            // Three columns on tablet/desktop
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                // Category Card
                                InfoCard(
                                    label = "Category",
                                    value = destination.category?.replaceFirstChar { 
                                        if (it.isLowerCase()) it.titlecase() else it.toString() 
                                    } ?: "—",
                                    modifier = Modifier.weight(1f)
                                )
                                
                                // Price Range Card
                                InfoCard(
                                    label = "Price Range",
                                    value = when {
                                        destination.priceMin != null && destination.priceMax != null -> 
                                            "$${destination.priceMin} - $${destination.priceMax}"
                                        destination.priceMin != null -> 
                                            "$${destination.priceMin}"
                                        destination.price != null -> 
                                            "$${String.format("%.0f", destination.price)}"
                                        else -> ""
                                    },
                                    modifier = Modifier.weight(1f)
                                )
                                
                                // Average Rating Card
                                InfoCard(
                                    label = "Average Rating",
                                    value = if (destination.rating != null) {
                                        String.format("%.1f", destination.rating)
                                    } else {
                                        "No ratings yet"
                                    },
                                    isRating = destination.rating != null,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                        
                        // Action Buttons Row (responsive - wraps on mobile)
                        if (windowSize.width == com.triplink.mobile.ui.utils.WindowType.Compact) {
                            // Mobile: Stack vertically
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // Book Now Button (full width on mobile)
                                Button(
                                    onClick = { viewModel.showBookingModal(true) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color.Transparent
                                    )
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .background(
                                                brush = Brush.horizontalGradient(
                                                    colors = listOf(Purple600, Blue500)
                                                ),
                                                shape = RoundedCornerShape(8.dp)
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.CalendarToday,
                                                contentDescription = null,
                                                tint = Color.White,
                                                modifier = Modifier.size(20.dp)
                                            )
                                            Text(
                                                text = "Book Now",
                                                style = MaterialTheme.typography.titleMedium,
                                                color = Color.White,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                        }
                                    }
                                }
                                
                                // Browse More Button (full width on mobile)
                                OutlinedButton(
                                    onClick = { navController.navigate("destinations") },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp)
                                ) {
                                    Text("Browse More")
                                }
                                
                                // Tags (wrap on mobile)
                                if (!destination.tags.isNullOrEmpty()) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        destination.tags!!.take(3).forEach { tag ->
                                            Surface(
                                                shape = RoundedCornerShape(20.dp),
                                                color = Color(0xFFF3E8FF)
                                            ) {
                                                Text(
                                                    text = tag,
                                                    style = MaterialTheme.typography.labelMedium,
                                                    color = Purple600,
                                                    fontWeight = FontWeight.Medium,
                                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            // Tablet/Desktop: Horizontal layout
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Book Now Button (flex-1)
                                Button(
                                    onClick = { viewModel.showBookingModal(true) },
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(48.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color.Transparent
                                    )
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .background(
                                                brush = Brush.horizontalGradient(
                                                    colors = listOf(Purple600, Blue500)
                                                ),
                                                shape = RoundedCornerShape(8.dp)
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.CalendarToday,
                                                contentDescription = null,
                                                tint = Color.White,
                                                modifier = Modifier.size(20.dp)
                                            )
                                            Text(
                                                text = "Book Now",
                                                style = MaterialTheme.typography.titleMedium,
                                                color = Color.White,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                        }
                                    }
                                }
                                
                                // Browse More Button
                                OutlinedButton(
                                    onClick = { navController.navigate("destinations") },
                                    modifier = Modifier.height(48.dp)
                                ) {
                                    Text("Browse More")
                                }
                                
                                // Tags (first 3, matching frontend)
                                if (!destination.tags.isNullOrEmpty()) {
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        modifier = Modifier.weight(1f, fill = false)
                                    ) {
                                        destination.tags!!.take(3).forEach { tag ->
                                            Surface(
                                                shape = RoundedCornerShape(20.dp),
                                                color = Color(0xFFF3E8FF)
                                            ) {
                                                Text(
                                                    text = tag,
                                                    style = MaterialTheme.typography.labelMedium,
                                                    color = Purple600,
                                                    fontWeight = FontWeight.Medium,
                                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Travel Info Section (before Reviews, matching frontend)
            if (destination.country.isNotEmpty()) {
                TravelInfo(
                    destination = destination,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            
            // Reviews Section
            ReviewSection(
                destinationId = destination.id,
                currentUser = currentUser,
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        // Image Modal (matching frontend)
        if (showImageModal && images.isNotEmpty()) {
            ImageModal(
                images = images,
                currentIndex = modalImageIndex,
                onDismiss = { showImageModal = false },
                onPrevious = {
                    modalImageIndex = (modalImageIndex - 1 + images.size) % images.size
                },
                onNext = {
                    modalImageIndex = (modalImageIndex + 1) % images.size
                },
                destinationName = destination.name
            )
        }
        
        // Booking Modal
        if (uiState.showBookingModal) {
            BookingModal(
                isOpen = uiState.showBookingModal,
                onClose = { viewModel.showBookingModal(false) },
                destination = destination,
                onBookingComplete = { booking ->
                    viewModel.showBookingModal(false)
                    // TODO: Navigate to booking success or bookings list
                }
            )
        }
    }
}

@Composable
fun ImageModal(
    images: List<String>,
    currentIndex: Int,
    onDismiss: () -> Unit,
    onPrevious: () -> Unit,
    onNext: () -> Unit,
    destinationName: String
) {
    androidx.compose.ui.window.Dialog(
        onDismissRequest = onDismiss,
        properties = androidx.compose.ui.window.DialogProperties(
            usePlatformDefaultWidth = false,
            decorFitsSystemWindows = false
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.9f))
                .clickable(onClick = onDismiss)
        ) {
            // Close button
            IconButton(
                onClick = onDismiss,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp)
                    .background(
                        color = Color.White.copy(alpha = 0.2f),
                        shape = CircleShape
                    )
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = Color.White
                )
            }
            
            // Previous button
            if (images.size > 1) {
                IconButton(
                    onClick = { onPrevious() },
                    modifier = Modifier
                        .align(Alignment.CenterStart)
                        .padding(16.dp)
                        .background(
                            color = Color.White.copy(alpha = 0.2f),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Previous",
                        tint = Color.White
                    )
                }
                
                // Next button
                IconButton(
                    onClick = { onNext() },
                    modifier = Modifier
                        .align(Alignment.CenterEnd)
                        .padding(16.dp)
                        .background(
                            color = Color.White.copy(alpha = 0.2f),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = "Next",
                        tint = Color.White
                    )
                }
            }
            
            // Image
            AsyncImage(
                model = images[currentIndex],
                contentDescription = destinationName,
                modifier = Modifier
                    .fillMaxSize()
                    .clickable(enabled = false) {},
                contentScale = ContentScale.Fit
            )
            
            // Image counter
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color.Black.copy(alpha = 0.6f),
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 16.dp)
            ) {
                Text(
                    text = "${currentIndex + 1} / ${images.size}",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        }
    }
}
