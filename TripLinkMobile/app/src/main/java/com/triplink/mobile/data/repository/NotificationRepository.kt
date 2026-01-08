package com.triplink.mobile.data.repository

import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService

class NotificationRepository(
    private val apiService: ApiService
) {
    suspend fun getNotifications(
        limit: Int = 50,
        offset: Int = 0,
        unreadOnly: Boolean = false
    ): Result<List<NotificationResponse>> {
        return try {
            val response = apiService.getNotifications(
                limit = limit,
                offset = offset,
                unreadOnly = if (unreadOnly) "true" else null
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.notifications)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch notifications"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getUnreadCount(): Result<Int> {
        return try {
            val response = apiService.getUnreadCount()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.count)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch unread count"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun markAsRead(notificationIds: List<Int>): Result<ApiResponse> {
        return try {
            val request = MarkNotificationsReadRequest(notificationIds = notificationIds)
            val response = apiService.markAsRead(request)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to mark as read"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun markAllAsRead(): Result<ApiResponse> {
        return try {
            val response = apiService.markAllAsRead()
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to mark all as read"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}






