package com.triplink.mobile.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Popup
import androidx.compose.ui.window.PopupProperties
import com.triplink.mobile.data.model.NotificationResponse
import com.triplink.mobile.data.repository.NotificationRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun NotificationCenter(
    notificationRepository: NotificationRepository
) {
    var isOpen by remember { mutableStateOf(false) }
    var notifications by remember { mutableStateOf<List<NotificationResponse>>(emptyList()) }
    var unreadCount by remember { mutableStateOf(0) }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    
    // Load unread count on init and periodically
    LaunchedEffect(Unit) {
        while (true) {
            scope.launch {
                val result = notificationRepository.getUnreadCount()
                result.onSuccess { count ->
                    unreadCount = count
                }
            }
            delay(30000) // Poll every 30 seconds
        }
    }
    
    // Load notifications when opened
    LaunchedEffect(isOpen) {
        if (isOpen) {
            loading = true
            scope.launch {
                val result = notificationRepository.getNotifications(limit = 20, offset = 0)
                result.onSuccess { notifs ->
                    notifications = notifs
                    loading = false
                }.onFailure {
                    loading = false
                }
            }
        }
    }
    
    Box {
        // Notification bell button
        IconButton(
            onClick = { isOpen = !isOpen }
        ) {
            Box {
                Icon(
                    imageVector = Icons.Default.Notifications,
                    contentDescription = "Notifications",
                    tint = MaterialTheme.colorScheme.onSurface
                )
                if (unreadCount > 0) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .size(18.dp)
                            .background(Color.Red, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (unreadCount > 9) "9+" else unreadCount.toString(),
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
        
        // Notification dropdown
        if (isOpen) {
            Popup(
                onDismissRequest = { isOpen = false },
                alignment = Alignment.TopEnd,
                offset = androidx.compose.ui.unit.IntOffset(0, 60),
                properties = PopupProperties(
                    focusable = true,
                    dismissOnBackPress = true,
                    dismissOnClickOutside = true
                )
            ) {
                Card(
                    modifier = Modifier
                        .width(384.dp)
                        .heightIn(max = 600.dp),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxSize()
                    ) {
                        // Header
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Notifications",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                val unreadNotifications = notifications.filter { !it.isRead }
                                if (unreadNotifications.isNotEmpty()) {
                                    TextButton(
                                        onClick = {
                                            scope.launch {
                                                notificationRepository.markAllAsRead()
                                                notifications = notifications.map { it.copy(isRead = true) }
                                                unreadCount = 0
                                            }
                                        }
                                    ) {
                                        Icon(Icons.Default.DoneAll, null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Mark all read", style = MaterialTheme.typography.bodySmall)
                                    }
                                }
                                IconButton(onClick = { isOpen = false }) {
                                    Icon(Icons.Default.Close, null)
                                }
                            }
                        }
                        
                        Divider()
                        
                        // Notifications list
                        Box(
                            modifier = Modifier.weight(1f)
                        ) {
                            if (loading) {
                                Box(
                                    modifier = Modifier.fillMaxSize(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    CircularProgressIndicator()
                                }
                            } else if (notifications.isEmpty()) {
                                Box(
                                    modifier = Modifier.fillMaxSize(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Notifications,
                                            null,
                                            modifier = Modifier.size(48.dp),
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                                        )
                                        Text(
                                            text = "No notifications",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            } else {
                                LazyColumn(
                                    modifier = Modifier.fillMaxSize()
                                ) {
                                    items(notifications) { notification ->
                                        NotificationItem(
                                            notification = notification,
                                            onClick = {
                                                scope.launch {
                                                    if (!notification.isRead) {
                                                        notificationRepository.markAsRead(listOf(notification.id))
                                                        notifications = notifications.map { 
                                                            if (it.id == notification.id) it.copy(isRead = true) else it
                                                        }
                                                        unreadCount = maxOf(0, unreadCount - 1)
                                                    }
                                                }
                                            },
                                            onMarkRead = {
                                                scope.launch {
                                                    notificationRepository.markAsRead(listOf(notification.id))
                                                    notifications = notifications.map { 
                                                        if (it.id == notification.id) it.copy(isRead = true) else it
                                                    }
                                                    unreadCount = maxOf(0, unreadCount - 1)
                                                }
                                            }
                                        )
                                        Divider()
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun NotificationItem(
    notification: NotificationResponse,
    onClick: () -> Unit,
    onMarkRead: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (!notification.isRead) {
                Color(0xFFE3F2FD) // Light blue background for unread
            } else {
                MaterialTheme.colorScheme.surface
            }
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
                Text(
                    text = notification.title,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = if (!notification.isRead) FontWeight.SemiBold else FontWeight.Normal,
                    modifier = Modifier.weight(1f)
                )
                if (!notification.isRead) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(Color(0xFF2196F3), CircleShape)
                    )
                }
            }
            
            Text(
                text = notification.message,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = notification.createdAt, // Display as-is, backend should format
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                )
                if (!notification.isRead) {
                    TextButton(
                        onClick = { onMarkRead() }
                    ) {
                        Icon(Icons.Default.Done, null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Mark read", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }
    }
}

