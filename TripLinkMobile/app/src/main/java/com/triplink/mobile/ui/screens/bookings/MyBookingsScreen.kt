package com.triplink.mobile.ui.screens.bookings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import android.content.Intent
import android.net.Uri
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.launch
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import com.triplink.mobile.ui.viewmodel.BookingFilter
import com.triplink.mobile.ui.viewmodel.MyBookingsViewModel
import com.triplink.mobile.ui.viewmodel.ViewModelFactory
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun MyBookingsScreen(
    navController: NavController,
    viewModel: MyBookingsViewModel = viewModel(
        factory = ViewModelFactory(
            authRepository = LocalAppContainer.current.authRepository,
            destinationRepository = LocalAppContainer.current.destinationRepository,
            apiService = LocalAppContainer.current.apiService
        )
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    val filteredBookings = viewModel.getFilteredBookings()
    
    // Load data when screen is displayed
    LaunchedEffect(Unit) {
        viewModel.loadBookings()
    }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundCream)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Navbar(
                navController = navController,
                user = null, // TODO: Get from auth state
                onOpenAuth = {},
                onLogout = {}
            )
            
            // Header and Filters
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "My Bookings",
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold
                )
                
                // Filter chips
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(items = BookingFilter.values().toList()) { filter ->
                        FilterChip(
                            onClick = { viewModel.setFilter(filter) },
                            label = { Text(filter.name) },
                            selected = uiState.selectedFilter == filter
                        )
                    }
                }
            }
            
            // Bookings List
            if (uiState.isLoading && uiState.bookings.isEmpty()) {
                LoadingSpinner()
            } else if (filteredBookings.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CalendarToday,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                        Text(
                            text = "No bookings found",
                            style = MaterialTheme.typography.titleLarge
                        )
                        Text(
                            text = if (uiState.selectedFilter == BookingFilter.ALL) {
                                "You haven't made any bookings yet"
                            } else {
                                "No ${uiState.selectedFilter.name.lowercase()} bookings"
                            },
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )
                        Button(
                            onClick = { navController.navigate("destinations") }
                        ) {
                            Text("Explore Destinations")
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(filteredBookings) { booking ->
                        BookingCard(
                            booking = booking,
                            viewModel = viewModel,
                            onViewDetails = {
                                // TODO: Navigate to booking details
                            },
                            onCancel = { reason ->
                                viewModel.cancelBooking(booking.id, reason)
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun BookingCard(
    booking: com.triplink.mobile.data.model.BookingResponse,
    viewModel: MyBookingsViewModel,
    onViewDetails: () -> Unit,
    onCancel: (String) -> Unit
) {
    var showCancelDialog by remember { mutableStateOf(false) }
    var showEditDialog by remember { mutableStateOf(false) }
    var showPaymentDialog by remember { mutableStateOf(false) }
    var isProcessingPayment by remember { mutableStateOf(false) }
    val context = LocalContext.current
    
    // Edit form state
    var editCheckInDate by remember { mutableStateOf(booking.checkInDate ?: booking.travelDate ?: "") }
    var editCheckOutDate by remember { mutableStateOf(booking.checkOutDate ?: "") }
    var editNumberOfGuests by remember { mutableStateOf((booking.numberOfGuests ?: booking.numberOfTravelers).toString()) }
    var editContactEmail by remember { mutableStateOf(booking.contactEmail ?: "") }
    var editContactPhone by remember { mutableStateOf(booking.contactPhone ?: "") }
    var editSpecialRequests by remember { mutableStateOf(booking.specialRequests ?: "") }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = booking.destination?.name ?: "Destination",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = booking.destination?.country ?: "",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
                
                // Status badge
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = when (booking.status) {
                        "CONFIRMED" -> Color(0xFF4CAF50).copy(alpha = 0.2f)
                        "PENDING" -> Color(0xFFFF9800).copy(alpha = 0.2f)
                        "CANCELLED" -> Color(0xFFF44336).copy(alpha = 0.2f)
                        "COMPLETED" -> Color(0xFF2196F3).copy(alpha = 0.2f)
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    }
                ) {
                    Text(
                        text = booking.status ?: "UNKNOWN",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        color = when (booking.status) {
                            "CONFIRMED" -> Color(0xFF4CAF50)
                            "PENDING" -> Color(0xFFFF9800)
                            "CANCELLED" -> Color(0xFFF44336)
                            "COMPLETED" -> Color(0xFF2196F3)
                            else -> MaterialTheme.colorScheme.onSurface
                        }
                    )
                }
            }
            
            Divider()
            
            // Booking details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Travel Date",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                    Text(
                        text = booking.travelDate?.let { dateStr ->
                            try {
                                SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(
                                    SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(dateStr) ?: Date()
                                )
                            } catch (e: Exception) {
                                dateStr
                            }
                        } ?: booking.checkInDate?.let { dateStr ->
                            try {
                                SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(
                                    SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(dateStr) ?: Date()
                                )
                            } catch (e: Exception) {
                                dateStr
                            }
                        } ?: "Date not set",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Total Price",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                    Text(
                        text = booking.totalPrice?.let { "$${String.format("%.0f", it)}" } ?: "Price not available",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Purple600
                    )
                }
            }
            
            // Payment status indicator
            if (booking.paymentStatus == "PENDING" && (booking.status == "PENDING")) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFFFFF3CD),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Payment Required",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF856404)
                            )
                        }
                        Text(
                            text = "For security reasons, payments must be completed on our website. Please visit the web version to complete your payment.",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF856404)
                        )
                    }
                }
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (booking.status != "CANCELLED" && booking.status != "COMPLETED" && booking.status != null) {
                    OutlinedButton(
                        onClick = { showEditDialog = true },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Edit, null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Edit")
                    }
                }
                
                if (booking.status == "CONFIRMED") {
                    OutlinedButton(
                        onClick = { viewModel.completeBooking(booking.id) },
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.CheckCircle, null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Complete")
                    }
                }
                
                if (booking.status == "PENDING" || booking.status == "CONFIRMED") {
                    Button(
                        onClick = { showCancelDialog = true },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Text("Cancel")
                    }
                }
            }
        }
    }
    
    // Edit Dialog
    if (showEditDialog) {
        AlertDialog(
            onDismissRequest = { showEditDialog = false },
            title = { Text("Edit Booking") },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = editCheckInDate,
                        onValueChange = { editCheckInDate = it },
                        label = { Text("Check-in Date (YYYY-MM-DD)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editCheckOutDate,
                        onValueChange = { editCheckOutDate = it },
                        label = { Text("Check-out Date (YYYY-MM-DD)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editNumberOfGuests,
                        onValueChange = { editNumberOfGuests = it },
                        label = { Text("Number of Guests") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editContactEmail,
                        onValueChange = { editContactEmail = it },
                        label = { Text("Contact Email") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editContactPhone,
                        onValueChange = { editContactPhone = it },
                        label = { Text("Contact Phone") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editSpecialRequests,
                        onValueChange = { editSpecialRequests = it },
                        label = { Text("Special Requests") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.updateBooking(
                            bookingId = booking.id,
                            checkInDate = editCheckInDate.takeIf { it.isNotEmpty() },
                            checkOutDate = editCheckOutDate.takeIf { it.isNotEmpty() },
                            numberOfGuests = editNumberOfGuests.toIntOrNull(),
                            contactEmail = editContactEmail.takeIf { it.isNotEmpty() },
                            contactPhone = editContactPhone.takeIf { it.isNotEmpty() },
                            specialRequests = editSpecialRequests.takeIf { it.isNotEmpty() }
                        )
                        showEditDialog = false
                    }
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    // Payment Dialog - Disabled, show informational message
    if (showPaymentDialog) {
        AlertDialog(
            onDismissRequest = { showPaymentDialog = false },
            icon = {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
            },
            title = { Text("Payment on Web") },
            text = {
                Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "For security reasons, payments must be completed on our website.",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Text(
                        text = "Amount: ${booking.totalPrice?.let { "$${String.format("%.2f", it)}" } ?: "Not available"}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Please visit our website to complete your payment securely.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
            },
            confirmButton = {
                Button(onClick = { showPaymentDialog = false }) {
                    Text("Understood")
                }
            }
        )
    }
    
    // Cancel Dialog
    if (showCancelDialog) {
        var cancelReason by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showCancelDialog = false },
            title = { Text("Cancel Booking") },
            text = {
                Column {
                    Text("Are you sure you want to cancel this booking?")
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = cancelReason,
                        onValueChange = { cancelReason = it },
                        label = { Text("Reason (Optional)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onCancel(cancelReason.ifEmpty { "User cancelled" })
                        showCancelDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Cancel Booking")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCancelDialog = false }) {
                    Text("Keep Booking")
                }
            }
        )
    }
}

