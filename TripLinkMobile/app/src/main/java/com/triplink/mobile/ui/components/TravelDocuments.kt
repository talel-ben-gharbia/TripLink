package com.triplink.mobile.ui.components

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.triplink.mobile.data.model.DocumentAlerts
import com.triplink.mobile.data.model.TravelDocumentResponse
import com.triplink.mobile.data.repository.TravelDocumentRepository
import com.triplink.mobile.ui.components.EmptyState
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun TravelDocuments(
    travelDocumentRepository: TravelDocumentRepository,
    toastState: ToastState? = null
) {
    var documents by remember { mutableStateOf<List<TravelDocumentResponse>>(emptyList()) }
    var alerts by remember { mutableStateOf<DocumentAlerts?>(null) }
    var loading by remember { mutableStateOf(true) }
    var showUploadModal by remember { mutableStateOf(false) }
    var editingDoc by remember { mutableStateOf<TravelDocumentResponse?>(null) }
    val scope = rememberCoroutineScope()
    
    LaunchedEffect(Unit) {
        loading = true
        scope.launch {
            val result = travelDocumentRepository.getTravelDocuments()
            result.onSuccess { response ->
                documents = response.documents
                alerts = response.alerts
                loading = false
            }.onFailure {
                loading = false
                toastState?.error("Failed to load documents")
            }
        }
    }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.Description,
                            null,
                            modifier = Modifier.size(28.dp),
                            tint = Purple600
                        )
                        Text(
                            text = "Travel Documents",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = "Manage your passports, visas, and travel documents",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Button(
                    onClick = { showUploadModal = true },
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
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(Icons.Default.Upload, null, tint = Color.White, modifier = Modifier.size(18.dp))
                            Text("Upload", color = Color.White, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
            
            // Alerts
            alerts?.let { alert ->
                if (alert.expired.isNotEmpty() || alert.expiring.isNotEmpty()) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (alert.expired.isNotEmpty()) {
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xFFFEE2E2) // Red-50
                                ),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFCA5A5)) // Red-200
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(Icons.Default.Error, null, tint = Color(0xFFDC2626))
                                    Column {
                                        Text(
                                            text = "Expired Documents (${alert.expired.size})",
                                            fontWeight = FontWeight.SemiBold,
                                            color = Color(0xFF991B1B) // Red-900
                                        )
                                        Text(
                                            text = "You have expired documents that need renewal.",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Color(0xFF991B1B)
                                        )
                                    }
                                }
                            }
                        }
                        if (alert.expiring.isNotEmpty()) {
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xFFFEF3C7) // Yellow-50
                                ),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFDE047)) // Yellow-200
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(Icons.Default.Warning, null, tint = Color(0xFFD97706))
                                    Column {
                                        Text(
                                            text = "Expiring Soon (${alert.expiring.size})",
                                            fontWeight = FontWeight.SemiBold,
                                            color = Color(0xFF92400E) // Yellow-900
                                        )
                                        Text(
                                            text = "Some documents will expire within 90 days.",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Color(0xFF92400E)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Documents List
            if (loading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        CircularProgressIndicator()
                        Text("Loading documents...")
                    }
                }
            } else if (documents.isEmpty()) {
                EmptyState(
                    icon = Icons.Default.Description,
                    title = "No Documents Yet",
                    message = "Upload your travel documents (passport, visa, etc.) for easy access and automatic expiration tracking.",
                    actionLabel = "Upload Document",
                    actionOnClick = { showUploadModal = true }
                )
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 280.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(documents) { doc ->
                        DocumentCard(
                            document = doc,
                            onEdit = { editingDoc = doc },
                            onDelete = {
                                scope.launch {
                                    val result = travelDocumentRepository.deleteTravelDocument(doc.id)
                                    result.onSuccess {
                                        documents = documents.filter { it.id != doc.id }
                                        toastState?.success("Document deleted successfully")
                                    }.onFailure {
                                        toastState?.error("Failed to delete document")
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
    }
    
    // Upload Modal
    if (showUploadModal) {
        UploadDocumentModal(
            isOpen = showUploadModal,
            onClose = { showUploadModal = false },
            travelDocumentRepository = travelDocumentRepository,
            onSuccess = {
                showUploadModal = false
                scope.launch {
                    val result = travelDocumentRepository.getTravelDocuments()
                    result.onSuccess { response ->
                        documents = response.documents
                        alerts = response.alerts
                    }
                }
            },
            toastState = toastState
        )
    }
    
    // Edit Modal
    editingDoc?.let { doc ->
        EditDocumentModal(
            document = doc,
            onClose = { editingDoc = null },
            travelDocumentRepository = travelDocumentRepository,
            onSuccess = {
                editingDoc = null
                scope.launch {
                    val result = travelDocumentRepository.getTravelDocuments()
                    result.onSuccess { response ->
                        documents = response.documents
                        alerts = response.alerts
                    }
                }
            },
            toastState = toastState
        )
    }
}

@Composable
fun DocumentCard(
    document: TravelDocumentResponse,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val backgroundColor = when {
        document.isExpired -> Color(0xFFFEE2E2) // Red-50
        document.isExpiringSoon -> Color(0xFFFEF3C7) // Yellow-50
        else -> Color.White
    }
    
    val borderColor = when {
        document.isExpired -> Color(0xFFFCA5A5) // Red-200
        document.isExpiringSoon -> Color(0xFFFDE047) // Yellow-200
        else -> Color(0xFFE5E7EB) // Gray-200
    }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        border = androidx.compose.foundation.BorderStroke(1.dp, borderColor)
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
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        Icons.Default.Description,
                        null,
                        tint = Purple600,
                        modifier = Modifier.size(20.dp)
                    )
                    Text(
                        text = getDocumentTypeLabel(document.type),
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    if (document.isVerified) {
                        Icon(
                            Icons.Default.CheckCircle,
                            null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(onClick = onEdit, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Edit, null, tint = Color(0xFF3B82F6), modifier = Modifier.size(16.dp))
                    }
                    IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Delete, null, tint = Color(0xFFEF4444), modifier = Modifier.size(16.dp))
                    }
                }
            }
            
            document.fileName?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            document.fileSize?.let {
                Text(
                    text = formatFileSize(it),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            document.documentNumber?.let {
                Text(
                    text = "Number: $it",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            document.expiryDate?.let {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(Icons.Default.CalendarToday, null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                        text = "Expires: ${formatDate(it)}",
                        style = MaterialTheme.typography.labelSmall,
                        color = when {
                            document.isExpired -> Color(0xFFDC2626)
                            document.isExpiringSoon -> Color(0xFFD97706)
                            else -> MaterialTheme.colorScheme.onSurfaceVariant
                        },
                        fontWeight = if (document.isExpired || document.isExpiringSoon) FontWeight.SemiBold else FontWeight.Normal
                    )
                }
            }
            
            document.country?.let {
                Text(
                    text = "Country: $it",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadDocumentModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    travelDocumentRepository: TravelDocumentRepository,
    onSuccess: () -> Unit,
    toastState: ToastState?
) {
    var documentType by remember { mutableStateOf("PASSPORT") }
    var documentNumber by remember { mutableStateOf("") }
    var expirationDate by remember { mutableStateOf("") }
    var issueDate by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("") }
    var selectedFileUri by remember { mutableStateOf<Uri?>(null) }
    var uploading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    
    Modal(
        isOpen = isOpen,
        onClose = onClose,
        title = "Upload Travel Document",
        size = ModalSize.MEDIUM
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Document Type
            var expanded by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
                OutlinedTextField(
                    value = documentType,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Document Type *") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) }
                )
                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    listOf("PASSPORT", "VISA", "ID_CARD", "DRIVER_LICENSE").forEach { type ->
                        DropdownMenuItem(
                            text = { Text(getDocumentTypeLabel(type)) },
                            onClick = {
                                documentType = type
                                expanded = false
                            }
                        )
                    }
                }
            }
            
            // File picker (simplified - would need actual file picker integration)
            OutlinedTextField(
                value = selectedFileUri?.toString() ?: "",
                onValueChange = {},
                readOnly = true,
                label = { Text("File * (JPEG, PNG, or PDF, max 10MB)") },
                modifier = Modifier.fillMaxWidth(),
                leadingIcon = { Icon(Icons.Default.AttachFile, null) },
                trailingIcon = {
                    IconButton(onClick = {
                        // TODO: Open file picker
                        toastState?.info("File picker integration needed")
                    }) {
                        Icon(Icons.Default.Folder, null)
                    }
                }
            )
            
            OutlinedTextField(
                value = documentNumber,
                onValueChange = { documentNumber = it },
                label = { Text("Document Number") },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("e.g., A12345678") }
            )
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = issueDate,
                    onValueChange = { issueDate = it },
                    label = { Text("Issue Date") },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("YYYY-MM-DD") }
                )
                OutlinedTextField(
                    value = expirationDate,
                    onValueChange = { expirationDate = it },
                    label = { Text("Expiration Date") },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("YYYY-MM-DD") }
                )
            }
            
            OutlinedTextField(
                value = country,
                onValueChange = { country = it },
                label = { Text("Country") },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("e.g., United States") }
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onClose,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Cancel")
                }
                Button(
                    onClick = {
                        if (selectedFileUri == null) {
                            toastState?.warning("Please select a file")
                            return@Button
                        }
                        uploading = true
                        scope.launch {
                            // TODO: Convert URI to File and upload
                            // For now, show error
                            toastState?.error("File upload integration needed")
                            uploading = false
                        }
                    },
                    modifier = Modifier.weight(1f),
                    enabled = !uploading
                ) {
                    if (uploading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
                    } else {
                        Text("Upload")
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditDocumentModal(
    document: TravelDocumentResponse,
    onClose: () -> Unit,
    travelDocumentRepository: TravelDocumentRepository,
    onSuccess: () -> Unit,
    toastState: ToastState?
) {
    var documentType by remember { mutableStateOf(document.type) }
    var documentNumber by remember { mutableStateOf(document.documentNumber ?: "") }
    var expirationDate by remember { mutableStateOf(document.expiryDate ?: "") }
    var issueDate by remember { mutableStateOf(document.issueDate ?: "") }
    var country by remember { mutableStateOf(document.country ?: "") }
    var updating by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    
    Modal(
        isOpen = true,
        onClose = onClose,
        title = "Edit Document",
        size = ModalSize.MEDIUM
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Document Type
            var expanded by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
                OutlinedTextField(
                    value = documentType,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Document Type *") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) }
                )
                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    listOf("PASSPORT", "VISA", "ID_CARD", "DRIVER_LICENSE").forEach { type ->
                        DropdownMenuItem(
                            text = { Text(getDocumentTypeLabel(type)) },
                            onClick = {
                                documentType = type
                                expanded = false
                            }
                        )
                    }
                }
            }
            
            OutlinedTextField(
                value = documentNumber,
                onValueChange = { documentNumber = it },
                label = { Text("Document Number") },
                modifier = Modifier.fillMaxWidth()
            )
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = issueDate,
                    onValueChange = { issueDate = it },
                    label = { Text("Issue Date") },
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = expirationDate,
                    onValueChange = { expirationDate = it },
                    label = { Text("Expiration Date") },
                    modifier = Modifier.weight(1f)
                )
            }
            
            OutlinedTextField(
                value = country,
                onValueChange = { country = it },
                label = { Text("Country") },
                modifier = Modifier.fillMaxWidth()
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onClose,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Cancel")
                }
                Button(
                    onClick = {
                        updating = true
                        scope.launch {
                            val result = travelDocumentRepository.updateTravelDocument(
                                id = document.id,
                                documentType = documentType,
                                documentNumber = documentNumber.takeIf { it.isNotEmpty() },
                                expirationDate = expirationDate.takeIf { it.isNotEmpty() },
                                issueDate = issueDate.takeIf { it.isNotEmpty() },
                                country = country.takeIf { it.isNotEmpty() }
                            )
                            result.onSuccess {
                                toastState?.success("Document updated successfully")
                                updating = false
                                onSuccess()
                            }.onFailure {
                                toastState?.error("Failed to update document")
                                updating = false
                            }
                        }
                    },
                    modifier = Modifier.weight(1f),
                    enabled = !updating
                ) {
                    if (updating) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
                    } else {
                        Text("Update")
                    }
                }
            }
        }
    }
}

fun getDocumentTypeLabel(type: String): String {
    return when (type) {
        "PASSPORT" -> "Passport"
        "VISA" -> "Visa"
        "ID_CARD" -> "ID Card"
        "DRIVER_LICENSE" -> "Driver License"
        else -> type
    }
}

fun formatFileSize(bytes: Long): String {
    return when {
        bytes < 1024 -> "$bytes B"
        bytes < 1024 * 1024 -> "${(bytes / 1024.0).toInt()} KB"
        else -> "${(bytes / (1024.0 * 1024.0)).toInt()} MB"
    }
}

fun formatDate(dateString: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
        val date = inputFormat.parse(dateString)
        date?.let { outputFormat.format(it) } ?: dateString
    } catch (e: Exception) {
        dateString
    }
}

