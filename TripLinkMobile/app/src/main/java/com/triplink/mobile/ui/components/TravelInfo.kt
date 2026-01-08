package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.triplink.mobile.data.model.DestinationResponse
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun TravelInfo(
    destination: DestinationResponse,
    modifier: Modifier = Modifier
) {
    var loading by remember { mutableStateOf(true) }
    var currency by remember { mutableStateOf<CurrencyInfo?>(null) }
    var timezone by remember { mutableStateOf<String?>(null) }
    
    LaunchedEffect(destination.country ?: "") {
        loading = true
        // Load currency and timezone info
        // In a real app, you'd fetch this from an API
        // For now, we'll use placeholder data
        currency = CurrencyInfo(
            code = "USD",
            name = "US Dollar",
            symbol = "$"
        )
        timezone = "UTC"
        loading = false
    }
    
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Travel Information",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            if (loading) {
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else {
                // Currency Info
                currency?.let { curr ->
                    TravelInfoCard(
                        title = "Currency",
                        icon = Icons.Default.AccountBalance,
                        iconTint = Color(0xFF4CAF50),
                        backgroundColor = Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFFE8F5E9),
                                Color(0xFFC8E6C9)
                            )
                        )
                    ) {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            InfoRow("Currency", curr.name)
                            InfoRow("Code", curr.code)
                            InfoRow("Symbol", curr.symbol)
                        }
                    }
                }
                
                // Timezone Info
                timezone?.let { tz ->
                    TravelInfoCard(
                        title = "Timezone",
                        icon = Icons.Default.Public,
                        iconTint = Color(0xFF7C3AED),
                        backgroundColor = Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFFF3E5F5),
                                Color(0xFFE1BEE7)
                            )
                        )
                    ) {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            InfoRow("Timezone", tz)
                            InfoRow("Current Time", getCurrentTime(tz))
                        }
                    }
                }
                
                // Visa Information
                TravelInfoCard(
                    title = "Visa Information",
                    icon = Icons.Default.Warning,
                    iconTint = Color(0xFFFFB300),
                    backgroundColor = Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFFFFF9C4),
                            Color(0xFFFFF59D)
                        )
                    )
                ) {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        InfoRow("Required", "Please check with your embassy")
                        InfoRow("Processing", "Varies by country")
                        InfoRow("Cost", "Varies by visa type")
                    }
                }
                
                // Emergency Contacts
                TravelInfoCard(
                    title = "Emergency Contacts",
                    icon = Icons.Default.Phone,
                    iconTint = Color(0xFFE53935),
                    backgroundColor = Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFFFFEBEE),
                            Color(0xFFFFCDD2)
                        )
                    )
                ) {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        InfoRow("Police", "Check local directory")
                        InfoRow("Ambulance", "Check local directory")
                        InfoRow("Fire", "Check local directory")
                        InfoRow("Embassy", "Contact your embassy")
                    }
                }
            }
            
            // Note
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
            ) {
                Text(
                    text = "Note: Travel information is provided for reference only. Please verify visa requirements, currency rates, and emergency contacts before your trip.",
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(12.dp),
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                )
            }
        }
    }
}

@Composable
fun TravelInfoCard(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: Color,
    backgroundColor: Brush,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color.Transparent
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(backgroundColor, RoundedCornerShape(12.dp))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconTint,
                        modifier = Modifier.size(20.dp)
                    )
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                content()
            }
        }
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = "$label:",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.SemiBold
        )
    }
}

private fun getCurrentTime(timezone: String): String {
    return try {
        val format = SimpleDateFormat("hh:mm:ss a", Locale.getDefault())
        format.timeZone = TimeZone.getTimeZone(timezone)
        format.format(Date())
    } catch (e: Exception) {
        timezone
    }
}

data class CurrencyInfo(
    val code: String,
    val name: String,
    val symbol: String
)

