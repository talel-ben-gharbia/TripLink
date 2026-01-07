package com.triplink.mobile.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
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

enum class ToastType {
    SUCCESS, ERROR, WARNING, INFO
}

data class ToastData(
    val id: Long,
    val message: String,
    val type: ToastType,
    val duration: Long = 5000L
)

@Composable
fun ErrorToast(
    message: String,
    type: ToastType = ToastType.ERROR,
    onClose: () -> Unit,
    duration: Long = 5000L
) {
    var isVisible by remember { mutableStateOf(true) }
    
    LaunchedEffect(Unit) {
        if (duration > 0) {
            delay(duration)
            isVisible = false
            delay(300) // Animation duration
            onClose()
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
            ToastType.SUCCESS -> Color(0xFF10B981) // Green-500
            ToastType.WARNING -> Color(0xFFF59E0B) // Yellow-500
            ToastType.INFO -> Color(0xFF3B82F6) // Blue-500
            ToastType.ERROR -> Color(0xFFEF4444) // Red-500
        }
        val borderColor = when (type) {
            ToastType.SUCCESS -> Color(0xFF059669) // Green-600
            ToastType.WARNING -> Color(0xFFD97706) // Yellow-600
            ToastType.INFO -> Color(0xFF2563EB) // Blue-600
            ToastType.ERROR -> Color(0xFFDC2626) // Red-600
        }
        val icon = when (type) {
            ToastType.SUCCESS -> Icons.Default.CheckCircle
            ToastType.WARNING -> Icons.Default.Warning
            ToastType.INFO -> Icons.Default.Info
            ToastType.ERROR -> Icons.Default.Error
        }
        val iconColor = Color.White
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(
                containerColor = backgroundColor
            ),
            border = androidx.compose.foundation.BorderStroke(2.dp, borderColor)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
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
                    color = Color.White,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.weight(1f)
                )
                IconButton(
                    onClick = {
                        isVisible = false
                        onClose()
                    },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun rememberToastState(): ToastState {
    return remember { ToastState() }
}

class ToastState {
    private val _toasts = mutableStateListOf<ToastData>()
    val toasts: List<ToastData> = _toasts
    
    fun showToast(
        message: String,
        type: ToastType = ToastType.ERROR,
        duration: Long = 5000L
    ): Long {
        val id = System.currentTimeMillis() + (Math.random() * 1000).toLong()
        _toasts.add(ToastData(id, message, type, duration))
        return id
    }
    
    fun removeToast(id: Long) {
        _toasts.removeAll { it.id == id }
    }
    
    fun success(message: String, duration: Long = 5000L) = showToast(message, ToastType.SUCCESS, duration)
    fun error(message: String, duration: Long = 5000L) = showToast(message, ToastType.ERROR, duration)
    fun warning(message: String, duration: Long = 5000L) = showToast(message, ToastType.WARNING, duration)
    fun info(message: String, duration: Long = 5000L) = showToast(message, ToastType.INFO, duration)
}

@Composable
fun ToastContainer(
    toastState: ToastState,
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
            toastState.toasts.forEach { toast ->
                ErrorToast(
                    message = toast.message,
                    type = toast.type,
                    duration = toast.duration,
                    onClose = { toastState.removeToast(toast.id) }
                )
            }
        }
    }
}

