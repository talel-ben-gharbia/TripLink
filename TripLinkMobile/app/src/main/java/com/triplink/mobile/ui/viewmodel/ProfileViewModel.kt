package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.repository.AuthRepository
import com.triplink.mobile.data.repository.BookingRepository
import com.triplink.mobile.data.repository.WishlistRepository
import com.triplink.mobile.data.repository.ReviewRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import java.util.Date

enum class ProfileTab {
    OVERVIEW, BOOKINGS, PREFERENCES, WISHLIST, REVIEWS, ACTIVITY, SETTINGS
}

enum class PreferencesSubTab {
    PERSONALITY, CATEGORIES
}

data class ProfileUiState(
    val isLoading: Boolean = false,
    val user: UserData? = null,
    val profile: UserProfileData? = null,
    val error: String? = null,
    val saving: Boolean = false,
    val lastSaved: Date? = null,
    val activeTab: ProfileTab = ProfileTab.OVERVIEW,
    val preferencesSubTab: PreferencesSubTab = PreferencesSubTab.PERSONALITY,
    val settingsSubTab: String = "account",
    
    // Personality Axis (8 axes)
    val personalityAxis: Map<String, Int> = mapOf(
        "adventurous" to 50,
        "cultural" to 50,
        "luxury" to 50,
        "budget" to 50,
        "spontaneous" to 50,
        "planned" to 50,
        "social" to 50,
        "solo" to 50
    ),
    
    // Preference Categories (16 categories)
    val preferenceCategories: Map<String, Int> = mapOf(
        "hotels" to 50,
        "hostels" to 50,
        "apartments" to 50,
        "resorts" to 50,
        "adventure" to 50,
        "culture" to 50,
        "nature" to 50,
        "nightlife" to 50,
        "local" to 50,
        "fineDining" to 50,
        "streetFood" to 50,
        "vegetarian" to 50,
        "flights" to 50,
        "trains" to 50,
        "buses" to 50,
        "cars" to 50
    ),
    
    // Wishlist
    val wishlist: List<DestinationResponse> = emptyList(),
    val wishlistLoading: Boolean = false,
    
    // Reviews
    val reviews: List<ReviewResponse> = emptyList(),
    val reviewsLoading: Boolean = false,
    
    // Activity
    val activity: ProfileActivityResponse? = null,
    val activityLoading: Boolean = false,
    
    // Bookings
    val bookings: List<BookingResponse> = emptyList(),
    val bookingsLoading: Boolean = false,
    
    // Account settings
    val accountData: AccountData = AccountData(),
    val passwordData: PasswordData = PasswordData(),
    val passwordError: String? = null,
    val passwordSuccess: String? = null,
    val deletePassword: String = "",
    val deleteError: String? = null,
    val showDeleteConfirm: Boolean = false
)

data class AccountData(
    val firstName: String = "",
    val lastName: String = "",
    val phone: String = ""
)

data class PasswordData(
    val current: String = "",
    val next: String = "",
    val confirm: String = ""
)

