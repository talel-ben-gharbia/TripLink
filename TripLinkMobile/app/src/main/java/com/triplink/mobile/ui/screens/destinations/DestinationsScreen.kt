package com.triplink.mobile.ui.screens.destinations

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
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
    initialSearchQuery: String = "",
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
    
    // Load data when screen is displayed
    LaunchedEffect(Unit) {
        if (initialSearchQuery.isNotEmpty()) {
            viewModel.search(initialSearchQuery)
        } else {
            viewModel.refresh()
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
                
                // Active filters - Wrap properly on small screens
                if (uiState.selectedCountry != null || 
                    uiState.selectedCategory != null || 
                    uiState.selectedTags.isNotEmpty() ||
                    uiState.priceMin != null ||
                    uiState.priceMax != null) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Active filters:",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )
                        
                        // Wrap chips properly
                        FlowRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
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
                            
                            uiState.selectedTags.forEach { tag ->
                                AssistChip(
                                    onClick = { viewModel.toggleTag(tag) },
                                    label = { Text(tag) },
                                    trailingIcon = {
                                        Icon(Icons.Default.Close, null, modifier = Modifier.size(16.dp))
                                    }
                                )
                            }
                            
                            if (uiState.priceMin != null || uiState.priceMax != null) {
                                val priceMin = uiState.priceMin
                                val priceMax = uiState.priceMax
                                val priceText = when {
                                    priceMin != null && priceMax != null -> 
                                        "$${priceMin.toInt()} - $${priceMax.toInt()}"
                                    priceMin != null -> "From $${priceMin.toInt()}"
                                    priceMax != null -> "Up to $${priceMax.toInt()}"
                                    else -> "Price"
                                }
                                AssistChip(
                                    onClick = { 
                                        viewModel.setPriceRange(null, null)
                                    },
                                    label = { Text(priceText) },
                                    trailingIcon = {
                                        Icon(Icons.Default.Close, null, modifier = Modifier.size(16.dp))
                                    }
                                )
                            }
                            
                            AssistChip(
                                onClick = { viewModel.clearFilters() },
                                label = { Text("Clear all") },
                                colors = AssistChipDefaults.assistChipColors(
                                    containerColor = MaterialTheme.colorScheme.errorContainer,
                                    labelColor = MaterialTheme.colorScheme.onErrorContainer
                                )
                            )
                        }
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
                    onClearFilters = { viewModel.clearFilters() },
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
    onClearFilters: () -> Unit = {},
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
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Header with clear button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Filters",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = onClearFilters) {
                    Text("Reset All")
                }
            }
            
            // Sort - Improved responsive layout
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Sort by",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    // Wrap sort options for better responsiveness
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            "popularity:desc" to "Popularity",
                            "price:asc" to "Price: Low to High",
                            "price:desc" to "Price: High to Low",
                            "rating:desc" to "Highest Rated"
                        ).forEach { (value, label) ->
                            FilterChip(
                                onClick = { onSortChanged(value) },
                                label = { 
                                    Text(
                                        text = label,
                                        style = MaterialTheme.typography.bodySmall
                                    ) 
                                },
                                selected = uiState.sortBy == value,
                                modifier = Modifier.padding(0.dp)
                            )
                        }
                    }
                }
            }
            
            // Country Filter
            if (uiState.availableCountries.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Country",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp)
                        ) {
                            items(uiState.availableCountries) { country ->
                                FilterChip(
                                    onClick = {
                                        onCountrySelected(
                                            if (uiState.selectedCountry == country) null else country
                                        )
                                    },
                                    label = { Text(country ?: "Unknown") },
                                    selected = uiState.selectedCountry == country
                                )
                            }
                        }
                    }
                }
            }
            
            // Category Filter
            if (uiState.availableCategories.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Category",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp)
                        ) {
                            items(uiState.availableCategories) { category ->
                                FilterChip(
                                    onClick = {
                                        onCategorySelected(
                                            if (uiState.selectedCategory == category) null else category
                                        )
                                    },
                                    label = { Text(category ?: "Unknown") },
                                    selected = uiState.selectedCategory == category
                                )
                            }
                        }
                    }
                }
            }
            
            // Tags Filter
            if (uiState.availableTags.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Tags",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp)
                        ) {
                            items(uiState.availableTags) { tag ->
                                FilterChip(
                                    onClick = { onTagToggled(tag) },
                                    label = { Text(tag ?: "Unknown") },
                                    selected = uiState.selectedTags.contains(tag)
                                )
                            }
                        }
                    }
                }
            }
            
            // Price Range - Improved design
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Price Range",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = uiState.priceMin?.toString() ?: "",
                            onValueChange = {
                                val min = it.toDoubleOrNull()
                                onPriceRangeChanged(min, uiState.priceMax)
                            },
                            label = { Text("Min Price") },
                            placeholder = { Text("0") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            leadingIcon = {
                                Text(
                                    text = "$",
                                    style = MaterialTheme.typography.bodyLarge,
                                    modifier = Modifier.padding(start = 12.dp)
                                )
                            }
                        )
                        Text(
                            text = "—",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                        OutlinedTextField(
                            value = uiState.priceMax?.toString() ?: "",
                            onValueChange = {
                                val max = it.toDoubleOrNull()
                                onPriceRangeChanged(uiState.priceMin, max)
                            },
                            label = { Text("Max Price") },
                            placeholder = { Text("1000") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            leadingIcon = {
                                Text(
                                    text = "$",
                                    style = MaterialTheme.typography.bodyLarge,
                                    modifier = Modifier.padding(start = 12.dp)
                                )
                            }
                        )
                    }
                }
            }
        }
    }
}

