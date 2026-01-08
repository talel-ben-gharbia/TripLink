package com.triplink.mobile.data.repository

import com.google.gson.Gson
import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

class TravelDocumentRepository(
    private val apiService: ApiService
) {
    suspend fun getTravelDocuments(): Result<TravelDocumentListResponse> {
        return try {
            val response = apiService.getTravelDocuments()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch documents"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun uploadTravelDocument(
        file: File,
        documentType: String,
        documentNumber: String? = null,
        expirationDate: String? = null,
        issueDate: String? = null,
        country: String? = null
    ): Result<TravelDocumentResponse> {
        return try {
            // Validate file size (10MB max)
            if (file.length() > 10 * 1024 * 1024) {
                return Result.failure(Exception("File size exceeds 10MB limit"))
            }
            
            // Create multipart file part
            val requestFile = file.asRequestBody("image/*".toMediaType())
            val filePart = MultipartBody.Part.createFormData("file", file.name, requestFile)
            
            // Create data JSON part
            val data = mapOf(
                "documentType" to documentType,
                "documentNumber" to (documentNumber ?: ""),
                "expirationDate" to (expirationDate ?: ""),
                "issueDate" to (issueDate ?: ""),
                "country" to (country ?: "")
            )
            val dataJson = Gson().toJson(data)
            val dataPart = dataJson.toRequestBody("application/json".toMediaType())
            
            val response = apiService.uploadTravelDocument(filePart, dataPart)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to upload document"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateTravelDocument(
        id: Int,
        documentType: String? = null,
        documentNumber: String? = null,
        expirationDate: String? = null,
        issueDate: String? = null,
        country: String? = null
    ): Result<TravelDocumentResponse> {
        return try {
            val request = UpdateTravelDocumentRequest(
                documentType = documentType,
                documentNumber = documentNumber,
                expirationDate = expirationDate,
                issueDate = issueDate,
                country = country
            )
            val response = apiService.updateTravelDocument(id, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update document"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteTravelDocument(id: Int): Result<ApiResponse> {
        return try {
            val response = apiService.deleteTravelDocument(id)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete document"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}






