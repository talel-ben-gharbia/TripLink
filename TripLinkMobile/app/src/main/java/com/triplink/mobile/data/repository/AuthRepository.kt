package com.triplink.mobile.data.repository

import com.google.gson.Gson
import com.triplink.mobile.data.local.AuthTokenManager
import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.remote.ApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class AuthRepository(
    private val apiService: ApiService,
    private val tokenManager: AuthTokenManager
) {
    suspend fun register(request: RegisterRequest): Result<AuthResponse> {
        return try {
            val response = apiService.register(request)
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                tokenManager.saveToken(authResponse.token)
                authResponse.refresh_token?.let { tokenManager.saveRefreshToken(it) }
                Gson().toJson(authResponse.user).let { tokenManager.saveUser(it) }
                Result.success(authResponse)
            } else {
                Result.failure(Exception(response.message() ?: "Registration failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun login(request: LoginRequest): Result<AuthResponse> {
        return try {
            val response = apiService.login(request)
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                tokenManager.saveToken(authResponse.token)
                authResponse.refresh_token?.let { tokenManager.saveRefreshToken(it) }
                Gson().toJson(authResponse.user).let { tokenManager.saveUser(it) }
                Result.success(authResponse)
            } else {
                Result.failure(Exception(response.message() ?: "Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun logout(): Result<ApiResponse> {
        return try {
            val response = apiService.logout()
            tokenManager.clearToken()
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Logout failed"))
            }
        } catch (e: Exception) {
            tokenManager.clearToken()
            Result.failure(e)
        }
    }
    
    suspend fun getCurrentUser(): Result<UserResponse> {
        return try {
            val response = apiService.getCurrentUser()
            if (response.isSuccessful && response.body() != null) {
                val userResponse = response.body()!!
                Gson().toJson(userResponse.user).let { tokenManager.saveUser(it) }
                Result.success(userResponse)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun refreshToken(): Result<AuthResponse> {
        return try {
            val response = apiService.refreshToken()
            if (response.isSuccessful && response.body() != null) {
                val authResponse = response.body()!!
                tokenManager.saveToken(authResponse.token)
                authResponse.refresh_token?.let { tokenManager.saveRefreshToken(it) }
                Result.success(authResponse)
            } else {
                tokenManager.clearToken()
                Result.failure(Exception("Token refresh failed"))
            }
        } catch (e: Exception) {
            tokenManager.clearToken()
            Result.failure(e)
        }
    }
    
    fun getTokenFlow(): Flow<String?> = tokenManager.tokenFlow
    
    suspend fun isAuthenticated(): Boolean {
        return tokenManager.getToken() != null
    }
    
    suspend fun getStoredUser(): UserData? {
        return try {
            val userJson = tokenManager.getUserJson()
            if (userJson != null) {
                Gson().fromJson(userJson, UserData::class.java)
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
    
    suspend fun submitOnboarding(
        travelStyles: List<String> = emptyList(),
        interests: List<String> = emptyList(),
        categories: List<String> = emptyList(),
        tags: List<String> = emptyList(),
        budgetMin: Int? = null,
        budgetMax: Int? = null
    ): Result<ApiResponse> {
        return try {
            val budgetRange = if (budgetMin != null && budgetMax != null) {
                "$budgetMin-$budgetMax"
            } else null
            
            val request = OnboardingRequest(
                travelStyles = travelStyles.takeIf { it.isNotEmpty() },
                interests = (interests + tags).takeIf { (interests + tags).isNotEmpty() },
                budgetRange = budgetRange,
                preferredDestinations = categories.takeIf { it.isNotEmpty() }
            )
            val response = apiService.submitOnboarding(request)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Onboarding failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun forgotPassword(email: String): Result<ApiResponse> {
        return try {
            val request = ForgotPasswordRequest(email = email)
            val response = apiService.forgotPassword(request)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to send reset email"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun resetPassword(token: String, password: String): Result<ApiResponse> {
        return try {
            val request = ResetPasswordRequest(token = token, password = password)
            val response = apiService.resetPassword(request)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to reset password"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun changePassword(currentPassword: String, newPassword: String): Result<ApiResponse> {
        return try {
            val request = ChangePasswordRequest(
                currentPassword = currentPassword,
                newPassword = newPassword
            )
            val response = apiService.changePassword(request)
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to change password"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteAccount(password: String): Result<ApiResponse> {
        return try {
            val request = DeleteAccountRequest(password = password)
            val response = apiService.deleteAccount(request)
            tokenManager.clearToken()
            if (response.isSuccessful) {
                Result.success(response.body() ?: ApiResponse(success = true))
            } else {
                Result.failure(Exception(response.message() ?: "Failed to delete account"))
            }
        } catch (e: Exception) {
            tokenManager.clearToken()
            Result.failure(e)
        }
    }
    
    suspend fun updateProfile(request: UpdateProfileRequest): Result<ProfileResponse> {
        return try {
            val response = apiService.updateProfile(request)
            if (response.isSuccessful && response.body() != null) {
                val profileResponse = response.body()!!
                Gson().toJson(profileResponse.user).let { tokenManager.saveUser(it) }
                Result.success(profileResponse)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun uploadAvatar(file: okhttp3.MultipartBody.Part): Result<ProfileResponse> {
        return try {
            val response = apiService.uploadAvatar(file)
            if (response.isSuccessful && response.body() != null) {
                val profileResponse = response.body()!!
                Gson().toJson(profileResponse.user).let { tokenManager.saveUser(it) }
                Result.success(profileResponse)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to upload avatar"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getProfile(): Result<ProfileResponse> {
        return try {
            val response = apiService.getProfile()
            if (response.isSuccessful && response.body() != null) {
                val profileResponse = response.body()!!
                Gson().toJson(profileResponse.user).let { tokenManager.saveUser(it) }
                Result.success(profileResponse)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getProfileReviews(): Result<List<ReviewResponse>> {
        return try {
            val response = apiService.getProfileReviews()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get profile reviews"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getProfileActivity(): Result<ProfileActivityResponse> {
        return try {
            val response = apiService.getProfileActivity()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get profile activity"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

