package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

data class TrustIndicator(
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val title: String,
    val description: String,
    val color: Color
)

@Composable
fun TrustIndicators(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Why Choose TripLink?",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 32.dp)
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.Top
        ) {
            TrustIndicatorItem(
                indicator = TrustIndicator(
                    icon = Icons.Default.CheckCircle,
                    title = "Verified Destinations",
                    description = "All destinations are verified and trusted",
                    color = Color(0xFF4CAF50)
                ),
                modifier = Modifier.weight(1f)
            )
            
            TrustIndicatorItem(
                indicator = TrustIndicator(
                    icon = Icons.Default.Lock,
                    title = "Secure Payments",
                    description = "Your payments are encrypted and secure",
                    color = Color(0xFF2196F3)
                ),
                modifier = Modifier.weight(1f)
            )
            
            TrustIndicatorItem(
                indicator = TrustIndicator(
                    icon = Icons.Default.Info,
                    title = "24/7 Support",
                    description = "Get help anytime you need it",
                    color = Color(0xFFFF9800)
                ),
                modifier = Modifier.weight(1f)
            )
            
            TrustIndicatorItem(
                indicator = TrustIndicator(
                    icon = Icons.Default.Star,
                    title = "Best Prices",
                    description = "Competitive pricing guaranteed",
                    color = Color(0xFF9C27B0)
                ),
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun TrustIndicatorItem(
    indicator: TrustIndicator,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .padding(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .background(
                    color = indicator.color.copy(alpha = 0.1f),
                    shape = androidx.compose.foundation.shape.CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = indicator.icon,
                contentDescription = indicator.title,
                tint = indicator.color,
                modifier = Modifier.size(32.dp)
            )
        }
        
        Text(
            text = indicator.title,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.SemiBold,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        
        Text(
            text = indicator.description,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}

