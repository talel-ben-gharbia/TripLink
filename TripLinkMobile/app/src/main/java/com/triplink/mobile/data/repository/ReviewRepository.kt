package com.triplink.mobile.data.repository

import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService

class ReviewRepository(
    private val apiService: ApiService
) {
    suspend fun getDestinationReviews(destinationId: Int): Result<List<ReviewResponse>> {
        return try {
            val response = apiService.getDestinationReviews(destinationId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch reviews"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createReview(
        destinationId: Int,
        rating: Int,
        comment: String? = null,
        isPublic: Boolean = true
    ): Result<ReviewResponse> {
        return try {
            val request = CreateReviewRequest(rating = rating, comment = comment, isPublic = isPublic)
            val response = apiService.createReview(destinationId, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to create review"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getPublicReviews(): Result<List<ReviewResponse>> {
        return try {
            val response = apiService.getPublicReviews()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch public reviews"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

