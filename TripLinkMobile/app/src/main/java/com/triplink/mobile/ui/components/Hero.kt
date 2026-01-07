package com.triplink.mobile.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import com.triplink.mobile.ui.utils.LocalWindowSize
import com.triplink.mobile.ui.utils.heroHeight
import com.triplink.mobile.ui.utils.fontSizeScale
import com.triplink.mobile.ui.utils.horizontalPadding
import kotlinx.coroutines.delay

val heroImages = listOf(
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1516997125298-4e3b7f0036d2?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1600&q=80"
)

val heroPhrases = listOf(
    "Beach escapes tailored to you",
    "City adventures with smart tips",
    "Mountain trails and nature paths",
    "Luxury stays made simple",
    "Cultural gems across the globe"
)

@Composable
fun Hero(
    showCTA: Boolean = true,
    onStart: () -> Unit = {}
) {
    val windowSize = LocalWindowSize.current
    var currentImageIndex by remember { mutableIntStateOf(0) }
    var currentPhraseIndex by remember { mutableIntStateOf(0) }
    var paused by remember { mutableStateOf(false) }
    val heroHeightValue = heroHeight(windowSize)
    val fontSizeScaleValue = fontSizeScale(windowSize)
    val padding = horizontalPadding(windowSize)

    // Auto-rotate images every 6 seconds
    LaunchedEffect(currentImageIndex, paused) {
        if (!paused) {
            delay(6000)
            currentImageIndex = (currentImageIndex + 1) % heroImages.size
        }
    }

    // Auto-rotate phrases every 3 seconds
    LaunchedEffect(currentPhraseIndex) {
        delay(3000)
        currentPhraseIndex = (currentPhraseIndex + 1) % heroPhrases.size
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(heroHeightValue)
            .clickable { paused = !paused }
    ) {
        // Background images
        heroImages.forEachIndexed { index, imageUrl ->
            AsyncImage(
                model = imageUrl,
                contentDescription = null,
                modifier = Modifier
                    .fillMaxSize()
                    .then(
                        if (index == currentImageIndex)
                            Modifier
                        else
                            Modifier.alpha(0.0f)
                    ),
                contentScale = ContentScale.Crop
            )
        }

        // Gradient overlays
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color.Black.copy(alpha = 0.5f),
                            Color.Black.copy(alpha = 0.3f),
                            Color.Transparent
                        )
                    )
                )
        )

        // Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Badge
            Surface(
                modifier = Modifier.padding(bottom = 16.dp),
                shape = RoundedCornerShape(24.dp),
                color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = null,
                        tint = Purple600,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Plan your next trip • Smart planning",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Main heading
            Text(
                text = "Your Journey, Intelligently Crafted",
                style = MaterialTheme.typography.displayLarge.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = (36f * fontSizeScaleValue).sp
                ),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            // Rotating phrase
            Text(
                text = heroPhrases[currentPhraseIndex],
                style = MaterialTheme.typography.titleLarge.copy(
                    fontSize = (20f * fontSizeScaleValue).sp
                ),
                color = Color.White,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(bottom = 24.dp)
            )

            // CTA Button
            if (showCTA) {
                Button(
                    onClick = onStart,
                    modifier = Modifier
                        .padding(bottom = 16.dp)
                        .height(56.dp)
                        .fillMaxWidth(0.8f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.Transparent
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                brush = Brush.horizontalGradient(
                                    colors = listOf(Purple600, Blue500)
                                ),
                                shape = RoundedCornerShape(16.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = Color.White
                            )
                            Text(
                                text = "Start Your AI Journey",
                                style = MaterialTheme.typography.titleMedium,
                                color = Color.White,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }

            // Navigation buttons
            Row(
                modifier = Modifier.padding(top = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                IconButton(
                    onClick = {
                        currentImageIndex = (currentImageIndex - 1 + heroImages.size) % heroImages.size
                    },
                    modifier = Modifier
                        .size(48.dp)
                        .background(
                            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Previous",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }

                // Image indicators
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.align(Alignment.CenterVertically)
                ) {
                    heroImages.forEachIndexed { index, _ ->
                        Box(
                            modifier = Modifier
                                .size(if (index == currentImageIndex) 24.dp else 8.dp)
                                .clip(CircleShape)
                                .background(
                                    if (index == currentImageIndex)
                                        Purple600
                                    else
                                        Color.White.copy(alpha = 0.7f)
                                )
                        )
                    }
                }

                IconButton(
                    onClick = {
                        currentImageIndex = (currentImageIndex + 1) % heroImages.size
                    },
                    modifier = Modifier
                        .size(48.dp)
                        .background(
                            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = "Next",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}

