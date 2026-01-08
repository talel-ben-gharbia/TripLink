package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.UserData
import com.triplink.mobile.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Global authentication state manager
 * Similar to how front-end manages user state in localStorage and Navbar
 */
object AuthStateManager {
    private val _user = MutableStateFlow<UserData?>(null)
    val user: StateFlow<UserData?> = _user.asStateFlow()
    
    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()
    
    fun setUser(user: UserData?) {
        _user.value = user
        _isAuthenticated.value = user != null
    }
    
    fun clearUser() {
        _user.value = null
        _isAuthenticated.value = false
    }
    
    fun isAdmin(): Boolean {
        return _user.value?.roles?.contains("ROLE_ADMIN") == true || 
               _user.value?.isAdmin == true
    }
    
    fun isAgent(): Boolean {
        return _user.value?.roles?.contains("ROLE_AGENT") == true || 
               _user.value?.isAgent == true
    }
    
    fun mustChangePassword(): Boolean {
        return _user.value?.mustChangePassword == true
    }
}

