package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

enum class ModalSize {
    SMALL, MEDIUM, LARGE, FULLSCREEN
}

@Composable
fun Modal(
    isOpen: Boolean,
    onClose: () -> Unit,
    title: String? = null,
    size: ModalSize = ModalSize.MEDIUM,
    content: @Composable () -> Unit
) {
    if (isOpen) {
        Dialog(
            onDismissRequest = onClose,
            properties = DialogProperties(
                usePlatformDefaultWidth = false,
                decorFitsSystemWindows = false
            )
        ) {
            val widthModifier = when (size) {
                ModalSize.SMALL -> Modifier.widthIn(max = 400.dp)
                ModalSize.MEDIUM -> Modifier.widthIn(max = 600.dp)
                ModalSize.LARGE -> Modifier.widthIn(max = 900.dp)
                ModalSize.FULLSCREEN -> Modifier.fillMaxWidth()
            }
            
            val heightModifier = when (size) {
                ModalSize.FULLSCREEN -> Modifier.fillMaxHeight(0.9f)
                else -> Modifier.heightIn(max = 800.dp)
            }
            
            Surface(
                modifier = Modifier
                    .then(widthModifier)
                    .then(heightModifier)
                    .padding(16.dp),
                shape = RoundedCornerShape(24.dp),
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 8.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp)
                ) {
                    // Header
                    if (title != null) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = title,
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold
                            )
                            IconButton(onClick = onClose) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Close"
                                )
                            }
                        }
                        Divider(modifier = Modifier.padding(vertical = 16.dp))
                    } else {
                        // Close button in top right if no title
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End
                        ) {
                            IconButton(onClick = onClose) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Close"
                                )
                            }
                        }
                    }
                    
                    // Content
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        content()
                    }
                }
            }
        }
    }
}

