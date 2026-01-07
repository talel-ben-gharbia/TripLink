package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.triplink.mobile.data.model.ReviewResponse
import com.triplink.mobile.data.model.UserData
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.viewmodel.ReviewViewModel
import com.triplink.mobile.ui.viewmodel.ViewModelFactory
import com.triplink.mobile.ui.theme.Purple600
import com.triplink.mobile.ui.utils.TextUtils
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun ReviewSection(
    destinationId: Int,
    currentUser: UserData? = null,
    modifier: Modifier = Modifier
) {
    val appContainer = LocalAppContainer.current
    val reviewRepository = appContainer.reviewRepository
    
    val viewModel: ReviewViewModel = viewModel(
        factory = remember(destinationId) {
            object : androidx.lifecycle.ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
                    return ReviewViewModel(reviewRepository, destinationId) as T
                }
            }
        }
    )
    
    val uiState by viewModel.uiState.collectAsState()
    
    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        // Header with stats (matching frontend exactly)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Reviews & Ratings",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                val stats = uiState.stats
                if (stats != null) {
                    Row(
                        modifier = Modifier.padding(top = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            repeat(5) { index ->
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = null,
                                    tint = if (index < Math.round(stats.averageRating ?: 0.0).toInt()) {
                                        Color(0xFFFFB300)
                                    } else {
                                        Color.Gray.copy(alpha = 0.3f)
                                    },
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Text(
                                text = String.format("%.1f", stats.averageRating ?: 0.0),
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                                modifier = Modifier.padding(start = 8.dp)
                            )
                        }
                        Text(
                            text = "(${stats.reviewCount} ${if (stats.reviewCount == 1) "review" else "reviews"})",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )
                    }
                }
            }
            
            // Write review button (matching frontend)
            if (currentUser != null && uiState.userReview == null && !uiState.showForm) {
                Button(
                    onClick = { viewModel.showForm(true) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Purple600
                    ),
                    modifier = Modifier.padding(start = 16.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Write a Review")
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Review Form
        if (uiState.showForm) {
            ReviewForm(
                viewModel = viewModel,
                editingReview = uiState.editingReview,
                onCancel = { viewModel.showForm(false) }
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        // Reviews List
        when {
            uiState.isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            uiState.reviews.isEmpty() -> {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = null,
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "No reviews yet. Be the first to review this destination!",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                        if (currentUser != null && uiState.userReview == null) {
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { viewModel.showForm(true) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Purple600
                                )
                            ) {
                                Text("Write the First Review")
                            }
                        }
                    }
                }
            }
            else -> {
                Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    uiState.reviews.forEach { review ->
                        ReviewCard(
                            review = review,
                            currentUser = currentUser,
                            onEdit = { viewModel.startEdit(review) },
                            onDelete = { viewModel.deleteReview(review.id) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ReviewForm(
    viewModel: ReviewViewModel,
    editingReview: ReviewResponse?,
    onCancel: () -> Unit
) {
    var rating by remember { mutableIntStateOf(editingReview?.rating ?: 0) }
    var comment by remember { mutableStateOf(editingReview?.comment ?: "") }
    var isPublic by remember { mutableStateOf(editingReview?.isPublic != false) }
    
    LaunchedEffect(editingReview) {
        rating = editingReview?.rating ?: 0
        comment = editingReview?.comment ?: ""
        isPublic = editingReview?.isPublic != false
    }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = if (editingReview != null) "Edit Your Review" else "Write a Review",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            // Rating selector
            Text(
                text = "Rating",
                style = MaterialTheme.typography.labelMedium
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                repeat(5) { index ->
                    IconButton(
                        onClick = { rating = index + 1 },
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = if (index < rating) Color(0xFFFFD700) else Color.Gray.copy(alpha = 0.3f),
                            modifier = Modifier.size(32.dp)
                        )
                    }
                }
            }
            
            // Comment input
            OutlinedTextField(
                value = comment,
                onValueChange = { comment = it },
                label = { Text("Comment (Optional)") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 4,
                maxLines = 8
            )
            
            // Public/Private toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = isPublic,
                    onCheckedChange = { isPublic = it }
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isPublic) "Make this review public" else "Keep this review private",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            
            // Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = {
                        viewModel.submitReview(rating, comment.ifEmpty { null }, isPublic)
                    },
                    modifier = Modifier.weight(1f),
                    enabled = rating > 0
                ) {
                    Text(if (editingReview != null) "Update Review" else "Submit Review")
                }
                OutlinedButton(
                    onClick = onCancel,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Cancel")
                }
            }
        }
    }
}

@Composable
fun ReviewCard(
    review: ReviewResponse,
    currentUser: UserData?,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Avatar
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(
                                color = MaterialTheme.colorScheme.primaryContainer,
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                    
                    Column {
                        Text(
                            text = TextUtils.formatUserName(
                                review.user?.firstName,
                                review.user?.lastName
                            ),
                            style = MaterialTheme.typography.bodyLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = try {
                                val createdAt = review.createdAt
                                if (createdAt != null && createdAt.isNotEmpty()) {
                                    // Try ISO format first
                                    try {
                                        val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                                            .parse(createdAt) ?: Date()
                                        SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(date)
                                    } catch (e: Exception) {
                                        // Try ISO format with timezone
                                        try {
                                            val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                                                .parse(createdAt) ?: Date()
                                            SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(date)
                                        } catch (e2: Exception) {
                                            // Fallback to original string
                                            createdAt
                                        }
                                    }
                                } else {
                                    "Unknown date"
                                }
                            } catch (e: Exception) {
                                review.createdAt ?: "Unknown date"
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )
                    }
                }
                
                // Rating and actions
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        repeat(5) { index ->
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = if (index < review.rating) Color(0xFFFFD700) else Color.Gray.copy(alpha = 0.3f),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                    
                    if (currentUser != null && review.user?.id == currentUser.id) {
                        IconButton(onClick = onEdit) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = "Edit",
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        IconButton(onClick = onDelete) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "Delete",
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
            
            if (review.comment != null && review.comment.isNotEmpty()) {
                Text(
                    text = review.comment,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            
            if (review.isPublic == false && currentUser?.id == review.user?.id) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Private",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

