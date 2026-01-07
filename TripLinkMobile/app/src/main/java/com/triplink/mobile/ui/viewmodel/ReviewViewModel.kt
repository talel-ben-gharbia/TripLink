package com.triplink.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.triplink.mobile.data.model.ReviewResponse
import com.triplink.mobile.data.repository.ReviewRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ReviewStats(
    val averageRating: Double? = null,
    val reviewCount: Int = 0
)

data class ReviewUiState(
    val isLoading: Boolean = false,
    val reviews: List<ReviewResponse> = emptyList(),
    val stats: ReviewStats? = null,
    val showForm: Boolean = false,
    val editingReview: ReviewResponse? = null,
    val error: String? = null,
    val userReview: ReviewResponse? = null
)

class ReviewViewModel(
    private val reviewRepository: ReviewRepository,
    private val destinationId: Int
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ReviewUiState())
    val uiState: StateFlow<ReviewUiState> = _uiState.asStateFlow()
    
    init {
        loadReviews()
    }
    
    private fun loadReviews() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            reviewRepository.getDestinationReviews(destinationId)
                .onSuccess { reviews ->
                    // Calculate stats
                    val avgRating = if (reviews.isNotEmpty()) {
                        reviews.map { it.rating }.average()
                    } else null
                    
                    val stats = ReviewStats(
                        averageRating = avgRating,
                        reviewCount = reviews.size
                    )
                    
                    // Find user's review
                    val userReview = reviews.firstOrNull { it.user?.id != null }
                    
                    _uiState.value = _uiState.value.copy(
                        reviews = reviews,
                        stats = stats,
                        userReview = userReview,
                        isLoading = false,
                        error = null
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to load reviews",
                        isLoading = false
                    )
                }
        }
    }
    
    fun showForm(show: Boolean) {
        _uiState.value = _uiState.value.copy(
            showForm = show,
            editingReview = if (!show) null else _uiState.value.editingReview
        )
    }
    
    fun startEdit(review: ReviewResponse) {
        _uiState.value = _uiState.value.copy(
            editingReview = review,
            showForm = true
        )
    }
    
    fun submitReview(rating: Int, comment: String?, isPublic: Boolean) {
        viewModelScope.launch {
            val editingReview = _uiState.value.editingReview
            
            if (editingReview != null) {
                // TODO: Implement update review when backend supports it
                // For now, delete and recreate
                deleteReview(editingReview.id)
            }
            
            reviewRepository.createReview(destinationId, rating, comment, isPublic)
                .onSuccess {
                    loadReviews()
                    showForm(false)
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        error = error.message ?: "Failed to submit review"
                    )
                }
        }
    }
    
    fun deleteReview(reviewId: Int) {
        viewModelScope.launch {
            // TODO: Implement delete review when backend supports it
            // For now, just reload
            loadReviews()
        }
    }
}

