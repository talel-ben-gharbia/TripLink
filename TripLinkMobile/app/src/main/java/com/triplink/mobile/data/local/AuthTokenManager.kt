package com.triplink.mobile.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

class AuthTokenManager(private val context: Context) {
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
        private val REFRESH_TOKEN_KEY = stringPreferencesKey("refresh_token")
        private val USER_KEY = stringPreferencesKey("user_data")
    }
    
    // In-memory cache for synchronous access (used by OkHttp interceptor)
    @Volatile
    private var cachedToken: String? = null
    
    val tokenFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        val token = preferences[TOKEN_KEY]
        cachedToken = token
        token
    }
    
    init {
        // Load token on init for immediate access
        runBlocking {
            cachedToken = context.dataStore.data.first()[TOKEN_KEY]
        }
    }
    
    suspend fun saveToken(token: String) {
        cachedToken = token
        context.dataStore.edit { preferences ->
            preferences[TOKEN_KEY] = token
        }
    }
    
    suspend fun saveRefreshToken(refreshToken: String) {
        context.dataStore.edit { preferences ->
            preferences[REFRESH_TOKEN_KEY] = refreshToken
        }
    }
    
    suspend fun saveUser(userJson: String) {
        context.dataStore.edit { preferences ->
            preferences[USER_KEY] = userJson
        }
    }
    
    // Synchronous access for OkHttp interceptor
    fun getTokenSync(): String? = cachedToken
    
    suspend fun getToken(): String? {
        return context.dataStore.data.first()[TOKEN_KEY].also {
            cachedToken = it
        }
    }
    
    suspend fun getRefreshToken(): String? {
        return context.dataStore.data.first()[REFRESH_TOKEN_KEY]
    }
    
    suspend fun clearToken() {
        cachedToken = null
        context.dataStore.edit { preferences ->
            preferences.remove(TOKEN_KEY)
            preferences.remove(REFRESH_TOKEN_KEY)
            preferences.remove(USER_KEY)
        }
    }
    
    suspend fun getUserJson(): String? {
        return context.dataStore.data.first()[USER_KEY]
    }
}

