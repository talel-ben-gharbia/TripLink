package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.UserData
import com.triplink.mobile.data.repository.AdminRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AdminUsersUiState(
    val isLoading: Boolean = false,
    val users: List<UserData> = emptyList(),
    val error: String? = null
)

class AdminUsersViewModel(
    private val adminRepository: AdminRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(AdminUsersUiState())
    val uiState: StateFlow<AdminUsersUiState> = _uiState.asStateFlow()
    
    init {
        loadUsers()
    }
    
    fun loadUsers() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = adminRepository.getUsers()
            
            result.onSuccess { users ->
                _uiState.value = _uiState.value.copy(
                    users = users,
                    isLoading = false,
                    error = null
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to load users",
                    isLoading = false
                )
            }
        }
    }
    
    fun suspendUser(id: Int) {
        viewModelScope.launch {
            val result = adminRepository.updateUserStatus(id, "SUSPENDED")
            result.onSuccess {
                loadUsers()
            }
        }
    }
    
    fun activateUser(id: Int) {
        viewModelScope.launch {
            val result = adminRepository.updateUserStatus(id, "ACTIVE")
            result.onSuccess {
                loadUsers()
            }
        }
    }
    
    fun deleteUser(id: Int) {
        viewModelScope.launch {
            val result = adminRepository.deleteUser(id)
            result.onSuccess {
                loadUsers()
            }
        }
    }
    
    fun refresh() {
        loadUsers()
    }
}






