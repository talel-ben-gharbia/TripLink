package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.*
import com.triplink.mobile.data.repository.AdminRepository
import com.triplink.mobile.data.repository.BookingRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class AdminTab {
    OVERVIEW, USERS, DESTINATIONS, COLLECTIONS, BOOKINGS, AGENTS, AGENT_APPLICATIONS
}

data class AdminDashboardUiState(
    val isLoading: Boolean = false,
    val activeTab: AdminTab = AdminTab.OVERVIEW,
    val error: String? = null,
    
    // Stats
    val stats: AdminStatsResponse? = null,
    
    // Users
    val users: List<UserData> = emptyList(),
    val searchTerm: String = "",
    val filterStatus: String = "ALL",
    
    // Destinations
    val destinations: List<DestinationResponse> = emptyList(),
    
    // Collections
    val collections: List<CollectionResponse> = emptyList(),
    
    // Bookings
    val bookings: List<BookingResponse> = emptyList(),
    val bookingStats: AdminBookingStatsResponse? = null,
    val loadingBookings: Boolean = false,
    
    // Agents
    val agents: List<UserData> = emptyList(),
    val loadingAgents: Boolean = false,
    
    // Agent Applications
    val agentApplications: List<AgentApplicationResponse> = emptyList(),
    val loadingApplications: Boolean = false
)

