package com.triplink.mobile.data.repository

import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService

class AgentRepository(
    private val apiService: ApiService
) {
    suspend fun submitAgentApplication(request: AgentApplicationRequest): Result<ApiResponse> {
        return try {
            val response = apiService.submitAgentApplication(request)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to submit application"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAgentApplicationStatus(): Result<AgentApplicationResponse> {
        return try {
            val response = apiService.getAgentApplicationStatus()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get application status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAgentDashboard(): Result<AgentDashboardResponse> {
        return try {
            val response = apiService.getAgentDashboard()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get dashboard"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getPendingBookings(): Result<List<BookingResponse>> {
        return try {
            val response = apiService.getPendingBookings()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get pending bookings"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAgentBookings(): Result<List<BookingResponse>> {
        return try {
            val response = apiService.getAgentBookings()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get bookings"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun assignBooking(bookingId: Int): Result<ApiResponse> {
        return try {
            val response = apiService.assignBooking(bookingId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to assign booking"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun confirmAgentBooking(bookingId: Int): Result<ApiResponse> {
        return try {
            val response = apiService.confirmAgentBooking(bookingId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to confirm booking"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCommissions(): Result<List<CommissionResponse>> {
        return try {
            val response = apiService.getCommissions()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get commissions"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getConversation(clientId: Int): Result<List<MessageResponse>> {
        return try {
            val response = apiService.getConversation(clientId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get conversation"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun sendMessage(
        clientId: Int,
        subject: String,
        message: String,
        bookingId: Int? = null
    ): Result<ApiResponse> {
        return try {
            val request = SendMessageRequest(
                clientId = clientId,
                subject = subject,
                message = message,
                bookingId = bookingId
            )
            val response = apiService.sendMessage(request)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to send message"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getUnreadMessageCount(): Result<Int> {
        return try {
            val response = apiService.getUnreadMessageCount()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.count)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get unread count"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun markMessageAsRead(messageId: Int): Result<ApiResponse> {
        return try {
            val response = apiService.markMessageAsRead(messageId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to mark as read"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

