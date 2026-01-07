package com.triplink.mobile.di

import android.content.Context
import com.triplink.mobile.data.local.AuthTokenManager
import com.triplink.mobile.data.remote.ApiService
import com.triplink.mobile.data.remote.NetworkModule
import com.triplink.mobile.data.repository.AuthRepository
import com.triplink.mobile.data.repository.DestinationRepository

class AppContainer(private val context: Context) {
    val tokenManager: AuthTokenManager by lazy { AuthTokenManager(context) }
    val apiService: ApiService by lazy { NetworkModule.createApiService(tokenManager) }
    val authRepository: AuthRepository by lazy { AuthRepository(apiService, tokenManager) }
    val destinationRepository: DestinationRepository by lazy { DestinationRepository(apiService) }
    val bookingRepository: com.triplink.mobile.data.repository.BookingRepository by lazy { 
        com.triplink.mobile.data.repository.BookingRepository(apiService) 
    }
    val wishlistRepository: com.triplink.mobile.data.repository.WishlistRepository by lazy {
        com.triplink.mobile.data.repository.WishlistRepository(apiService)
    }
    val collectionRepository: com.triplink.mobile.data.repository.CollectionRepository by lazy {
        com.triplink.mobile.data.repository.CollectionRepository(apiService)
    }
    val agentRepository: com.triplink.mobile.data.repository.AgentRepository by lazy {
        com.triplink.mobile.data.repository.AgentRepository(apiService)
    }
    val adminRepository: com.triplink.mobile.data.repository.AdminRepository by lazy {
        com.triplink.mobile.data.repository.AdminRepository(apiService)
    }
    val reviewRepository: com.triplink.mobile.data.repository.ReviewRepository by lazy {
        com.triplink.mobile.data.repository.ReviewRepository(apiService)
    }
    val notificationRepository: com.triplink.mobile.data.repository.NotificationRepository by lazy {
        com.triplink.mobile.data.repository.NotificationRepository(apiService)
    }
    val travelDocumentRepository: com.triplink.mobile.data.repository.TravelDocumentRepository by lazy {
        com.triplink.mobile.data.repository.TravelDocumentRepository(apiService)
    }
}

