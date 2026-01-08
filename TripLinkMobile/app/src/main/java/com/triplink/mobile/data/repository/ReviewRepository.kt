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
    
    suspend fun getReviewStats(destinationId: Int): Result<ReviewStatsResponse> {
        return try {
            val response = apiService.getReviewStats(destinationId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch review stats"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateReview(
        destinationId: Int,
        reviewId: Int,
        rating: Int? = null,
        comment: String? = null,
        isPublic: Boolean? = null
    ): Result<ReviewResponse> {
        return try {
            val request = UpdateReviewRequest(rating = rating, comment = comment, isPublic = isPublic)
            val response = apiService.updateReview(destinationId, reviewId, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update review"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteReview(destinationId: Int, reviewId: Int): Result<ApiResponse> {
        return try {
            val response = apiService.deleteReview(destinationId, reviewId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete review"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