class AdminDashboardViewModel(
    private val adminRepository: AdminRepository,
    private val bookingRepository: BookingRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(AdminDashboardUiState())
    val uiState: StateFlow<AdminDashboardUiState> = _uiState.asStateFlow()
    
    init {
        loadDashboard()
    }
    
    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            when (_uiState.value.activeTab) {
                AdminTab.OVERVIEW -> {
                    val statsResult = adminRepository.getAdminStats()
                    val usersResult = adminRepository.getUsers()
                    val destinationsResult = adminRepository.getAdminDestinations()
                    val collectionsResult = adminRepository.getAdminCollections()
                    
                    statsResult.onSuccess { stats ->
                        usersResult.onSuccess { users ->
                            destinationsResult.onSuccess { destinations ->
                                collectionsResult.onSuccess { collections ->
                                    _uiState.value = _uiState.value.copy(
                                        stats = stats,
                                        users = users,
                                        destinations = destinations,
                                        collections = collections,
                                        isLoading = false,
                                        error = null
                                    )
                                }.onFailure {
                                    _uiState.value = _uiState.value.copy(
                                        isLoading = false,
                                        error = it.message
                                    )
                                }
                            }.onFailure {
                                _uiState.value = _uiState.value.copy(
                                    isLoading = false,
                                    error = it.message
                                )
                            }
                        }.onFailure {
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                error = it.message
                            )
                        }
                    }.onFailure {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = it.message
                        )
                    }
                }
                AdminTab.USERS -> {
                    val usersResult = adminRepository.getUsers()
                    usersResult.onSuccess { users ->
                        _uiState.value = _uiState.value.copy(
                            users = users,
                            isLoading = false,
                            error = null
                        )
                    }.onFailure {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = it.message
                        )
                    }
                }
                AdminTab.DESTINATIONS -> {
                    val destinationsResult = adminRepository.getAdminDestinations()
                    destinationsResult.onSuccess { destinations ->
                        _uiState.value = _uiState.value.copy(
                            destinations = destinations,
                            isLoading = false,
                            error = null
                        )
                    }.onFailure {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = it.message
                        )
                    }
                }
                AdminTab.COLLECTIONS -> {
                    val collectionsResult = adminRepository.getAdminCollections()
                    collectionsResult.onSuccess { collections ->
                        _uiState.value = _uiState.value.copy(
                            collections = collections,
                            isLoading = false,
                            error = null
                        )
                    }.onFailure {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = it.message
                        )
                    }
                }
                AdminTab.BOOKINGS -> {
                    loadBookings()
                }
                AdminTab.AGENTS -> {
                    loadAgents()
                }
                AdminTab.AGENT_APPLICATIONS -> {
                    loadAgentApplications()
                }
            }
        }
    }
    
    fun setActiveTab(tab: AdminTab) {
        _uiState.value = _uiState.value.copy(activeTab = tab)
        loadDashboard()
    }
    
    fun setSearchTerm(term: String) {
        _uiState.value = _uiState.value.copy(searchTerm = term)
    }
    
    fun setFilterStatus(status: String) {
        _uiState.value = _uiState.value.copy(filterStatus = status)
    }
    
    fun loadBookings() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(loadingBookings = true)
            val bookingsResult = adminRepository.getAdminBookings()
            val statsResult = adminRepository.getAdminBookingStats()
            
            bookingsResult.onSuccess { bookings ->
                statsResult.onSuccess { stats ->
                    _uiState.value = _uiState.value.copy(
                        bookings = bookings,
                        bookingStats = stats,
                        loadingBookings = false,
                        error = null
                    )
                }.onFailure {
                    _uiState.value = _uiState.value.copy(
                        loadingBookings = false,
                        error = it.message
                    )
                }
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    loadingBookings = false,
                    error = it.message
                )
            }
        }
    }
    
    fun loadAgents() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(loadingAgents = true)
            val result = adminRepository.getAdminAgents()
            result.onSuccess { agents ->
                _uiState.value = _uiState.value.copy(
                    agents = agents,
                    loadingAgents = false,
                    error = null
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    loadingAgents = false,
                    error = it.message
                )
            }
        }
    }
    
    fun loadAgentApplications() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(loadingApplications = true)
            val result = adminRepository.getAdminAgentApplications()
            result.onSuccess { applications ->
                _uiState.value = _uiState.value.copy(
                    agentApplications = applications,
                    loadingApplications = false,
                    error = null
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(
                    loadingApplications = false,
                    error = it.message
                )
            }
        }
    }
    
    fun updateUserStatus(userId: Int, status: String) {
        viewModelScope.launch {
            val result = adminRepository.updateUserStatus(userId, status)
            result.onSuccess {
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun deleteUser(userId: Int) {
        viewModelScope.launch {
            val result = adminRepository.deleteUser(userId)
            result.onSuccess {
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun suspendUser(userId: Int) {
        viewModelScope.launch {
            val result = adminRepository.suspendUser(userId)
            result.onSuccess {
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun activateUser(userId: Int) {
        viewModelScope.launch {
            val result = adminRepository.activateUser(userId)
            result.onSuccess {
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun banUser(userId: Int) {
        viewModelScope.launch {
            val result = adminRepository.banUser(userId)
            result.onSuccess {
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun removeAgentRole(agentId: Int) {
        viewModelScope.launch {
            val result = adminRepository.removeAgentRole(agentId)
            result.onSuccess {
                loadAgents()
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun approveAgentApplication(applicationId: Int, adminNotes: String? = null) {
        viewModelScope.launch {
            val result = adminRepository.approveAgentApplication(applicationId, adminNotes)
            result.onSuccess {
                loadAgentApplications()
                loadAgents()
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun rejectAgentApplication(applicationId: Int, reason: String? = null) {
        viewModelScope.launch {
            val result = adminRepository.rejectAgentApplication(applicationId, reason)
            result.onSuccess {
                loadAgentApplications()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun updateBooking(bookingId: Int, checkInDate: String? = null, checkOutDate: String? = null, numberOfGuests: Int? = null) {
        viewModelScope.launch {
            val request = UpdateBookingRequest(
                checkInDate = checkInDate,
                checkOutDate = checkOutDate,
                numberOfGuests = numberOfGuests
            )
            val result = bookingRepository.updateBooking(bookingId, request)
            result.onSuccess {
                loadBookings()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun completeBooking(bookingId: Int) {
        viewModelScope.launch {
            val result = bookingRepository.completeBooking(bookingId)
            result.onSuccess {
                loadBookings()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun featureDestination(id: Int) {
        viewModelScope.launch {
            val result = adminRepository.featureDestination(id)
            result.onSuccess {
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun unfeatureDestination(id: Int) {
        viewModelScope.launch {
            val result = adminRepository.unfeatureDestination(id)
            result.onSuccess {
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun pinDestination(id: Int) {
        viewModelScope.launch {
            val result = adminRepository.pinDestination(id)
            result.onSuccess {
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun unpinDestination(id: Int) {
        viewModelScope.launch {
            val result = adminRepository.unpinDestination(id)
            result.onSuccess {
                loadDashboard()
            }.onFailure {
                _uiState.value = _uiState.value.copy(error = it.message)
            }
        }
    }
    
    fun getFilteredUsers(): List<UserData> {
        val users = _uiState.value.users
        val search = _uiState.value.searchTerm.lowercase()
        val filter = _uiState.value.filterStatus
        
        return users.filter { user ->
            val matchesSearch = user.email.lowercase().contains(search) ||
                    user.firstName?.lowercase()?.contains(search) == true ||
                    user.lastName?.lowercase()?.contains(search) == true
            val matchesFilter = filter == "ALL" || user.status == filter
            matchesSearch && matchesFilter
        }
    }
    
    fun refresh() {
        loadDashboard()
    }
}
