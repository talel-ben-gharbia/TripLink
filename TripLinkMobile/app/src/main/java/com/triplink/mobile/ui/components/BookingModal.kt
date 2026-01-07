package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.triplink.mobile.data.model.DestinationResponse
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import java.text.SimpleDateFormat
import java.util.*

enum class BookingStep {
    DETAILS, REVIEW, PAYMENT, SUCCESS
}

@Composable
fun BookingModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    destination: DestinationResponse?,
    onBookingComplete: (com.triplink.mobile.data.model.BookingResponse) -> Unit = {}
) {
    var currentStep by remember { mutableStateOf(BookingStep.DETAILS) }
    var checkInDate by remember { mutableStateOf<Long?>(null) }
    var checkOutDate by remember { mutableStateOf<Long?>(null) }
    var numberOfGuests by remember { mutableStateOf(1) }
    var specialRequests by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    
    if (isOpen && destination != null) {
        Dialog(
            onDismissRequest = onClose,
            properties = DialogProperties(
                usePlatformDefaultWidth = false,
                decorFitsSystemWindows = false
            )
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.9f)
                    .padding(16.dp),
                shape = RoundedCornerShape(24.dp),
                color = MaterialTheme.colorScheme.surface
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = when (currentStep) {
                                BookingStep.DETAILS -> "Booking Details"
                                BookingStep.REVIEW -> "Review Booking"
                                BookingStep.PAYMENT -> "Payment"
                                BookingStep.SUCCESS -> "Booking Confirmed"
                            },
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                        IconButton(onClick = onClose) {
                            Icon(Icons.Default.Close, "Close")
                        }
                    }
                    
                    // Progress indicator
                    LinearProgressIndicator(
                        progress = when (currentStep) {
                            BookingStep.DETAILS -> 0.25f
                            BookingStep.REVIEW -> 0.5f
                            BookingStep.PAYMENT -> 0.75f
                            BookingStep.SUCCESS -> 1f
                        },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    // Error message
                    error?.let { errorMsg ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.errorContainer
                            )
                        ) {
                            Text(
                                text = errorMsg,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onErrorContainer,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }
                    
                    // Content based on step
                    when (currentStep) {
                        BookingStep.DETAILS -> {
                            BookingDetailsStep(
                                destination = destination,
                                checkInDate = checkInDate,
                                checkOutDate = checkOutDate,
                                numberOfGuests = numberOfGuests,
                                specialRequests = specialRequests,
                                onCheckInDateChange = { checkInDate = it },
                                onCheckOutDateChange = { checkOutDate = it },
                                onNumberOfGuestsChange = { numberOfGuests = it },
                                onSpecialRequestsChange = { specialRequests = it },
                                onNext = {
                                    if (checkInDate != null) {
                                        currentStep = BookingStep.REVIEW
                                        error = null
                                    } else {
                                        error = "Please select a check-in date"
                                    }
                                }
                            )
                        }
                        BookingStep.REVIEW -> {
                            BookingReviewStep(
                                destination = destination,
                                checkInDate = checkInDate,
                                checkOutDate = checkOutDate,
                                numberOfGuests = numberOfGuests,
                                specialRequests = specialRequests,
                                onBack = { currentStep = BookingStep.DETAILS },
                                onConfirm = {
                                    isLoading = true
                                    error = null
                                    // TODO: Call booking repository
                                    // For now, simulate success
                                    currentStep = BookingStep.SUCCESS
                                    isLoading = false
                                },
                                isLoading = isLoading
                            )
                        }
                        BookingStep.PAYMENT -> {
                            // Payment step - TODO: Implement Stripe integration
                            Text("Payment step - TODO")
                        }
                        BookingStep.SUCCESS -> {
                            BookingSuccessStep(
                                onClose = {
                                    onClose()
                                    // Reset state
                                    currentStep = BookingStep.DETAILS
                                    checkInDate = null
                                    checkOutDate = null
                                    numberOfGuests = 1
                                    specialRequests = ""
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BookingDetailsStep(
    destination: DestinationResponse,
    checkInDate: Long?,
    checkOutDate: Long?,
    numberOfGuests: Int,
    specialRequests: String,
    onCheckInDateChange: (Long?) -> Unit,
    onCheckOutDateChange: (Long?) -> Unit,
    onNumberOfGuestsChange: (Int) -> Unit,
    onSpecialRequestsChange: (String) -> Unit,
    onNext: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Destination info
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = destination.name,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = destination.city?.let { "$it, ${destination.country}" } ?: destination.country,
                    style = MaterialTheme.typography.bodyMedium
                )
                Text(
                    text = "$${String.format("%.0f", destination.price)} / night",
                    style = MaterialTheme.typography.titleMedium,
                    color = Purple600
                )
            }
        }
        
        // Check-in date
        OutlinedTextField(
            value = checkInDate?.let { 
                SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(Date(it))
            } ?: "",
            onValueChange = {},
            label = { Text("Check-in Date") },
            modifier = Modifier.fillMaxWidth(),
                  leadingIcon = { Icon(Icons.Default.CalendarToday, null) },
            readOnly = true,
            trailingIcon = {
                IconButton(onClick = {
                    // TODO: Show date picker
                }) {
                    Icon(Icons.Default.Edit, "Select date")
                }
            }
        )
        
        // Check-out date (optional)
        OutlinedTextField(
            value = checkOutDate?.let { 
                SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(Date(it))
            } ?: "",
            onValueChange = {},
            label = { Text("Check-out Date (Optional)") },
            modifier = Modifier.fillMaxWidth(),
                  leadingIcon = { Icon(Icons.Default.CalendarToday, null) },
            readOnly = true,
            trailingIcon = {
                IconButton(onClick = {
                    // TODO: Show date picker
                }) {
                    Icon(Icons.Default.Edit, "Select date")
                }
            }
        )
        
        // Number of guests
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Number of Guests",
                style = MaterialTheme.typography.titleMedium
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { onNumberOfGuestsChange(maxOf(1, numberOfGuests - 1)) }
                ) {
                    Icon(Icons.Default.Remove, null)
                }
                Text(
                    text = numberOfGuests.toString(),
                    style = MaterialTheme.typography.titleLarge
                )
                IconButton(
                    onClick = { onNumberOfGuestsChange(numberOfGuests + 1) }
                ) {
                    Icon(Icons.Default.AddCircle, null)
                }
            }
        }
        
        // Special requests
        OutlinedTextField(
            value = specialRequests,
            onValueChange = onSpecialRequestsChange,
            label = { Text("Special Requests (Optional)") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
            maxLines = 5
        )
        
        // Next button
        Button(
            onClick = onNext,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent
            )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(Purple600, Blue500)
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Continue",
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
fun BookingReviewStep(
    destination: DestinationResponse,
    checkInDate: Long?,
    checkOutDate: Long?,
    numberOfGuests: Int,
    specialRequests: String,
    onBack: () -> Unit,
    onConfirm: () -> Unit,
    isLoading: Boolean
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Booking summary
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Booking Summary",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Check-in:", style = MaterialTheme.typography.bodyMedium)
                    Text(
                        checkInDate?.let { 
                            SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(Date(it))
                        } ?: "",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                
                if (checkOutDate != null) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Check-out:", style = MaterialTheme.typography.bodyMedium)
                        Text(
                            SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(Date(checkOutDate)),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Guests:", style = MaterialTheme.typography.bodyMedium)
                    Text(
                        numberOfGuests.toString(),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                
                Divider()
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Total",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "$${String.format("%.0f", destination.price)}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Purple600
                    )
                }
            }
        }
        
        // Action buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedButton(
                onClick = onBack,
                modifier = Modifier.weight(1f, fill = true)
            ) {
                Text("Back")
            }
            
            Button(
                onClick = onConfirm,
                modifier = Modifier
                    .weight(1f, fill = true)
                    .height(56.dp),
                enabled = !isLoading,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Transparent
                )
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                brush = Brush.horizontalGradient(
                                    colors = listOf(Purple600, Blue500)
                                ),
                                shape = RoundedCornerShape(12.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Confirm Booking",
                            color = Color.White,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun BookingSuccessStep(
    onClose: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.CheckCircle,
            contentDescription = null,
            tint = Color(0xFF4CAF50),
            modifier = Modifier.size(80.dp)
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = "Booking Confirmed!",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = "Your booking has been successfully created.",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = onClose,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent
            )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(Purple600, Blue500)
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Close",
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

