package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import com.triplink.mobile.data.repository.AuthRepository
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import kotlinx.coroutines.launch

@Composable
fun ForgotPasswordForm(
    onBack: () -> Unit,
    onSuccess: () -> Unit,
    authRepository: AuthRepository
) {
    var email by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var messageType by remember { mutableStateOf<MessageType>(MessageType.INFO) }
    val scope = rememberCoroutineScope()
    
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Back button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Start
        ) {
            TextButton(onClick = onBack) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(Icons.Default.ArrowBack, null, modifier = Modifier.size(16.dp))
                    Text("Back to Login")
                }
            }
        }
        
        // Title
        Text(
            text = "Forgot Password",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )
        
        Text(
            text = "Enter your email address and we'll send you a link to reset your password.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        // Message
        message?.let { msg ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = when (messageType) {
                        MessageType.SUCCESS -> Color(0xFFD1FAE5) // Green-50
                        MessageType.ERROR -> Color(0xFFFEE2E2) // Red-50
                        else -> Color(0xFFDBEAFE) // Blue-50
                    }
                )
            ) {
                Text(
                    text = msg,
                    style = MaterialTheme.typography.bodySmall,
                    color = when (messageType) {
                        MessageType.SUCCESS -> Color(0xFF065F46) // Green-800
                        MessageType.ERROR -> Color(0xFF991B1B) // Red-800
                        else -> Color(0xFF1E40AF) // Blue-800
                    },
                    modifier = Modifier.padding(12.dp)
                )
            }
        }
        
        // Form
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            leadingIcon = {
                Icon(Icons.Default.Email, null)
            },
            singleLine = true,
            enabled = !loading
        )
        
        Button(
            onClick = {
                loading = true
                message = null
                scope.launch {
                    val result = authRepository.forgotPassword(email)
                    result.onSuccess {
                        message = "If the email exists, a password reset link has been sent."
                        messageType = MessageType.SUCCESS
                        loading = false
                        onSuccess()
                    }.onFailure { error ->
                        message = error.message ?: "Something went wrong"
                        messageType = MessageType.ERROR
                        loading = false
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            enabled = !loading && email.isNotEmpty(),
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
                if (loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White
                    )
                } else {
                    Text(
                        text = "Send Reset Link",
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

enum class MessageType {
    SUCCESS, ERROR, INFO
}

