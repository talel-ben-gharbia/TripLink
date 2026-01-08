package com.triplink.mobile.data.repository

import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class ItineraryRepository(
    private val apiService: ApiService
) {
    suspend fun getItinerary(
        startDate: String? = null,
        endDate: String? = null
    ): Result<ItineraryResponse> {
        return try {
            val response = apiService.getItinerary(startDate, endDate)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get itinerary"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createItineraryItem(request: CreateItineraryItemRequest): Result<ItineraryItemResponse> {
        return try {
            val response = apiService.createItineraryItem(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to create itinerary item"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateItineraryItem(
        id: Int,
        request: UpdateItineraryItemRequest
    ): Result<ItineraryItemResponse> {
        return try {
            val response = apiService.updateItineraryItem(id, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update itinerary item"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteItineraryItem(id: Int): Result<ApiResponse> {
        return try {
            val response = apiService.deleteItineraryItem(id)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete itinerary item"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