class ProfileViewModel(
    private val authRepository: AuthRepository,
    private val bookingRepository: BookingRepository,
    private val wishlistRepository: WishlistRepository,
    private val reviewRepository: ReviewRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()
    
    private var autoSaveJob: kotlinx.coroutines.Job? = null
    
    init {
        loadProfile()
    }
    
    private fun loadProfile() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            // Load profile
            val profileResult = authRepository.getProfile()
            profileResult.onSuccess { response ->
                val user = response.user
                _uiState.value = _uiState.value.copy(
                    user = user,
                    profile = response.profile,
                    isLoading = false,
                    personalityAxis = user.personalityAxis ?: _uiState.value.personalityAxis,
                    preferenceCategories = user.preferenceCategories ?: _uiState.value.preferenceCategories,
                    accountData = AccountData(
                        firstName = user.firstName ?: "",
                        lastName = user.lastName ?: "",
                        phone = user.phone ?: ""
                    )
                )
                
                // Load wishlist
                loadWishlist()
                
                // Load reviews
                loadReviews()
                
                // Load activity
                loadActivity()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = error.message
                )
            }
        }
    }
    
    fun loadWishlist() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(wishlistLoading = true)
            val result = wishlistRepository.getWishlist()
            result.onSuccess { wishlist ->
                _uiState.value = _uiState.value.copy(
                    wishlist = wishlist,
                    wishlistLoading = false
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    wishlistLoading = false
                )
            }
        }
    }
    
    fun loadReviews() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(reviewsLoading = true)
            val result = authRepository.getProfileReviews()
            result.onSuccess { reviews ->
                _uiState.value = _uiState.value.copy(
                    reviews = reviews,
                    reviewsLoading = false
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    reviewsLoading = false
                )
            }
        }
    }
    
    fun loadActivity() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(activityLoading = true)
            val result = authRepository.getProfileActivity()
            result.onSuccess { activity ->
                _uiState.value = _uiState.value.copy(
                    activity = activity,
                    activityLoading = false
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    activityLoading = false
                )
            }
        }
    }
    
    fun loadBookings() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(bookingsLoading = true)
            val result = bookingRepository.getMyBookings()
            result.onSuccess { bookings ->
                _uiState.value = _uiState.value.copy(
                    bookings = bookings,
                    bookingsLoading = false
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    bookingsLoading = false
                )
            }
        }
    }
    
    fun setActiveTab(tab: ProfileTab) {
        _uiState.value = _uiState.value.copy(activeTab = tab)
        
        // Load data when switching to bookings tab
        if (tab == ProfileTab.BOOKINGS && _uiState.value.bookings.isEmpty()) {
            loadBookings()
        }
    }
    
    fun setPreferencesSubTab(tab: PreferencesSubTab) {
        _uiState.value = _uiState.value.copy(preferencesSubTab = tab)
    }
    
    fun updatePersonalityAxis(axis: String, value: Int) {
        val newValue = value.coerceIn(0, 100)
        val updated = _uiState.value.personalityAxis.toMutableMap()
        updated[axis] = newValue
        _uiState.value = _uiState.value.copy(personalityAxis = updated)
        scheduleAutoSave()
    }
    
    fun updatePreferenceCategory(category: String, value: Int) {
        val newValue = value.coerceIn(0, 100)
        val updated = _uiState.value.preferenceCategories.toMutableMap()
        updated[category] = newValue
        _uiState.value = _uiState.value.copy(preferenceCategories = updated)
        scheduleAutoSave()
    }
    
    private fun scheduleAutoSave() {
        autoSaveJob?.cancel()
        autoSaveJob = viewModelScope.launch {
            delay(2000) // Auto-save after 2 seconds of inactivity
            savePreferences()
        }
    }
    
    private suspend fun savePreferences() {
        _uiState.value = _uiState.value.copy(saving = true)
        val request = UpdateProfileRequest(
            personalityAxis = _uiState.value.personalityAxis,
            preferenceCategories = _uiState.value.preferenceCategories
        )
        val result = authRepository.updateProfile(request)
        result.onSuccess {
            _uiState.value = _uiState.value.copy(
                saving = false,
                lastSaved = Date(),
                user = it.user
            )
        }.onFailure {
            _uiState.value = _uiState.value.copy(
                saving = false,
                error = it.message
            )
        }
    }
    
    fun resetPersonalityAxis() {
        val reset = _uiState.value.personalityAxis.keys.associateWith { 50 }
        _uiState.value = _uiState.value.copy(personalityAxis = reset)
        scheduleAutoSave()
    }
    
    fun resetPreferenceCategories() {
        val reset = _uiState.value.preferenceCategories.keys.associateWith { 50 }
        _uiState.value = _uiState.value.copy(preferenceCategories = reset)
        scheduleAutoSave()
    }
    
    fun removeFromWishlist(destinationId: Int) {
        viewModelScope.launch {
            val result = wishlistRepository.removeFromWishlist(destinationId)
            result.onSuccess {
                loadWishlist()
            }
        }
    }
    
    fun clearWishlist() {
        viewModelScope.launch {
            _uiState.value.wishlist.forEach { destination ->
                wishlistRepository.removeFromWishlist(destination.id)
            }
            loadWishlist()
        }
    }
    
    fun updateAccountData(data: AccountData) {
        _uiState.value = _uiState.value.copy(accountData = data)
    }
    
    fun saveAccountData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(saving = true)
            val request = UpdateProfileRequest(
                firstName = _uiState.value.accountData.firstName,
                lastName = _uiState.value.accountData.lastName,
                phone = _uiState.value.accountData.phone
            )
            val result = authRepository.updateProfile(request)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(
                    user = it.user,
                    saving = false,
                    lastSaved = Date()
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    saving = false,
                    error = it.message
                )
            }
        }
    }
    
    fun updatePasswordData(data: PasswordData) {
        _uiState.value = _uiState.value.copy(passwordData = data)
    }
    
    fun changePassword() {
        viewModelScope.launch {
            val pwd = _uiState.value.passwordData
            if (pwd.current.isEmpty() || pwd.next.isEmpty() || pwd.confirm.isEmpty()) {
                _uiState.value = _uiState.value.copy(
                    passwordError = "Please fill in all fields"
                )
                return@launch
            }
            if (pwd.next != pwd.confirm) {
                _uiState.value = _uiState.value.copy(
                    passwordError = "New passwords do not match"
                )
                return@launch
            }
            if (pwd.next.length < 8 || !pwd.next.any { it.isUpperCase() } ||
                !pwd.next.any { it.isLowerCase() } || !pwd.next.any { it.isDigit() }) {
                _uiState.value = _uiState.value.copy(
                    passwordError = "Password must be 8+ chars with upper, lower, number"
                )
                return@launch
            }
            
            val result = authRepository.changePassword(pwd.current, pwd.next)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(
                    passwordData = PasswordData(),
                    passwordError = null,
                    passwordSuccess = "Password changed successfully"
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    passwordError = it.message ?: "Failed to change password"
                )
            }
        }
    }
    
    fun setDeletePassword(password: String) {
        _uiState.value = _uiState.value.copy(deletePassword = password)
    }
    
    fun setShowDeleteConfirm(show: Boolean) {
        _uiState.value = _uiState.value.copy(showDeleteConfirm = show)
    }
    
    fun deleteAccount() {
        viewModelScope.launch {
            if (_uiState.value.deletePassword.isEmpty()) {
                _uiState.value = _uiState.value.copy(
                    deleteError = "Password is required"
                )
                return@launch
            }
            
            val result = authRepository.deleteAccount(_uiState.value.deletePassword)
            result.onSuccess {
                _uiState.value = ProfileUiState()
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    deleteError = it.message ?: "Failed to delete account"
                )
            }
        }
    }
    
    fun getProfileCompletion(): Int {
        val values = _uiState.value.personalityAxis.values + _uiState.value.preferenceCategories.values
        if (values.isEmpty()) return 0
        return values.average().toInt()
    }
    
    fun getTopPreferences(): List<Pair<String, Int>> {
        return _uiState.value.preferenceCategories
            .toList()
            .sortedByDescending { it.second }
            .take(6)
    }
    
    fun refresh() {
        loadProfile()
    }
    
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = ProfileUiState()
        }
    }
}
