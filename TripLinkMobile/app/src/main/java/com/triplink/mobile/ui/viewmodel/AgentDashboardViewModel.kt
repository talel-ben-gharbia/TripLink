package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.repository.AgentRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class AgentTab {
    OVERVIEW, PENDING, MY_BOOKINGS, CLIENTS
}

data class AgentDashboardUiState(
    val isLoading: Boolean = false,
    val activeTab: AgentTab = AgentTab.OVERVIEW,
    val stats: AgentStats? = null,
    val pendingBookings: List<BookingResponse> = emptyList(),
    val myBookings: List<BookingResponse> = emptyList(),
    val recentBookings: List<BookingResponse> = emptyList(),
    val unreadMessages: Int = 0,
    val error: String? = null
)

class AgentDashboardViewModel(
    private val agentRepository: AgentRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(AgentDashboardUiState())
    val uiState: StateFlow<AgentDashboardUiState> = _uiState.asStateFlow()
    
    init {
        loadDashboard()
    }
    
    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            when (_uiState.value.activeTab) {
                AgentTab.OVERVIEW -> {
                    val result = agentRepository.getAgentDashboard()
                    result.onSuccess { dashboard ->
                        _uiState.value = _uiState.value.copy(
                            stats = dashboard.stats,
                            pendingBookings = dashboard.pendingBookings,
                            recentBookings = dashboard.recentBookings,
                            unreadMessages = dashboard.unreadMessages,
                            isLoading = false,
                            error = null
                        )
                    }.onFailure { error ->
                        _uiState.value = _uiState.value.copy(
                            error = error.message ?: "Failed to load dashboard",
                            isLoading = false
                        )
                    }
                }
                AgentTab.PENDING -> {
                    val result = agentRepository.getPendingBookings()
                    result.onSuccess { bookings ->
                        _uiState.value = _uiState.value.copy(
                            pendingBookings = bookings,
                            isLoading = false,
                            error = null
                        )
                    }.onFailure { error ->
                        _uiState.value = _uiState.value.copy(
                            error = error.message ?: "Failed to load pending bookings",
                            isLoading = false
                        )
                    }
                }
                AgentTab.MY_BOOKINGS -> {
                    val result = agentRepository.getAgentBookings()
                    result.onSuccess { bookings ->
                        _uiState.value = _uiState.value.copy(
                            myBookings = bookings,
                            isLoading = false,
                            error = null
                        )
                    }.onFailure { error ->
                        _uiState.value = _uiState.value.copy(
                            error = error.message ?: "Failed to load bookings",
                            isLoading = false
                        )
                    }
                }
                AgentTab.CLIENTS -> {
                    // Clients tab - would need separate API call
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }
        }
    }
    
    fun setActiveTab(tab: AgentTab) {
        _uiState.value = _uiState.value.copy(activeTab = tab)
        loadDashboard()
    }
    
    fun assignBooking(bookingId: Int) {
        viewModelScope.launch {
            val result = agentRepository.assignBooking(bookingId)
            result.onSuccess {
                loadDashboard()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to assign booking"
                )
            }
        }
    }
    
    fun confirmBooking(bookingId: Int) {
        viewModelScope.launch {
            val result = agentRepository.confirmAgentBooking(bookingId)
            result.onSuccess {
                loadDashboard()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to confirm booking"
                )
            }
        }
    }
    
    fun refresh() {
        loadDashboard()
    }
}

