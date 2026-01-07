package com.triplink.mobile.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp

@Composable
fun LoadingSkeleton(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(8.dp)
) {
    val infiniteTransition = rememberInfiniteTransition(label = "skeleton")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.7f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )
    
    Box(
        modifier = modifier
            .background(
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = alpha),
                shape = shape
            )
    )
}

@Composable
fun BookingCardSkeleton() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    LoadingSkeleton(
                        modifier = Modifier
                            .width(200.dp)
                            .height(24.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    LoadingSkeleton(
                        modifier = Modifier
                            .width(120.dp)
                            .height(16.dp)
                    )
                }
                LoadingSkeleton(
                    modifier = Modifier
                        .width(80.dp)
                        .height(32.dp)
                )
            }
            
            LoadingSkeleton(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(16.dp)
            )
            LoadingSkeleton(
                modifier = Modifier
                    .fillMaxWidth(0.83f)
                    .height(16.dp)
            )
            LoadingSkeleton(
                modifier = Modifier
                    .fillMaxWidth(0.67f)
                    .height(16.dp)
            )
            
            Divider()
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                LoadingSkeleton(
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                )
                LoadingSkeleton(
                    modifier = Modifier
                        .weight(1f)
                        .height(40.dp)
                )
            }
        }
    }
}

@Composable
fun DestinationCardSkeleton() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column {
            LoadingSkeleton(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(192.dp)
            )
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                LoadingSkeleton(
                    modifier = Modifier
                        .fillMaxWidth(0.75f)
                        .height(24.dp)
                )
                LoadingSkeleton(
                    modifier = Modifier
                        .fillMaxWidth(0.5f)
                        .height(16.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                LoadingSkeleton(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(16.dp)
                )
                LoadingSkeleton(
                    modifier = Modifier
                        .fillMaxWidth(0.83f)
                        .height(16.dp)
                )
            }
        }
    }
}

@Composable
fun StatsCardSkeleton() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            LoadingSkeleton(
                modifier = Modifier
                    .width(64.dp)
                    .height(24.dp)
            )
            LoadingSkeleton(
                modifier = Modifier
                    .width(96.dp)
                    .height(32.dp)
            )
            LoadingSkeleton(
                modifier = Modifier
                    .width(128.dp)
                    .height(16.dp)
            )
        }
    }
}

@Composable
fun TableRowSkeleton() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        LoadingSkeleton(
            modifier = Modifier
                .weight(1f)
                .height(16.dp)
        )
        LoadingSkeleton(
            modifier = Modifier
                .weight(1.5f)
                .height(16.dp)
        )
        LoadingSkeleton(
            modifier = Modifier
                .weight(1f)
                .height(16.dp)
        )
        LoadingSkeleton(
            modifier = Modifier
                .weight(0.8f)
                .height(24.dp)
        )
    }
}

