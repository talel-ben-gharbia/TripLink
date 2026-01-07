package com.triplink.mobile.ui.screens.destinations

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.components.DestinationCard
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.components.SearchBar
import com.triplink.mobile.ui.theme.BackgroundCream
import com.triplink.mobile.ui.viewmodel.DestinationsViewModel
import com.triplink.mobile.ui.viewmodel.ViewModelFactory
import com.triplink.mobile.ui.viewmodel.ViewMode

@Composable
fun DestinationsScreen(
    navController: NavController,
    viewModel: DestinationsViewModel = viewModel(
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
            // Navbar
            Navbar(
                navController = navController,
                user = null, // TODO: Get from auth state
                onOpenAuth = { showAuthModal = true },
                onLogout = {}
            )
            
            // Search and Filters Bar
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(16.dp)
            ) {
                // Search Bar
                SearchBar(
                    simple = true,
                    onSearch = { payload ->
                        viewModel.search(payload.destination)
                    },
                    destinationRepository = LocalAppContainer.current.destinationRepository
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Filter and View Toggle Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Filter button
                    FilterChip(
                        onClick = { viewModel.toggleFilters() },
                        label = { Text("Filters") },
                        selected = uiState.showFilters,
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.FilterList,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    )
                    
                    // View mode toggle
                    Row {
                        IconButton(
                            onClick = { viewModel.toggleViewMode() }
                        ) {
                            Icon(
                                imageVector = if (uiState.viewMode == ViewMode.GRID) Icons.Default.List else Icons.Default.GridView,
                                contentDescription = "Toggle view mode"
                            )
                        }
                    }
                }
                
                // Active filters
                if (uiState.selectedCountry != null || 
                    uiState.selectedCategory != null || 
                    uiState.selectedTags.isNotEmpty() ||
                    uiState.priceMin != null) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Active filters:",
                            style = MaterialTheme.typography.bodySmall
                        )
                        
                        uiState.selectedCountry?.let { country ->
                            AssistChip(
                                onClick = { viewModel.filterByCountry(null) },
                                label = { Text(country) },
                                trailingIcon = {
                                    Icon(Icons.Default.Close, null, modifier = Modifier.size(16.dp))
                                }
                            )
                        }
                        
                        uiState.selectedCategory?.let { category ->
                            AssistChip(
                                onClick = { viewModel.filterByCategory(null) },
                                label = { Text(category) },
                                trailingIcon = {
                                    Icon(Icons.Default.Close, null, modifier = Modifier.size(16.dp))
                                }
                            )
                        }
                        
                        AssistChip(
                            onClick = { viewModel.clearFilters() },
                            label = { Text("Clear all") }
                        )
                    }
                }
            }
            
            // Filters Panel
            if (uiState.showFilters) {
                FiltersPanel(
                    uiState = uiState,
                    onCountrySelected = { viewModel.filterByCountry(it) },
                    onCategorySelected = { viewModel.filterByCategory(it) },
                    onTagToggled = { viewModel.toggleTag(it) },
                    onPriceRangeChanged = { min, max -> viewModel.setPriceRange(min, max) },
                    onSortChanged = { viewModel.setSortBy(it) },
                    modifier = Modifier.weight(1f)
                )
            }
            
            // Destinations List/Grid
            if (uiState.isLoading && uiState.destinations.isEmpty()) {
                LoadingSpinner()
            } else if (uiState.filteredDestinations.isEmpty()) {
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
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                        Text(
                            text = "No destinations found",
                            style = MaterialTheme.typography.titleLarge
                        )
                        Text(
                            text = "Try adjusting your filters",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )
                        Button(onClick = { viewModel.clearFilters() }) {
                            Text("Clear Filters")
                        }
                    }
                }
            } else {
                if (uiState.viewMode == ViewMode.GRID) {
                    LazyVerticalGrid(
                        columns = GridCells.Adaptive(minSize = 300.dp),
                        modifier = Modifier
                            .fillMaxSize()
                            .weight(1f),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(uiState.filteredDestinations) { destination ->
                            DestinationCard(
                                destination = destination,
                                onClick = {
                                    navController.navigate("destinations/${destination.id}")
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .weight(1f),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(uiState.filteredDestinations) { destination ->
                            DestinationCard(
                                destination = destination,
                                onClick = {
                                    navController.navigate("destinations/${destination.id}")
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FiltersPanel(
    uiState: com.triplink.mobile.ui.viewmodel.DestinationsUiState,
    onCountrySelected: (String?) -> Unit,
    onCategorySelected: (String?) -> Unit,
    onTagToggled: (String) -> Unit,
    onPriceRangeChanged: (Double?, Double?) -> Unit,
    onSortChanged: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 4.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Filters",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            
            // Sort
            Column {
                Text(
                    text = "Sort by",
                    style = MaterialTheme.typography.titleSmall
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(
                        "popularity:desc" to "Popularity",
                        "price:asc" to "Price: Low to High",
                        "price:desc" to "Price: High to Low",
                        "rating:desc" to "Highest Rated"
                    ).forEach { (value, label) ->
                        FilterChip(
                            onClick = { onSortChanged(value) },
                            label = { Text(label) },
                            selected = uiState.sortBy == value,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
            
            Divider()
            
            // Country Filter
            if (uiState.availableCountries.isNotEmpty()) {
                Column {
                    Text(
                        text = "Country",
                        style = MaterialTheme.typography.titleSmall
                    )
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.availableCountries) { country ->
                            FilterChip(
                                onClick = {
                                    onCountrySelected(
                                        if (uiState.selectedCountry == country) null else country
                                    )
                                },
                                label = { Text(country) },
                                selected = uiState.selectedCountry == country
                            )
                        }
                    }
                }
            }
            
            // Category Filter
            if (uiState.availableCategories.isNotEmpty()) {
                Column {
                    Text(
                        text = "Category",
                        style = MaterialTheme.typography.titleSmall
                    )
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.availableCategories) { category ->
                            FilterChip(
                                onClick = {
                                    onCategorySelected(
                                        if (uiState.selectedCategory == category) null else category
                                    )
                                },
                                label = { Text(category) },
                                selected = uiState.selectedCategory == category
                            )
                        }
                    }
                }
            }
            
            // Tags Filter
            if (uiState.availableTags.isNotEmpty()) {
                Column {
                    Text(
                        text = "Tags",
                        style = MaterialTheme.typography.titleSmall
                    )
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.availableTags) { tag ->
                            FilterChip(
                                onClick = { onTagToggled(tag) },
                                label = { Text(tag) },
                                selected = uiState.selectedTags.contains(tag)
                            )
                        }
                    }
                }
            }
            
            // Price Range
            Column {
                Text(
                    text = "Price Range",
                    style = MaterialTheme.typography.titleSmall
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = uiState.priceMin?.toString() ?: "",
                        onValueChange = {
                            val min = it.toDoubleOrNull()
                            onPriceRangeChanged(min, uiState.priceMax)
                        },
                        label = { Text("Min") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = uiState.priceMax?.toString() ?: "",
                        onValueChange = {
                            val max = it.toDoubleOrNull()
                            onPriceRangeChanged(uiState.priceMin, max)
                        },
                        label = { Text("Max") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }
            }
        }
    }
}

