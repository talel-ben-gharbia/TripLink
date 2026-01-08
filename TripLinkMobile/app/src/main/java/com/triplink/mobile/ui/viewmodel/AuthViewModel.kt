package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.repository.AuthRepository
import com.triplink.mobile.navigation.Screen
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import androidx.navigation.NavController

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
            val user = if (isAuth) {
                // Verify token is still valid by calling /api/me
                try {
                    val response = authRepository.getCurrentUser()
                    response.fold(
                        onSuccess = { userResponse ->
                            val verifiedUser = userResponse.user
                            authRepository.saveUser(verifiedUser)
                            AuthStateManager.setUser(verifiedUser)
                            verifiedUser
                        },
                        onFailure = {
                            // Token invalid, clear storage
                            authRepository.logout()
                            AuthStateManager.clearUser()
                            null
                        }
                    )
                } catch (e: Exception) {
                    authRepository.logout()
                    AuthStateManager.clearUser()
                    null
                }
            } else {
                AuthStateManager.clearUser()
                null
            }
            
            _uiState.value = _uiState.value.copy(
                isAuthenticated = user != null,
                user = user
            )
        }
    }
    
    fun verifyAuth() {
        viewModelScope.launch {
            val isAuth = authRepository.isAuthenticated()
            if (isAuth) {
                val response = authRepository.getCurrentUser()
                response.onSuccess { userResponse ->
                    val user = userResponse.user
                    authRepository.saveUser(user)
                    AuthStateManager.setUser(user)
                    _uiState.value = _uiState.value.copy(
                        isAuthenticated = true,
                        user = user
                    )
                }.onFailure {
                    authRepository.logout()
                    AuthStateManager.clearUser()
                    _uiState.value = _uiState.value.copy(
                        isAuthenticated = false,
                        user = null
                    )
                }
            } else {
                AuthStateManager.clearUser()
                _uiState.value = _uiState.value.copy(
                    isAuthenticated = false,
                    user = null
                )
            }
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
                val user = response.user
                // Login always returns a user
                if (user != null) {
                    authRepository.saveUser(user)
                    AuthStateManager.setUser(user)
                }
                
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isAuthenticated = true,
                    user = user,
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
        phone: String,
        travelStyles: List<String> = emptyList(),
        interests: List<String> = emptyList()
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                error = null,
                registerSuccess = false
            )
            
            // Phone is required by backend - ensure it's not empty
            if (phone.isBlank()) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Phone number is required",
                    registerSuccess = false
                )
                return@launch
            }
            
            val request = RegisterRequest(
                email = email,
                password = password,
                firstName = firstName,
                lastName = lastName,
                phone = phone,
                travelStyles = travelStyles.takeIf { it.isNotEmpty() },
                interests = interests.takeIf { it.isNotEmpty() }
            )
            val result = authRepository.register(request)
            
            result.onSuccess { response ->
                // Front-end shows email verification after registration, doesn't auto-login
                // Backend returns message only (no user/token) until email is verified
                val user = response.user
                
                // Don't auto-login after registration - show email verification instead
                // Only set authenticated if user is already verified and present
                val isVerified = user?.isVerified == true
                if (isVerified && user != null) {
                    authRepository.saveUser(user)
                    AuthStateManager.setUser(user)
                } else {
                    // Don't save token/user - user needs to verify email first
                    // Clear any token that might have been saved
                    authRepository.logout()
                }
                
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isAuthenticated = isVerified,
                    user = if (isVerified) user else null,
                    registerSuccess = true, // Success flag for showing email verification
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
    
    fun logout(navController: NavController? = null) {
        viewModelScope.launch {
            authRepository.logout()
            AuthStateManager.clearUser()
            _uiState.value = AuthUiState()
            // Navigate to home after logout
            navController?.navigate(Screen.Home.route) {
                popUpTo(0)
            }
        }
    }
    
    fun getRedirectRoute(user: UserData?): String {
        return when {
            user?.mustChangePassword == true -> Screen.ChangePassword.route
            user?.roles?.contains("ROLE_ADMIN") == true || user?.isAdmin == true -> Screen.AdminDashboard.route
            user?.roles?.contains("ROLE_AGENT") == true || user?.isAgent == true -> Screen.AgentDashboard.route
            else -> Screen.Home.route
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

