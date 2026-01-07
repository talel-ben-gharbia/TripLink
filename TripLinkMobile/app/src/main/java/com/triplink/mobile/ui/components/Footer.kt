package com.triplink.mobile.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.triplink.mobile.navigation.Screen

@Composable
fun Footer(
    navController: NavController,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Footer content
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            FooterColumn(
                title = "TripLink",
                items = listOf(
                    "About Us",
                    "Our Story",
                    "Careers",
                    "Contact"
                )
            )
            
            FooterColumn(
                title = "Explore",
                items = listOf(
                    "Destinations",
                    "Collections",
                    "Travel Guides",
                    "Reviews"
                ),
                onItemClick = { item ->
                    when (item) {
                        "Destinations" -> navController.navigate(Screen.Destinations.route)
                        "Collections" -> navController.navigate(Screen.Collections.route)
                    }
                }
            )
            
            FooterColumn(
                title = "Support",
                items = listOf(
                    "Help Center",
                    "FAQs",
                    "Booking Support",
                    "Travel Tips"
                ),
                onItemClick = { item ->
                    when (item) {
                        "Help Center" -> navController.navigate(Screen.HelpCenter.route)
                    }
                }
            )
        }
        
        Divider(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 24.dp)
        )
        
        // Social links and copyright
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "© 2024 TripLink. All rights reserved.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                IconButton(onClick = { }) {
                    Icon(Icons.Default.Share, "Facebook")
                }
                IconButton(onClick = { }) {
                    Icon(Icons.Default.Info, "Twitter")
                }
                IconButton(onClick = { }) {
                    Icon(Icons.Default.Email, "Instagram")
                }
            }
        }
    }
}

@Composable
fun FooterColumn(
    title: String,
    items: List<String>,
    onItemClick: ((String) -> Unit)? = null
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        items.forEach { item ->
            TextButton(
                onClick = { onItemClick?.invoke(item) },
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(0.dp)
            ) {
                Text(
                    text = item,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

