package com.triplink.mobile.ui.screens.agent

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.navigation.NavController
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.components.AuthModal
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import com.triplink.mobile.ui.viewmodel.ViewModelFactory
import kotlinx.coroutines.launch

@Composable
fun ApplyAsAgentScreen(
    navController: NavController
) {
    var showAuthModal by remember { mutableStateOf(false) }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var company by remember { mutableStateOf("") }
    var licenseNumber by remember { mutableStateOf("") }
    var experience by remember { mutableStateOf("") }
    var motivation by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var success by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val appContainer = LocalAppContainer.current
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundCream)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Navbar(
                navController = navController,
                user = null, // TODO: Get from auth state
                onOpenAuth = { showAuthModal = true },
                onLogout = {}
            )
            
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.Default.Work,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = Purple600
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Become a Travel Agent",
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Join our network of professional travel agents",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
                
                if (success) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = Color(0xFF4CAF50).copy(alpha = 0.2f)
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFF4CAF50),
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Application Submitted!",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "We'll review your application and get back to you soon.",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                } else {
                    // Application Form
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            error?.let { errorMsg ->
                                Text(
                                    text = errorMsg,
                                    color = MaterialTheme.colorScheme.error,
                                    style = MaterialTheme.typography.bodySmall
                                )
                            }
                            
                            OutlinedTextField(
                                value = firstName,
                                onValueChange = { firstName = it },
                                label = { Text("First Name") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            
                            OutlinedTextField(
                                value = lastName,
                                onValueChange = { lastName = it },
                                label = { Text("Last Name") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            
                            OutlinedTextField(
                                value = email,
                                onValueChange = { email = it },
                                label = { Text("Email") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            
                            OutlinedTextField(
                                value = phone,
                                onValueChange = { phone = it },
                                label = { Text("Phone") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            
                            OutlinedTextField(
                                value = company,
                                onValueChange = { company = it },
                                label = { Text("Company (Optional)") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            
                            OutlinedTextField(
                                value = licenseNumber,
                                onValueChange = { licenseNumber = it },
                                label = { Text("License Number (Optional)") },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            
                            OutlinedTextField(
                                value = experience,
                                onValueChange = { experience = it },
                                label = { Text("Experience (Optional)") },
                                modifier = Modifier.fillMaxWidth(),
                                minLines = 2,
                                maxLines = 4
                            )
                            
                            OutlinedTextField(
                                value = motivation,
                                onValueChange = { motivation = it },
                                label = { Text("Why do you want to become an agent?") },
                                modifier = Modifier.fillMaxWidth(),
                                minLines = 3,
                                maxLines = 5
                            )
                            
                            Button(
                                onClick = {
                                    if (firstName.isBlank() || lastName.isBlank() || email.isBlank() || phone.isBlank()) {
                                        error = "Please fill in all required fields"
                                    } else {
                                        scope.launch {
                                            isLoading = true
                                            error = null
                                            val result = appContainer.agentRepository.submitAgentApplication(
                                                com.triplink.mobile.data.model.AgentApplicationRequest(
                                                    firstName = firstName,
                                                    lastName = lastName,
                                                    email = email,
                                                    phone = phone,
                                                    company = company.takeIf { it.isNotBlank() },
                                                    licenseNumber = licenseNumber.takeIf { it.isNotBlank() },
                                                    experience = experience.takeIf { it.isNotBlank() },
                                                    motivation = motivation.takeIf { it.isNotBlank() }
                                                )
                                            )
                                            result.onSuccess {
                                                success = true
                                                isLoading = false
                                            }.onFailure {
                                                error = it.message ?: "Failed to submit application"
                                                isLoading = false
                                            }
                                        }
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(56.dp),
                                enabled = !isLoading,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color.Transparent
                                )
                            ) {
                                if (isLoading) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(24.dp),
                                        color = Color.White
                                    )
                                } else {
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
                                        Text(
                                            text = "Submit Application",
                                            color = Color.White,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (showAuthModal) {
            val authViewModel = androidx.lifecycle.viewmodel.compose.viewModel<com.triplink.mobile.ui.viewmodel.AuthViewModel>(
                factory = ViewModelFactory(
                    authRepository = LocalAppContainer.current.authRepository,
                    destinationRepository = LocalAppContainer.current.destinationRepository,
                    apiService = LocalAppContainer.current.apiService
                )
            )
            AuthModal(
                isOpen = showAuthModal,
                onClose = { showAuthModal = false },
                viewModel = authViewModel
            )
        }
    }
}

