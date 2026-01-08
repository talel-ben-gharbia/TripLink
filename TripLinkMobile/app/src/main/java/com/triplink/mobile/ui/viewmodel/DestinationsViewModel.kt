package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.DestinationResponse
import com.triplink.mobile.data.repository.DestinationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DestinationsUiState(
    val isLoading: Boolean = false,
    val destinations: List<DestinationResponse> = emptyList(),
    val filteredDestinations: List<DestinationResponse> = emptyList(),
    val error: String? = null,
    val searchQuery: String = "",
    val selectedCountry: String? = null,
    val selectedCategory: String? = null,
    val selectedTags: List<String> = emptyList(),
    val priceMin: Double? = null,
    val priceMax: Double? = null,
    val sortBy: String = "popularity:desc",
    val availableCountries: List<String> = emptyList(),
    val availableCategories: List<String> = emptyList(),
    val availableTags: List<String> = emptyList(),
    val showFilters: Boolean = false,
    val viewMode: ViewMode = ViewMode.GRID
)

enum class ViewMode {
    GRID, LIST
}

class DestinationsViewModel(
    private val destinationRepository: DestinationRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(DestinationsUiState())
    val uiState: StateFlow<DestinationsUiState> = _uiState.asStateFlow()
    
    init {
        loadDestinations()
        loadFilters()
    }
    
    private fun loadDestinations() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = destinationRepository.getDestinations(
                query = _uiState.value.searchQuery.takeIf { it.isNotEmpty() },
                country = _uiState.value.selectedCountry,
                category = _uiState.value.selectedCategory,
                tags = _uiState.value.selectedTags.joinToString(",").takeIf { _uiState.value.selectedTags.isNotEmpty() },
                priceMin = _uiState.value.priceMin,
                priceMax = _uiState.value.priceMax,
                sort = _uiState.value.sortBy
            )
            
            result.onSuccess { destinations ->
                _uiState.value = _uiState.value.copy(
                    destinations = destinations,
                    filteredDestinations = destinations,
                    isLoading = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to load destinations",
                    isLoading = false
                )
            }
        }
    }
    
    private fun loadFilters() {
        viewModelScope.launch {
            val tagsResult = destinationRepository.getAllTags()
            val categoriesResult = destinationRepository.getAllCategories()
            
            tagsResult.onSuccess { tags ->
                _uiState.value = _uiState.value.copy(availableTags = tags)
            }
            
            categoriesResult.onSuccess { categories ->
                _uiState.value = _uiState.value.copy(availableCategories = categories)
            }
            
            // Extract unique countries from destinations
            val countries = _uiState.value.destinations
                .mapNotNull { it.country }
                .distinct()
                .sorted()
            _uiState.value = _uiState.value.copy(availableCountries = countries)
        }
    }
    
    fun search(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        loadDestinations()
    }
    
    fun filterByCountry(country: String?) {
        _uiState.value = _uiState.value.copy(selectedCountry = country)
        loadDestinations()
    }
    
    fun filterByCategory(category: String?) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        loadDestinations()
    }
    
    fun toggleTag(tag: String) {
        val currentTags = _uiState.value.selectedTags.toMutableList()
        if (currentTags.contains(tag)) {
            currentTags.remove(tag)
        } else {
            currentTags.add(tag)
        }
        _uiState.value = _uiState.value.copy(selectedTags = currentTags)
        loadDestinations()
    }
    
    fun setPriceRange(min: Double?, max: Double?) {
        _uiState.value = _uiState.value.copy(
            priceMin = min,
            priceMax = max
        )
        loadDestinations()
    }
    
    fun setSortBy(sort: String) {
        _uiState.value = _uiState.value.copy(sortBy = sort)
        loadDestinations()
    }
    
    fun toggleFilters() {
        _uiState.value = _uiState.value.copy(
            showFilters = !_uiState.value.showFilters
        )
    }
    
    fun toggleViewMode() {
        _uiState.value = _uiState.value.copy(
            viewMode = if (_uiState.value.viewMode == ViewMode.GRID) ViewMode.LIST else ViewMode.GRID
        )
    }
    
    fun clearFilters() {
        _uiState.value = _uiState.value.copy(
            searchQuery = "",
            selectedCountry = null,
            selectedCategory = null,
            selectedTags = emptyList(),
            priceMin = null,
            priceMax = null,
            sortBy = "popularity:desc"
        )
        loadDestinations()
    }
    
    fun refresh() {
        loadDestinations()
    }
}




