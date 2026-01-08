package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.DestinationResponse
import com.triplink.mobile.data.model.UserData
import com.triplink.mobile.data.repository.AuthRepository
import com.triplink.mobile.data.repository.DestinationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = false,
    val user: UserData? = null,
    val featuredDestinations: List<DestinationResponse> = emptyList(),
    val recommendations: List<DestinationResponse> = emptyList(),
    val backendStatus: BackendStatus = BackendStatus.CHECKING,
    val showOnboarding: Boolean = false,
    val error: String? = null
)

enum class BackendStatus {
    CHECKING, CONNECTED, ERROR
}

class HomeViewModel(
    authRepository: AuthRepository,
    destinationRepository: DestinationRepository
) : ViewModel() {
    
    private val authRepo = authRepository
    private val destRepo = destinationRepository
    
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
    
    init {
        checkBackendStatus()
        loadUser()
        loadFeaturedDestinations()
    }
    
    private fun checkBackendStatus() {
        viewModelScope.launch {
            // Health check will be done via API call
            _uiState.value = _uiState.value.copy(backendStatus = BackendStatus.CHECKING)
        }
    }
    
    private fun loadUser() {
        viewModelScope.launch {
            val user = authRepo.getStoredUser()
            if (user != null) {
                AuthStateManager.setUser(user)
                // Verify token is still valid by calling /api/me
                val result = authRepo.getCurrentUser()
                result.onSuccess { response ->
                    val verifiedUser = response.user
                    authRepo.saveUser(verifiedUser)
                    AuthStateManager.setUser(verifiedUser)
                    _uiState.value = _uiState.value.copy(
                        user = verifiedUser,
                        showOnboarding = response.needsOnboarding == true
                    )
                    loadRecommendations()
                }.onFailure {
                    // Token invalid, clear storage
                    authRepo.logout()
                    AuthStateManager.clearUser()
                    _uiState.value = _uiState.value.copy(user = null)
                }
            } else {
                AuthStateManager.clearUser()
                _uiState.value = _uiState.value.copy(user = null)
            }
        }
    }
    
    private fun loadFeaturedDestinations() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val result = destRepo.getFeaturedDestinations()
            result.onSuccess { destinations ->
                _uiState.value = _uiState.value.copy(
                    featuredDestinations = destinations.take(6),
                    isLoading = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message,
                    isLoading = false
                )
            }
        }
    }
    
    private fun loadRecommendations() {
        viewModelScope.launch {
            val result = destRepo.getRecommendedDestinations()
            result.onSuccess { destinations ->
                _uiState.value = _uiState.value.copy(
                    recommendations = destinations.take(6)
                )
            }
        }
    }
    
    fun refresh() {
        loadUser()
        loadFeaturedDestinations()
        if (_uiState.value.user != null) {
            loadRecommendations()
        }
    }
    
    fun dismissOnboarding() {
        _uiState.value = _uiState.value.copy(showOnboarding = false)
    }
    
    fun logout() {
        viewModelScope.launch {
            authRepo.logout()
            AuthStateManager.clearUser()
            _uiState.value = _uiState.value.copy(
                user = null,
                recommendations = emptyList()
            )
        }
    }
    
    fun onboardingCompleted() {
        _uiState.value = _uiState.value.copy(showOnboarding = false)
        refresh()
    }
}

