package com.triplink.mobile.data.repository

import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService

class AdminRepository(
    private val apiService: ApiService
) {
    suspend fun getUsers(): Result<List<UserData>> {
        return try {
            val response = apiService.getUsers()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch users"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getUserDetails(id: Int): Result<UserDetailsResponse> {
        return try {
            val response = apiService.getUserDetails(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch user details"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateUserStatus(id: Int, status: String): Result<ApiResponse> {
        return try {
            val response = apiService.updateUserStatus(id, UpdateUserStatusRequest(status = status))
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update user status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteUser(id: Int): Result<ApiResponse> {
        return try {
            val response = apiService.deleteUser(id)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAdminDestinations(): Result<List<DestinationResponse>> {
        return try {
            val response = apiService.getAdminDestinations()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch destinations"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateDestinationFeatured(id: Int, isFeatured: Boolean): Result<ApiResponse> {
        return try {
            val response = apiService.updateDestinationFeatured(id, mapOf("isFeatured" to isFeatured))
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update destination"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAdminStats(): Result<AdminStatsResponse> {
        return try {
            val response = apiService.getAdminStats()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get admin stats"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAdminBookings(): Result<List<BookingResponse>> {
        return try {
            val response = apiService.getAdminBookings()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.bookings)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get admin bookings"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAdminBookingStats(): Result<AdminBookingStatsResponse> {
        return try {
            val response = apiService.getAdminBookingStats()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get booking stats"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAdminAgents(): Result<List<UserData>> {
        return try {
            val response = apiService.getAdminAgents()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.agents)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get agents"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun removeAgentRole(agentId: Int): Result<ApiResponse> {
        return try {
            val response = apiService.removeAgentRole(agentId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to remove agent role"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAdminAgentApplications(): Result<List<AgentApplicationResponse>> {
        return try {
            val response = apiService.getAdminAgentApplications()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.applications)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get agent applications"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun approveAgentApplication(applicationId: Int, adminNotes: String? = null): Result<ApiResponse> {
        return try {
            val response = apiService.approveAgentApplication(applicationId, ApproveAgentApplicationRequest(adminNotes = adminNotes))
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to approve application"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun rejectAgentApplication(applicationId: Int, reason: String? = null): Result<ApiResponse> {
        return try {
            val response = apiService.rejectAgentApplication(applicationId, RejectAgentApplicationRequest(reason = reason))
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to reject application"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAdminCollections(): Result<List<CollectionResponse>> {
        return try {
            val response = apiService.getAdminCollections()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get collections"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun suspendUser(userId: Int): Result<ApiResponse> {
        return try {
            val response = apiService.suspendUser(userId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to suspend user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun activateUser(userId: Int): Result<ApiResponse> {
        return try {
            val response = apiService.activateUser(userId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to activate user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun banUser(userId: Int): Result<ApiResponse> {
        return try {
            val response = apiService.banUser(userId)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to ban user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun featureDestination(id: Int): Result<ApiResponse> {
        return try {
            val response = apiService.featureDestination(id)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to feature destination"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun unfeatureDestination(id: Int): Result<ApiResponse> {
        return try {
            val response = apiService.unfeatureDestination(id)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to unfeature destination"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun pinDestination(id: Int): Result<ApiResponse> {
        return try {
            val response = apiService.pinDestination(id)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to pin destination"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun unpinDestination(id: Int): Result<ApiResponse> {
        return try {
            val response = apiService.unpinDestination(id)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to unpin destination"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

