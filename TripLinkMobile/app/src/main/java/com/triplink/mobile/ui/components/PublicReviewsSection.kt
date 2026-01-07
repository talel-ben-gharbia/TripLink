package com.triplink.mobile.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.triplink.mobile.data.model.ReviewResponse
import com.triplink.mobile.data.repository.ReviewRepository
import com.triplink.mobile.ui.theme.Purple600
import com.triplink.mobile.ui.utils.LocalWindowSize
import com.triplink.mobile.ui.utils.TextUtils
import com.triplink.mobile.ui.utils.horizontalPadding
import kotlinx.coroutines.launch

@Composable
fun PublicReviewsSection(
    limit: Int = 100,
    navController: NavController,
    reviewRepository: ReviewRepository? = null
) {
    var reviews by remember { mutableStateOf<List<ReviewResponse>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val windowSize = LocalWindowSize.current
    val padding = horizontalPadding(windowSize)
    
    LaunchedEffect(limit) {
        loading = true
        error = null
        scope.launch {
            if (reviewRepository != null) {
                val result = reviewRepository.getPublicReviews()
                result.onSuccess {
                    reviews = it.take(limit)
                    loading = false
                }.onFailure {
                    error = it.message
                    reviews = emptyList()
                    loading = false
                }
            } else {
                loading = false
            }
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(padding)
            .padding(vertical = 32.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Comment,
                contentDescription = null,
                tint = Purple600,
                modifier = Modifier.size(32.dp)
            )
            Text(
                text = "Reviews",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = "What travelers are saying about their experiences",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        if (reviews.isNotEmpty()) {
            Spacer(modifier = Modifier.height(8.dp))
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Purple600.copy(alpha = 0.1f)
            ) {
                Text(
                    text = "${reviews.size} ${if (reviews.size == 1) "Review" else "Reviews"}",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Purple600,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        if (loading) {
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (error != null) {
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Error loading reviews: $error",
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                    Button(onClick = {
                        loading = true
                        error = null
                    }) {
                        Text("Retry")
                    }
                }
            }
        } else if (reviews.isEmpty()) {
            Card {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        Icons.Default.Comment,
                        null,
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "No reviews yet",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = "Be the first to share your experience!",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(reviews) { review ->
                    ReviewCard(
                        review = review,
                        onClick = {
                            // Navigate to destination details
                            navController.navigate("destinations/${review.destinationId}")
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun ReviewCard(
    review: ReviewResponse,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(300.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // User info and rating
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Avatar
                    Surface(
                        shape = CircleShape,
                        color = Purple600.copy(alpha = 0.2f),
                        modifier = Modifier.size(40.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = review.user?.firstName?.firstOrNull()?.uppercase() ?: "U",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Purple600
                            )
                        }
                    }
                    Column {
                        Text(
                            text = TextUtils.formatUserName(
                                review.user?.firstName,
                                review.user?.lastName,
                                review.user?.email
                            ),
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold
                        )
                        review.user?.email?.takeIf { it.isNotEmpty() }?.let { email ->
                            Text(
                                text = email,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
                
                // Rating
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        Icons.Default.Star,
                        null,
                        tint = Color(0xFFFFD700),
                        modifier = Modifier.size(20.dp)
                    )
                    Text(
                        text = "${review.rating}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            // Comment
            if (review.comment != null && review.comment.isNotEmpty()) {
                Text(
                    text = review.comment,
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = 3
                )
            }
            
            // Destination link
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(
                    Icons.Default.LocationOn,
                    null,
                    modifier = Modifier.size(16.dp),
                    tint = Purple600
                )
                Text(
                    text = "View destination",
                    style = MaterialTheme.typography.labelSmall,
                    color = Purple600,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

