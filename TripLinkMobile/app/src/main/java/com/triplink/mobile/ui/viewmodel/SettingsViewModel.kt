package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File

data class SettingsUiState(
    val isLoading: Boolean = false,
    val user: UserData? = null,
    val error: String? = null,
    val passwordError: String? = null,
    val passwordSuccess: Boolean = false,
    val updateError: String? = null,
    val updateSuccess: Boolean = false,
    val deleteError: String? = null,
    val saving: Boolean = false
)

class SettingsViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()
    
    init {
        loadUser()
    }
    
    private fun loadUser() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val user = authRepository.getStoredUser()
            val result = authRepository.getCurrentUser()
            
            result.onSuccess { response ->
                _uiState.value = _uiState.value.copy(
                    user = response.user,
                    isLoading = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    user = user,
                    isLoading = false,
                    error = error.message
                )
            }
        }
    }
    
    fun changePassword(currentPassword: String, newPassword: String, confirmPassword: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                passwordError = null,
                passwordSuccess = false,
                saving = true
            )
            
            // Validation
            if (currentPassword.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty()) {
                _uiState.value = _uiState.value.copy(
                    passwordError = "Please fill in all password fields",
                    saving = false
                )
                return@launch
            }
            
            if (newPassword != confirmPassword) {
                _uiState.value = _uiState.value.copy(
                    passwordError = "New passwords do not match",
                    saving = false
                )
                return@launch
            }
            
            if (newPassword.length < 8 || 
                !newPassword.any { it.isLowerCase() } ||
                !newPassword.any { it.isUpperCase() } ||
                !newPassword.any { it.isDigit() }) {
                _uiState.value = _uiState.value.copy(
                    passwordError = "Password must be 8+ chars with upper, lower, and number",
                    saving = false
                )
                return@launch
            }
            
            val result = authRepository.changePassword(currentPassword, newPassword)
            
            result.onSuccess {
                _uiState.value = _uiState.value.copy(
                    passwordSuccess = true,
                    passwordError = null,
                    saving = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    passwordError = error.message ?: "Failed to change password",
                    passwordSuccess = false,
                    saving = false
                )
            }
        }
    }
    
    fun updateProfile(
        firstName: String?,
        lastName: String?,
        phone: String?,
        travelStyles: List<String>? = null,
        interests: List<String>? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                updateError = null,
                updateSuccess = false,
                saving = true
            )
            
            val request = UpdateProfileRequest(
                firstName = firstName,
                lastName = lastName,
                phone = phone,
                travelStyles = travelStyles,
                interests = interests
            )
            
            val result = authRepository.updateProfile(request)
            
            result.onSuccess { response ->
                _uiState.value = _uiState.value.copy(
                    user = response.user,
                    updateSuccess = true,
                    updateError = null,
                    saving = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    updateError = error.message ?: "Failed to update profile",
                    updateSuccess = false,
                    saving = false
                )
            }
        }
    }
    
    fun uploadAvatar(file: File) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(saving = true)
            
            val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
            val body = MultipartBody.Part.createFormData("avatar", file.name, requestFile)
            
            val result = authRepository.uploadAvatar(body)
            
            result.onSuccess { response ->
                _uiState.value = _uiState.value.copy(
                    user = response.user,
                    saving = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to upload avatar",
                    saving = false
                )
            }
        }
    }
    
    fun deleteAccount(password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                deleteError = null,
                saving = true
            )
            
            if (password.isEmpty()) {
                _uiState.value = _uiState.value.copy(
                    deleteError = "Password is required",
                    saving = false
                )
                return@launch
            }
            
            val result = authRepository.deleteAccount(password)
            
            result.onSuccess {
                _uiState.value = _uiState.value.copy(
                    user = null,
                    saving = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    deleteError = error.message ?: "Failed to delete account",
                    saving = false
                )
            }
        }
    }
    
    fun clearPasswordMessages() {
        _uiState.value = _uiState.value.copy(
            passwordError = null,
            passwordSuccess = false
        )
    }
    
    fun clearUpdateMessages() {
        _uiState.value = _uiState.value.copy(
            updateError = null,
            updateSuccess = false
        )
    }
    
    fun refresh() {
        loadUser()
    }
}






