package com.triplink.mobile.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

data class ToastMessage(
    val id: Long,
    val message: String,
    val type: ToastType,
    val duration: Long = 5000L
)

@Composable
fun Toast(
    id: Long,
    message: String,
    type: ToastType = ToastType.INFO,
    duration: Long = 5000L,
    onClose: (Long) -> Unit
) {
    var isVisible by remember { mutableStateOf(true) }
    
    LaunchedEffect(Unit) {
        if (duration > 0) {
            delay(duration)
            isVisible = false
            delay(300) // Animation duration
            onClose(id)
        }
    }
    
    AnimatedVisibility(
        visible = isVisible,
        enter = slideInHorizontally(
            initialOffsetX = { it },
            animationSpec = tween(300)
        ) + fadeIn(),
        exit = slideOutHorizontally(
            targetOffsetX = { it },
            animationSpec = tween(300)
        ) + fadeOut()
    ) {
        val backgroundColor = when (type) {
            ToastType.SUCCESS -> Color(0xFFD1FAE5) // Green-50
            ToastType.ERROR -> Color(0xFFFEE2E2) // Red-50
            ToastType.WARNING -> Color(0xFFFEF3C7) // Yellow-50
            ToastType.INFO -> Color(0xFFDBEAFE) // Blue-50
        }
        val borderColor = when (type) {
            ToastType.SUCCESS -> Color(0xFF86EFAC) // Green-200
            ToastType.ERROR -> Color(0xFFFCA5A5) // Red-200
            ToastType.WARNING -> Color(0xFFFDE047) // Yellow-200
            ToastType.INFO -> Color(0xFF93C5FD) // Blue-200
        }
        val icon = when (type) {
            ToastType.SUCCESS -> Icons.Default.CheckCircle
            ToastType.ERROR -> Icons.Default.Error
            ToastType.WARNING -> Icons.Default.Warning
            ToastType.INFO -> Icons.Default.Info
        }
        val iconColor = when (type) {
            ToastType.SUCCESS -> Color(0xFF10B981) // Green-500
            ToastType.ERROR -> Color(0xFFEF4444) // Red-500
            ToastType.WARNING -> Color(0xFFF59E0B) // Yellow-500
            ToastType.INFO -> Color(0xFF3B82F6) // Blue-500
        }
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(
                containerColor = backgroundColor
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, borderColor)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = when (type) {
                        ToastType.SUCCESS -> Color(0xFF065F46) // Green-800
                        ToastType.ERROR -> Color(0xFF991B1B) // Red-800
                        ToastType.WARNING -> Color(0xFF92400E) // Yellow-800
                        ToastType.INFO -> Color(0xFF1E40AF) // Blue-800
                    },
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.weight(1f)
                )
                IconButton(
                    onClick = {
                        isVisible = false
                        onClose(id)
                    },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun rememberToastManager(): ToastManager {
    return remember { ToastManager() }
}

class ToastManager {
    private val _toasts = mutableStateListOf<ToastMessage>()
    val toasts: List<ToastMessage> = _toasts
    
    fun show(
        message: String,
        type: ToastType = ToastType.INFO,
        duration: Long = 5000L
    ): Long {
        val id = System.currentTimeMillis() + (Math.random() * 1000).toLong()
        _toasts.add(ToastMessage(id, message, type, duration))
        return id
    }
    
    fun remove(id: Long) {
        _toasts.removeAll { it.id == id }
    }
    
    fun success(message: String, duration: Long = 5000L) = show(message, ToastType.SUCCESS, duration)
    fun error(message: String, duration: Long = 5000L) = show(message, ToastType.ERROR, duration)
    fun warning(message: String, duration: Long = 5000L) = show(message, ToastType.WARNING, duration)
    fun info(message: String, duration: Long = 5000L) = show(message, ToastType.INFO, duration)
}

@Composable
fun ToastContainer(
    toastManager: ToastManager,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        contentAlignment = Alignment.TopEnd
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            horizontalAlignment = Alignment.End
        ) {
            toastManager.toasts.forEach { toast ->
                Toast(
                    id = toast.id,
                    message = toast.message,
                    type = toast.type,
                    duration = toast.duration,
                    onClose = { toastManager.remove(it) }
                )
            }
        }
    }
}

