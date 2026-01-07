package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.DestinationResponse
import com.triplink.mobile.data.repository.WishlistRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class WishlistUiState(
    val isLoading: Boolean = false,
    val destinations: List<DestinationResponse> = emptyList(),
    val error: String? = null
)

class WishlistViewModel(
    private val wishlistRepository: WishlistRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(WishlistUiState())
    val uiState: StateFlow<WishlistUiState> = _uiState.asStateFlow()
    
    init {
        loadWishlist()
    }
    
    fun loadWishlist() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = wishlistRepository.getWishlist()
            
            result.onSuccess { destinations ->
                _uiState.value = _uiState.value.copy(
                    destinations = destinations,
                    isLoading = false,
                    error = null
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to load wishlist",
                    isLoading = false
                )
            }
        }
    }
    
    fun removeFromWishlist(destinationId: Int) {
        viewModelScope.launch {
            val result = wishlistRepository.removeFromWishlist(destinationId)
            result.onSuccess {
                loadWishlist()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to remove from wishlist"
                )
            }
        }
    }
    
    fun refresh() {
        loadWishlist()
    }
}

