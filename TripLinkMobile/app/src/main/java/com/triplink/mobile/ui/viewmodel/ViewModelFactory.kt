package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.triplink.mobile.data.repository.AuthRepository
import com.triplink.mobile.data.repository.DestinationRepository

class ViewModelFactory(
    private val authRepository: AuthRepository,
    private val destinationRepository: DestinationRepository,
    private val apiService: com.triplink.mobile.data.remote.ApiService
) : ViewModelProvider.Factory {
    
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when {
            modelClass.isAssignableFrom(HomeViewModel::class.java) -> {
                HomeViewModel(authRepository, destinationRepository) as T
            }
            modelClass.isAssignableFrom(AuthViewModel::class.java) -> {
                AuthViewModel(authRepository) as T
            }
            modelClass.isAssignableFrom(DestinationsViewModel::class.java) -> {
                DestinationsViewModel(destinationRepository) as T
            }
            modelClass.isAssignableFrom(MyBookingsViewModel::class.java) -> {
                MyBookingsViewModel(
                    bookingRepository = com.triplink.mobile.data.repository.BookingRepository(apiService)
                ) as T
            }
            modelClass.isAssignableFrom(ProfileViewModel::class.java) -> {
                ProfileViewModel(
                    authRepository = authRepository,
                    bookingRepository = com.triplink.mobile.data.repository.BookingRepository(apiService),
                    wishlistRepository = com.triplink.mobile.data.repository.WishlistRepository(apiService),
                    reviewRepository = com.triplink.mobile.data.repository.ReviewRepository(apiService)
                ) as T
            }
            modelClass.isAssignableFrom(SettingsViewModel::class.java) -> {
                SettingsViewModel(authRepository) as T
            }
            modelClass.isAssignableFrom(WishlistViewModel::class.java) -> {
                WishlistViewModel(
                    wishlistRepository = com.triplink.mobile.data.repository.WishlistRepository(apiService)
                ) as T
            }
            modelClass.isAssignableFrom(AgentDashboardViewModel::class.java) -> {
                AgentDashboardViewModel(
                    agentRepository = com.triplink.mobile.data.repository.AgentRepository(apiService)
                ) as T
            }
            modelClass.isAssignableFrom(AdminDashboardViewModel::class.java) -> {
                AdminDashboardViewModel(
                    adminRepository = com.triplink.mobile.data.repository.AdminRepository(apiService),
                    bookingRepository = com.triplink.mobile.data.repository.BookingRepository(apiService)
                ) as T
            }
            modelClass.isAssignableFrom(DestinationDetailsViewModel::class.java) -> {
                // DestinationDetailsViewModel requires destinationId, so we need to handle it differently
                throw IllegalArgumentException("DestinationDetailsViewModel must be created with destinationId parameter")
            }
            else -> throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
        }
    }
}

