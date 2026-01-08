package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
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
import com.triplink.mobile.data.model.MessageResponse
import com.triplink.mobile.data.repository.AgentRepository
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import kotlinx.coroutines.launch

@Composable
fun ClientMessaging(
    clientId: Int,
    clientName: String,
    bookingId: Int? = null,
    agentRepository: AgentRepository,
    toastState: ToastState? = null
) {
    var messages by remember { mutableStateOf<List<MessageResponse>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var sending by remember { mutableStateOf(false) }
    var showForm by remember { mutableStateOf(false) }
    var subject by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()
    
    LaunchedEffect(clientId) {
        loading = true
        scope.launch {
            val result = agentRepository.getConversation(clientId)
            result.onSuccess { msgs ->
                messages = msgs
                loading = false
                // Scroll to bottom
                if (msgs.isNotEmpty()) {
                    kotlinx.coroutines.delay(100)
                    listState.animateScrollToItem(msgs.size - 1)
                }
            }.onFailure {
                loading = false
                toastState?.error("Failed to load messages")
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
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        Icons.Default.Message,
                        null,
                        modifier = Modifier.size(24.dp),
                        tint = Purple600
                    )
                    Text(
                        text = "Messages with $clientName",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
                Button(
                    onClick = { showForm = !showForm },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Purple600
                    )
                ) {
                    Text(if (showForm) "Cancel" else "New Message")
                }
            }
            
            // New Message Form
            if (showForm) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFF3E8FF) // Purple-50
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE9D5FF)) // Purple-200
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedTextField(
                            value = subject,
                            onValueChange = { subject = it },
                            label = { Text("Subject *") },
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = { Text("Message subject") },
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = message,
                            onValueChange = { message = it },
                            label = { Text("Message *") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(120.dp),
                            placeholder = { Text("Type your message...") },
                            maxLines = 5
                        )
                        Button(
                            onClick = {
                                if (subject.isBlank() || message.isBlank()) {
                                    toastState?.warning("Please enter both subject and message")
                                    return@Button
                                }
                                sending = true
                                scope.launch {
                                    val result = agentRepository.sendMessage(
                                        clientId = clientId,
                                        subject = subject,
                                        message = message,
                                        bookingId = bookingId
                                    )
                                    result.onSuccess {
                                        subject = ""
                                        message = ""
                                        showForm = false
                                        sending = false
                                        toastState?.success("Message sent successfully!")
                                        // Reload messages
                                        val reloadResult = agentRepository.getConversation(clientId)
                                        reloadResult.onSuccess { msgs ->
                                            messages = msgs
                                            if (msgs.isNotEmpty()) {
                                                kotlinx.coroutines.delay(100)
                                                listState.animateScrollToItem(msgs.size - 1)
                                            }
                                        }
                                    }.onFailure {
                                        sending = false
                                        toastState?.error("Failed to send message")
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !sending && subject.isNotBlank() && message.isNotBlank(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Purple600
                            )
                        ) {
                            if (sending) {
                                CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Color.White)
                            } else {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Icon(Icons.Default.Send, null, tint = Color.White, modifier = Modifier.size(18.dp))
                                    Text("Send Message", color = Color.White, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                }
            }
            
            // Messages List
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 400.dp)
            ) {
                if (loading) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CircularProgressIndicator()
                            Text("Loading messages...")
                        }
                    }
                } else if (messages.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                Icons.Default.Message,
                                null,
                                modifier = Modifier.size(48.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                            )
                            Text(
                                text = "No messages yet. Start a conversation!",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(messages) { msg ->
                            MessageItem(
                                message = msg,
                                clientName = clientName,
                                isFromClient = msg.senderId != clientId
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MessageItem(
    message: MessageResponse,
    clientName: String,
    isFromClient: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isFromClient) {
                Color(0xFFF3E8FF) // Purple-50
            } else {
                Color(0xFFF3F4F6) // Gray-50
            }
        ),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (isFromClient) Color(0xFFE9D5FF) else Color(0xFFE5E7EB)
        )
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = message.subject,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "${if (isFromClient) clientName else "You"} • ${message.createdAt}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                if (!message.isRead && !isFromClient) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFEF4444) // Red-500
                    ) {
                        Text(
                            text = "New",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
            Text(
                text = message.message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}






