package com.triplink.mobile.data.repository

import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService

class CollectionRepository(
    private val apiService: ApiService
) {
    suspend fun getCollections(type: String? = null): Result<List<CollectionResponse>> {
        return try {
            val response = apiService.getCollections(type)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch collections"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCollectionBySlug(slug: String): Result<CollectionDetailResponse> {
        return try {
            val response = apiService.getCollectionBySlug(slug)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch collection"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}






