package com.triplink.mobile.data.remote

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.triplink.mobile.data.local.AuthTokenManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {
    // Use 10.0.2.2 for Android emulator (points to host machine's localhost)
    // For physical device, use your computer's IP address (e.g., http://192.168.1.x:8000)
    private const val BASE_URL = "http://10.0.2.2:8000" // Android emulator host alias
    
    private val gson: Gson = GsonBuilder()
        .setLenient()
        .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
        .create()
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private fun createAuthInterceptor(tokenManager: AuthTokenManager): Interceptor {
        return Interceptor { chain ->
            val originalRequest = chain.request()
            val token = tokenManager.getTokenSync()
            
            val newRequest = if (token != null) {
                originalRequest.newBuilder()
                    .header("Authorization", "Bearer $token")
                    .header("Content-Type", "application/json")
                    .build()
            } else {
                originalRequest.newBuilder()
                    .header("Content-Type", "application/json")
                    .build()
            }
            
            val response = chain.proceed(newRequest)
            
            // Handle 401 - token expired
            if (response.code == 401) {
                // Clear token asynchronously (won't block)
                CoroutineScope(Dispatchers.IO).launch {
                    tokenManager.clearToken()
                }
                // Navigation to login will be handled by ViewModel
            }
            
            response
        }
    }
    
    fun createApiService(tokenManager: AuthTokenManager): ApiService {
        val client = OkHttpClient.Builder()
            .addInterceptor(createAuthInterceptor(tokenManager))
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
        
        return retrofit.create(ApiService::class.java)
    }
}

