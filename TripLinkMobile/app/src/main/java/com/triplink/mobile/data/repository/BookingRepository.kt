package com.triplink.mobile.data.repository

import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService

class BookingRepository(
    private val apiService: ApiService
) {
    suspend fun createBooking(request: CreateBookingRequest): Result<BookingResponse> {
        return try {
            val response = apiService.createBooking(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to create booking"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getMyBookings(): Result<List<BookingResponse>> {
        return try {
            val response = apiService.getMyBookings()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch bookings"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getBooking(id: Int): Result<BookingResponse> {
        return try {
            val response = apiService.getBooking(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch booking"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun cancelBooking(id: Int, reason: String): Result<ApiResponse> {
        return try {
            val response = apiService.cancelBooking(id, CancelBookingRequest(reason = reason))
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to cancel booking"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun checkRouting(request: CheckRoutingRequest): Result<RoutingResponse> {
        return try {
            val response = apiService.checkRouting(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to check routing"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createCheckoutSession(bookingId: Int): Result<CheckoutSessionResponse> {
        return try {
            val response = apiService.createCheckoutSession(CreateCheckoutSessionRequest(bookingId = bookingId))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to create checkout session"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun verifyCheckoutSession(bookingId: Int, sessionId: String): Result<ApiResponse> {
        return try {
            val response = apiService.verifyCheckoutSession(VerifyCheckoutRequest(bookingId = bookingId, sessionId = sessionId))
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to verify checkout session"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateBooking(id: Int, request: UpdateBookingRequest): Result<BookingResponse> {
        return try {
            val response = apiService.updateBooking(id, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update booking"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun completeBooking(id: Int): Result<BookingResponse> {
        return try {
            val response = apiService.completeBooking(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to complete booking"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

