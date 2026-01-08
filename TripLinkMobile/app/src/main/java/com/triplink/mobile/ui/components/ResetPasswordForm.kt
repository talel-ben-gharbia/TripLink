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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.triplink.mobile.data.repository.AuthRepository
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import kotlinx.coroutines.launch

@Composable
fun ResetPasswordForm(
    token: String?,
    authRepository: AuthRepository,
    onSuccess: () -> Unit = {},
    onBack: () -> Unit = {}
) {
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var success by remember { mutableStateOf(false) }
    var messageType by remember { mutableStateOf<MessageType>(MessageType.INFO) }
    val scope = rememberCoroutineScope()
    
    val passwordErrors = remember(password) {
        validatePassword(password)
    }
    
    LaunchedEffect(token) {
        if (token == null) {
            message = "Invalid reset link. Please request a new one."
            messageType = MessageType.ERROR
        }
    }
    
    if (token == null) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    Icons.Default.Error,
                    null,
                    modifier = Modifier.size(48.dp),
                    tint = Color(0xFFEF4444)
                )
                Text(
                    text = "Invalid Reset Link",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Please request a new password reset link.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                TextButton(onClick = onBack) {
                    Text("Go to Login")
                }
            }
        }
        return
    }
    
    if (success) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    Icons.Default.CheckCircle,
                    null,
                    modifier = Modifier.size(48.dp),
                    tint = Color(0xFF10B981)
                )
                Text(
                    text = "Success!",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF10B981)
                )
                Text(
                    text = message ?: "Password reset successfully!",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        return
    }
    
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Reset Password",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )
        
        Text(
            text = "Enter your new password below.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        // Password Requirements
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFFDBEAFE) // Blue-50
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Password Requirements:",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF1E40AF) // Blue-800
                )
                Column(
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    PasswordRequirement(met = password.length >= 8, text = "At least 8 characters")
                    PasswordRequirement(met = password.any { it.isLowerCase() }, text = "At least one lowercase letter (a-z)")
                    PasswordRequirement(met = password.any { it.isUpperCase() }, text = "At least one uppercase letter (A-Z)")
                    PasswordRequirement(met = password.any { it.isDigit() }, text = "At least one number (0-9)")
                }
            }
        }
        
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
        
        // Password field
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("New password") },
            modifier = Modifier.fillMaxWidth(),
            leadingIcon = { Icon(Icons.Default.Lock, null) },
            trailingIcon = {
                IconButton(onClick = { showPassword = !showPassword }) {
                    Icon(
                        imageVector = if (showPassword) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                        contentDescription = if (showPassword) "Hide password" else "Show password"
                    )
                }
            },
            visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
            singleLine = true,
            enabled = !loading,
            isError = password.isNotEmpty() && passwordErrors.isNotEmpty()
        )
        
        // Confirm password field
        OutlinedTextField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = { Text("Confirm password") },
            modifier = Modifier.fillMaxWidth(),
            leadingIcon = { Icon(Icons.Default.Lock, null) },
            trailingIcon = {
                IconButton(onClick = { showPassword = !showPassword }) {
                    Icon(
                        imageVector = if (showPassword) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                        contentDescription = if (showPassword) "Hide password" else "Show password"
                    )
                }
            },
            visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
            singleLine = true,
            enabled = !loading,
            isError = confirmPassword.isNotEmpty() && password != confirmPassword
        )
        
        if (confirmPassword.isNotEmpty() && password != confirmPassword) {
            Text(
                text = "Passwords do not match",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFFEF4444),
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        // Submit button
        Button(
            onClick = {
                if (password != confirmPassword) {
                    message = "Passwords do not match"
                    messageType = MessageType.ERROR
                    return@Button
                }
                
                if (passwordErrors.isNotEmpty()) {
                    message = passwordErrors.joinToString(". ")
                    messageType = MessageType.ERROR
                    return@Button
                }
                
                loading = true
                message = null
                scope.launch {
                    val result = authRepository.resetPassword(token, password)
                    result.onSuccess {
                        success = true
                        message = "Password reset successfully! Redirecting to login..."
                        loading = false
                        kotlinx.coroutines.delay(2000)
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
            enabled = !loading && password.isNotEmpty() && confirmPassword.isNotEmpty() && passwordErrors.isEmpty() && password == confirmPassword,
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
                        text = "Reset Password",
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

@Composable
fun PasswordRequirement(met: Boolean, text: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            imageVector = if (met) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
            contentDescription = null,
            modifier = Modifier.size(16.dp),
            tint = if (met) Color(0xFF10B981) else Color(0xFF9CA3AF)
        )
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall,
            color = if (met) Color(0xFF10B981) else Color(0xFF6B7280)
        )
    }
}

fun validatePassword(password: String): List<String> {
    val errors = mutableListOf<String>()
    
    if (password.length < 8) {
        errors.add("Password must be at least 8 characters")
    }
    
    if (!password.any { it.isLowerCase() }) {
        errors.add("Password must contain at least one lowercase letter")
    }
    
    if (!password.any { it.isUpperCase() }) {
        errors.add("Password must contain at least one uppercase letter")
    }
    
    if (!password.any { it.isDigit() }) {
        errors.add("Password must contain at least one number")
    }
    
    return errors
}






