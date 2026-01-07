package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val user: UserData? = null,
    val error: String? = null,
    val loginSuccess: Boolean = false,
    val registerSuccess: Boolean = false
)

class AuthViewModel(
    val authRepository: AuthRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()
    
    init {
        checkAuthStatus()
    }
    
    private fun checkAuthStatus() {
        viewModelScope.launch {
            val isAuth = authRepository.isAuthenticated()
            val user = if (isAuth) authRepository.getStoredUser() else null
            _uiState.value = _uiState.value.copy(
                isAuthenticated = isAuth,
                user = user
            )
        }
    }
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                error = null,
                loginSuccess = false
            )
            
            val request = LoginRequest(email = email, password = password)
            val result = authRepository.login(request)
            
            result.onSuccess { response ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isAuthenticated = true,
                    user = response.user,
                    loginSuccess = true,
                    error = null
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = error.message ?: "Login failed",
                    loginSuccess = false
                )
            }
        }
    }
    
    fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        phone: String? = null,
        travelStyles: List<String> = emptyList(),
        interests: List<String> = emptyList()
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                error = null,
                registerSuccess = false
            )
            
            val request = RegisterRequest(
                email = email,
                password = password,
                firstName = firstName,
                lastName = lastName,
                phone = phone
            )
            val result = authRepository.register(request)
            
            result.onSuccess { response ->
                // If travel styles or interests are provided, submit onboarding
                if (travelStyles.isNotEmpty() || interests.isNotEmpty()) {
                    val onboardingResult = authRepository.submitOnboarding(
                        travelStyles = travelStyles,
                        interests = interests
                    )
                    onboardingResult.onFailure { error ->
                        // Registration succeeded but onboarding failed - still show success
                        // but log the error
                        android.util.Log.w("AuthViewModel", "Onboarding failed: ${error.message}")
                    }
                }
                
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isAuthenticated = true,
                    user = response.user,
                    registerSuccess = true,
                    error = null
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = error.message ?: "Registration failed",
                    registerSuccess = false
                )
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = AuthUiState()
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    fun clearSuccessFlags() {
        _uiState.value = _uiState.value.copy(
            loginSuccess = false,
            registerSuccess = false
        )
    }
}

