package com.triplink.mobile.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.components.*
import com.triplink.mobile.ui.components.DestinationCard
import com.triplink.mobile.ui.theme.BackgroundCream
import com.triplink.mobile.ui.utils.LocalWindowSize
import com.triplink.mobile.ui.utils.horizontalPadding
import com.triplink.mobile.ui.utils.cardWidth
import com.triplink.mobile.ui.viewmodel.AuthViewModel
import com.triplink.mobile.ui.viewmodel.HomeViewModel
import com.triplink.mobile.ui.viewmodel.ViewModelFactory

@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = viewModel(
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
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Navbar
            Navbar(
                navController = navController,
                user = uiState.user,
                onOpenAuth = { showAuthModal = true },
                onLogout = {
                    viewModel.logout()
                }
            )
            
            // Hero section
            Hero(
                showCTA = uiState.user == null,
                onStart = { showAuthModal = true }
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // SearchBar
            val appContainer = LocalAppContainer.current
            SearchBar(
                simple = true,
                onSearch = { payload ->
                    // Navigate to destinations with search query
                    navController.navigate("destinations")
                },
                destinationRepository = appContainer.destinationRepository
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Featured Destinations section
            FeaturedDestinationsSection(
                destinations = uiState.featuredDestinations,
                isLoading = uiState.isLoading,
                onDestinationClick = { id ->
                    navController.navigate("destinations/$id")
                }
            )
            
            // Recommendations section (if user is logged in)
            if (uiState.user != null && uiState.recommendations.isNotEmpty()) {
                Spacer(modifier = Modifier.height(24.dp))
                RecommendationsSection(
                    destinations = uiState.recommendations,
                    onDestinationClick = { id ->
                        navController.navigate("destinations/$id")
                    }
                )
            }
            
            // Collections Section
            Spacer(modifier = Modifier.height(24.dp))
            CollectionsSection(
                limit = 3,
                navController = navController,
                collectionRepository = LocalAppContainer.current.collectionRepository
            )
            
            // Public Reviews Section
            Spacer(modifier = Modifier.height(24.dp))
            PublicReviewsSection(
                limit = 100,
                navController = navController,
                reviewRepository = LocalAppContainer.current.reviewRepository
            )
            
            // Trust Indicators Section
            Spacer(modifier = Modifier.height(24.dp))
            TrustIndicators()
            
            // FAQ Section
            Spacer(modifier = Modifier.height(24.dp))
            FAQ()
            
            // Footer
            Spacer(modifier = Modifier.height(24.dp))
            Footer(navController = navController)
        }
        
        if (uiState.isLoading && uiState.featuredDestinations.isEmpty()) {
            LoadingSpinner()
        }
        
        uiState.error?.let { error ->
            ErrorMessage(message = error)
        }
        
        // AuthModal
        if (showAuthModal) {
            val authViewModel = viewModel<AuthViewModel>(
                factory = ViewModelFactory(
                    authRepository = LocalAppContainer.current.authRepository,
                    destinationRepository = LocalAppContainer.current.destinationRepository,
                    apiService = LocalAppContainer.current.apiService
                )
            )
            
            AuthModal(
                isOpen = showAuthModal,
                onClose = { showAuthModal = false },
                viewModel = authViewModel,
                onLoginSuccess = {
                    viewModel.refresh()
                },
                onRegisterSuccess = {
                    viewModel.refresh()
                }
            )
        }
        
        // OnboardingModal
        if (uiState.showOnboarding) {
            OnboardingModal(
                isOpen = uiState.showOnboarding,
                onClose = {
                    viewModel.dismissOnboarding()
                },
                authRepository = LocalAppContainer.current.authRepository,
                destinationRepository = LocalAppContainer.current.destinationRepository,
                onComplete = {
                    viewModel.onboardingCompleted()
                }
            )
        }
    }
}

@Composable
fun FeaturedDestinationsSection(
    destinations: List<com.triplink.mobile.data.model.DestinationResponse>,
    isLoading: Boolean,
    onDestinationClick: (Int) -> Unit
) {
    val windowSize = LocalWindowSize.current
    val padding = horizontalPadding(windowSize)
    val cardWidthValue = cardWidth(windowSize)
    val isCompact = windowSize.width == com.triplink.mobile.ui.utils.WindowType.Compact
    
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(padding)
    ) {
        Text(
            text = "Featured Destinations",
            style = MaterialTheme.typography.headlineLarge
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        if (isLoading) {
            LoadingSpinner()
        } else if (destinations.isEmpty()) {
            Text("No featured destinations available")
        } else {
            if (isCompact) {
                // Vertical list for compact screens
                Column(
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    destinations.forEach { destination ->
                        DestinationCard(
                            destination = destination,
                            onClick = { onDestinationClick(destination.id) },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            } else {
                // Horizontal scroll for larger screens
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(destinations.size) { index ->
                        val destination = destinations[index]
                        DestinationCard(
                            destination = destination,
                            onClick = { onDestinationClick(destination.id) },
                            modifier = Modifier.width(cardWidthValue)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun RecommendationsSection(
    destinations: List<com.triplink.mobile.data.model.DestinationResponse>,
    onDestinationClick: (Int) -> Unit
) {
    val windowSize = LocalWindowSize.current
    val padding = horizontalPadding(windowSize)
    val cardWidthValue = cardWidth(windowSize)
    val isCompact = windowSize.width == com.triplink.mobile.ui.utils.WindowType.Compact
    
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(padding)
    ) {
        Text(
            text = "Recommended For You",
            style = MaterialTheme.typography.headlineLarge
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        if (isCompact) {
            // Vertical list for compact screens
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                destinations.forEach { destination ->
                    DestinationCard(
                        destination = destination,
                        onClick = { onDestinationClick(destination.id) },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        } else {
            // Horizontal scroll for larger screens
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(destinations.size) { index ->
                    val destination = destinations[index]
                    DestinationCard(
                        destination = destination,
                        onClick = { onDestinationClick(destination.id) },
                        modifier = Modifier.width(cardWidthValue)
                    )
                }
            }
        }
    }
}

// DestinationCard is now in ui.components package

