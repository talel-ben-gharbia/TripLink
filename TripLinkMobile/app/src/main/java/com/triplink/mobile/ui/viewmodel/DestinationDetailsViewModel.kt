package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.DestinationResponse
import com.triplink.mobile.data.repository.AuthRepository
import com.triplink.mobile.data.repository.DestinationRepository
import com.triplink.mobile.data.repository.WishlistRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DestinationDetailsUiState(
    val isLoading: Boolean = false,
    val destination: DestinationResponse? = null,
    val error: String? = null,
    val wishlisted: Boolean = false,
    val currentImageIndex: Int = 0,
    val showImageModal: Boolean = false,
    val showBookingModal: Boolean = false
)

class DestinationDetailsViewModel(
    private val destinationRepository: DestinationRepository,
    private val authRepository: AuthRepository,
    private val wishlistRepository: WishlistRepository,
    destinationId: Int
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(DestinationDetailsUiState())
    val uiState: StateFlow<DestinationDetailsUiState> = _uiState.asStateFlow()
    
    init {
        loadDestination(destinationId)
        checkWishlistStatus(destinationId)
    }
    
    fun loadDestination(id: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = destinationRepository.getDestination(id)
            
            result.onSuccess { destination ->
                _uiState.value = _uiState.value.copy(
                    destination = destination,
                    isLoading = false,
                    error = null
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to load destination",
                    isLoading = false
                )
            }
        }
    }
    
    private fun checkWishlistStatus(destinationId: Int) {
        viewModelScope.launch {
            if (authRepository.isAuthenticated()) {
                val result = wishlistRepository.getWishlist()
                result.onSuccess { wishlist ->
                    val isWishlisted = wishlist.any { it.id == destinationId }
                    _uiState.value = _uiState.value.copy(wishlisted = isWishlisted)
                }.onFailure {
                    // If we can't check, assume not wishlisted
                    _uiState.value = _uiState.value.copy(wishlisted = false)
                }
            }
        }
    }
    
    fun setImageIndex(index: Int) {
        _uiState.value = _uiState.value.copy(currentImageIndex = index)
    }
    
    fun showImageModal(show: Boolean) {
        _uiState.value = _uiState.value.copy(showImageModal = show)
    }
    
    fun showBookingModal(show: Boolean) {
        _uiState.value = _uiState.value.copy(showBookingModal = show)
    }
    
    fun toggleWishlist() {
        viewModelScope.launch {
            val destination = _uiState.value.destination ?: return@launch
            val destinationId = destination.id
            val currentlyWishlisted = _uiState.value.wishlisted
            
            if (currentlyWishlisted) {
                // Remove from wishlist
                val result = wishlistRepository.removeFromWishlist(destinationId)
                result.onSuccess {
                    _uiState.value = _uiState.value.copy(wishlisted = false)
                }.onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to remove from wishlist"
                    )
                }
            } else {
                // Add to wishlist
                val result = wishlistRepository.addToWishlist(destinationId)
                result.onSuccess {
                    _uiState.value = _uiState.value.copy(wishlisted = true)
                }.onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to add to wishlist"
                    )
                }
            }
        }
    }
}

