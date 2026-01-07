package com.triplink.mobile.data.repository

import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService

class WishlistRepository(
    private val apiService: ApiService
) {
    suspend fun getWishlist(): Result<List<DestinationResponse>> {
        return try {
            val response = apiService.getWishlist()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch wishlist"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun addToWishlist(destinationId: Int): Result<ApiResponse> {
        return try {
            val response = apiService.addToWishlist(destinationId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to add to wishlist"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun removeFromWishlist(destinationId: Int): Result<ApiResponse> {
        return try {
            val response = apiService.removeFromWishlist(destinationId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to remove from wishlist"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

