package com.triplink.mobile.data.repository

import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService

class DestinationRepository(
    private val apiService: ApiService
) {
    suspend fun getDestinations(
        query: String? = null,
        country: String? = null,
        tags: String? = null,
        category: String? = null,
        priceMin: Double? = null,
        priceMax: Double? = null,
        sort: String? = null,
        limit: Int = 100,
        offset: Int = 0
    ): Result<List<DestinationResponse>> {
        return try {
            val response = apiService.getDestinations(
                query = query,
                country = country,
                tags = tags,
                category = category,
                priceMin = priceMin,
                priceMax = priceMax,
                sort = sort,
                limit = limit,
                offset = offset
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch destinations"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getDestination(id: Int): Result<DestinationResponse> {
        return try {
            val response = apiService.getDestination(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch destination"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getFeaturedDestinations(): Result<List<DestinationResponse>> {
        return try {
            val response = apiService.getFeaturedDestinations()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch featured destinations"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getPopularDestinations(): Result<List<DestinationResponse>> {
        return try {
            val response = apiService.getPopularDestinations()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch popular destinations"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getRecommendedDestinations(): Result<List<DestinationResponse>> {
        return try {
            val response = apiService.getRecommendedDestinations()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch recommendations"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAutocompleteSuggestions(query: String, limit: Int = 10): Result<List<AutocompleteSuggestion>> {
        return try {
            if (query.length < 2) {
                return Result.success(emptyList())
            }
            val response = apiService.getAutocompleteSuggestions(query, limit)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch suggestions"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAllTags(): Result<List<String>> {
        return try {
            val response = apiService.getAllTags()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch tags"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAllCategories(): Result<List<String>> {
        return try {
            val response = apiService.getAllCategories()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch categories"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

