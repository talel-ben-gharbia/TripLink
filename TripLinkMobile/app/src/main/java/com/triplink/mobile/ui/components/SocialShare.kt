package com.triplink.mobile.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import com.triplink.mobile.ui.theme.Purple600

@Composable
fun SocialShare(
    url: String,
    title: String,
    description: String = "",
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var copied by remember { mutableStateOf(false) }
    
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = "Share:",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            modifier = Modifier.padding(end = 4.dp)
        )
        
        // Facebook
        IconButton(
            onClick = {
                val shareUrl = "https://www.facebook.com/sharer/sharer.php?u=${android.net.Uri.encode(url)}"
                val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(shareUrl))
                context.startActivity(intent)
            },
            modifier = Modifier.size(36.dp)
        ) {
            Surface(
                shape = MaterialTheme.shapes.small,
                color = Color(0xFF1877F2).copy(alpha = 0.1f)
            ) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = "Share on Facebook",
                    tint = Color(0xFF1877F2),
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
        
        // Twitter
        IconButton(
            onClick = {
                val shareText = "$title${if (description.isNotEmpty()) " - $description" else ""}"
                val shareUrl = "https://twitter.com/intent/tweet?url=${android.net.Uri.encode(url)}&text=${android.net.Uri.encode(shareText)}"
                val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(shareUrl))
                context.startActivity(intent)
            },
            modifier = Modifier.size(36.dp)
        ) {
            Surface(
                shape = MaterialTheme.shapes.small,
                color = Color(0xFF1DA1F2).copy(alpha = 0.1f)
            ) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = "Share on Twitter",
                    tint = Color(0xFF1DA1F2),
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
        
        // Email
        IconButton(
            onClick = {
                val shareText = "$title${if (description.isNotEmpty()) "\n\n$description" else ""}\n\n$url"
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_SUBJECT, title)
                    putExtra(Intent.EXTRA_TEXT, shareText)
                }
                context.startActivity(Intent.createChooser(intent, "Share via"))
            },
            modifier = Modifier.size(36.dp)
        ) {
            Surface(
                shape = MaterialTheme.shapes.small,
                color = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Icon(
                    imageVector = Icons.Default.Email,
                    contentDescription = "Share via Email",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
        
        // Copy Link
        IconButton(
            onClick = {
                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                val clip = ClipData.newPlainText("TripLink URL", url)
                clipboard.setPrimaryClip(clip)
                copied = true
                // Reset after 2 seconds
                CoroutineScope(Dispatchers.Main).launch {
                    delay(2000)
                    copied = false
                }
            },
            modifier = Modifier.size(36.dp)
        ) {
            Surface(
                shape = MaterialTheme.shapes.small,
                color = Purple600.copy(alpha = 0.1f)
            ) {
                Icon(
                    imageVector = if (copied) Icons.Default.Check else Icons.Default.ContentCopy,
                    contentDescription = "Copy link",
                    tint = if (copied) Color(0xFF4CAF50) else Purple600,
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
        
        // Native Share
        IconButton(
            onClick = {
                val shareText = "$title${if (description.isNotEmpty()) "\n\n$description" else ""}\n\n$url"
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_SUBJECT, title)
                    putExtra(Intent.EXTRA_TEXT, shareText)
                }
                context.startActivity(Intent.createChooser(intent, "Share"))
            },
            modifier = Modifier.size(36.dp)
        ) {
            Surface(
                shape = MaterialTheme.shapes.small,
                color = Color(0xFF2196F3).copy(alpha = 0.1f)
            ) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = "Share",
                    tint = Color(0xFF2196F3),
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
    }
}

