package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.BookingResponse
import com.triplink.mobile.data.repository.BookingRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class MyBookingsUiState(
    val isLoading: Boolean = false,
    val bookings: List<BookingResponse> = emptyList(),
    val error: String? = null,
    val selectedFilter: BookingFilter = BookingFilter.ALL
)

enum class BookingFilter {
    ALL, PENDING, CONFIRMED, COMPLETED, CANCELLED
}

class MyBookingsViewModel(
    private val bookingRepository: BookingRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(MyBookingsUiState())
    val uiState: StateFlow<MyBookingsUiState> = _uiState.asStateFlow()
    
    init {
        loadBookings()
    }
    
    fun loadBookings() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            val result = bookingRepository.getMyBookings()
            
            result.onSuccess { bookings ->
                _uiState.value = _uiState.value.copy(
                    bookings = bookings,
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
    }
    
    fun setFilter(filter: BookingFilter) {
        _uiState.value = _uiState.value.copy(selectedFilter = filter)
    }
    
    fun getFilteredBookings(): List<BookingResponse> {
        return when (_uiState.value.selectedFilter) {
            BookingFilter.ALL -> _uiState.value.bookings
            BookingFilter.PENDING -> _uiState.value.bookings.filter { it.status == "PENDING" }
            BookingFilter.CONFIRMED -> _uiState.value.bookings.filter { it.status == "CONFIRMED" }
            BookingFilter.COMPLETED -> _uiState.value.bookings.filter { it.status == "COMPLETED" }
            BookingFilter.CANCELLED -> _uiState.value.bookings.filter { it.status == "CANCELLED" }
        }
    }
    
    fun cancelBooking(bookingId: Int, reason: String) {
        viewModelScope.launch {
            val result = bookingRepository.cancelBooking(bookingId, reason)
            result.onSuccess {
                loadBookings()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to cancel booking"
                )
            }
        }
    }
    
    fun updateBooking(
        bookingId: Int,
        checkInDate: String? = null,
        checkOutDate: String? = null,
        numberOfGuests: Int? = null,
        contactEmail: String? = null,
        contactPhone: String? = null,
        specialRequests: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val request = com.triplink.mobile.data.model.UpdateBookingRequest(
                checkInDate = checkInDate,
                checkOutDate = checkOutDate,
                numberOfGuests = numberOfGuests,
                contactEmail = contactEmail,
                contactPhone = contactPhone,
                specialRequests = specialRequests
            )
            val result = bookingRepository.updateBooking(bookingId, request)
            result.onSuccess {
                loadBookings()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to update booking",
                    isLoading = false
                )
            }
        }
    }
    
    fun completeBooking(bookingId: Int) {
        viewModelScope.launch {
            val result = bookingRepository.completeBooking(bookingId)
            result.onSuccess {
                loadBookings()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message ?: "Failed to complete booking"
                )
            }
        }
    }
    
    fun createCheckoutSession(bookingId: Int): kotlinx.coroutines.flow.Flow<Result<com.triplink.mobile.data.model.CheckoutSessionResponse>> {
        return kotlinx.coroutines.flow.flow {
            val result = bookingRepository.createCheckoutSession(bookingId)
            emit(result)
        }
    }
    
    fun refresh() {
        loadBookings()
    }
}

