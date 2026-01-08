package com.triplink.mobile.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.triplink.mobile.data.model.DestinationResponse

@Composable
fun BookingModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    destination: DestinationResponse?,
    onBookingComplete: (com.triplink.mobile.data.model.BookingResponse) -> Unit = {}
) {
    if (isOpen) {
        AlertDialog(
            onDismissRequest = onClose,
            icon = {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
            },
            title = {
                Text(
                    text = "Book on Web",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "For security reasons, bookings and payments must be completed on our website.",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Text(
                        text = "You can view your existing bookings in the mobile app, but to create new bookings or make payments, please visit our website.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
            },
            confirmButton = {
                Button(onClick = onClose) {
                    Text("Understood")
                }
            }
        )
    }
}


