package com.triplink.mobile.ui.screens.auth

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
import androidx.navigation.NavController
import com.triplink.mobile.navigation.Screen
import com.triplink.mobile.ui.components.Footer
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream

@Composable
fun EmailVerificationScreen(navController: NavController) {
    var status by remember { mutableStateOf<String?>(null) }
    var message by remember { mutableStateOf<String?>(null) }
    var resending by remember { mutableStateOf(false) }
    var resendMessage by remember { mutableStateOf("") }
    
    // TODO: Extract status and message from navigation arguments or query params
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundCream)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Navbar(navController = navController, user = null, onOpenAuth = {}, onLogout = {})
            
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth(0.9f)
                        .padding(32.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        if (status == "success") {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                modifier = Modifier.size(80.dp),
                                tint = Color(0xFF4CAF50)
                            )
                            Text(
                                text = "Email Verified!",
                                style = MaterialTheme.typography.headlineLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Your email has been successfully verified. You will be redirected to the login page shortly.",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            if (resending) {
                                LoadingSpinner()
                            }
                        } else {
                            Icon(
                                imageVector = Icons.Default.Error,
                                contentDescription = null,
                                modifier = Modifier.size(80.dp),
                                tint = Color(0xFFF44336)
                            )
                            Text(
                                text = "Verification Failed",
                                style = MaterialTheme.typography.headlineLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = message ?: "The verification link is invalid or has expired.",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            
                            Button(
                                onClick = {
                                    // TODO: Implement resend verification
                                    resending = true
                                },
                                enabled = !resending,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                if (resending) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(20.dp),
                                        color = Color.White
                                    )
                                } else {
                                    Icon(Icons.Default.Email, null)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Resend Verification Email")
                                }
                            }
                            
                            if (resendMessage.isNotEmpty()) {
                                Text(
                                    text = resendMessage,
                                    color = Color(0xFF4CAF50),
                                    style = MaterialTheme.typography.bodySmall
                                )
                            }
                            
                            TextButton(
                                onClick = { navController.navigate(Screen.Home.route) },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.ArrowBack, null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Go to Home")
                            }
                        }
                    }
                }
            }
            
            Footer(navController = navController)
        }
    }
}

