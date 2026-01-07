package com.triplink.mobile.ui.components

import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600

enum class AuthMode {
    LOGIN, REGISTER, FORGOT_PASSWORD
}

enum class RegistrationStep {
    ACCOUNT_INFO, PERSONAL_INFO, TRAVEL_PREFERENCES
}

@Composable
fun AuthModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    viewModel: com.triplink.mobile.ui.viewmodel.AuthViewModel,
    onLoginSuccess: () -> Unit = {},
    onRegisterSuccess: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    var mode by remember { mutableStateOf(AuthMode.LOGIN) }
    var registrationStep by remember { mutableStateOf(RegistrationStep.ACCOUNT_INFO) }
    var showPassword by remember { mutableStateOf(false) }
    var showConfirmPassword by remember { mutableStateOf(false) }
    
    // Step 1: Account Info
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    
    // Step 2: Personal Info
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var profileImageUri by remember { mutableStateOf<Uri?>(null) }
    
    // Step 3: Travel Preferences
    val travelStylesOptions = listOf("Adventure", "Luxury", "Budget", "Family", "Romantic", "Solo", "Business", "Cultural")
    val interestsOptions = listOf("Beaches", "Mountains", "Cities", "Nature", "History", "Food", "Nightlife", "Shopping", "Sports", "Art")
    var selectedTravelStyles by remember { mutableStateOf<Set<String>>(emptySet()) }
    var selectedInterests by remember { mutableStateOf<Set<String>>(emptySet()) }
    
    var isLoading = uiState.isLoading
    var errorMessage = uiState.error
    
    // Handle success
    LaunchedEffect(uiState.loginSuccess) {
        if (uiState.loginSuccess) {
            viewModel.clearSuccessFlags()
            onLoginSuccess()
            onClose()
        }
    }
    
    LaunchedEffect(uiState.registerSuccess) {
        if (uiState.registerSuccess) {
            viewModel.clearSuccessFlags()
            onRegisterSuccess()
            onClose()
        }
    }

    if (isOpen) {
        Dialog(
            onDismissRequest = onClose,
            properties = DialogProperties(
                usePlatformDefaultWidth = false,
                decorFitsSystemWindows = false
            )
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.9f)
                    .padding(16.dp),
                shape = RoundedCornerShape(24.dp),
                color = MaterialTheme.colorScheme.surface
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (mode == AuthMode.LOGIN) "Sign In" else "Sign Up",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                        IconButton(onClick = onClose) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close"
                            )
                        }
                    }

                    // Security badges
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.padding(vertical = 8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFF4CAF50),
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Secure",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = Purple600,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Fast",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }

                    // Error message
                    errorMessage?.let { error ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.errorContainer
                            )
                        ) {
                            Text(
                                text = error,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onErrorContainer,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }

                    // Registration Step Indicator
                    if (mode == AuthMode.REGISTER) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            (1..3).forEach { step ->
                                val stepEnum = when (step) {
                                    1 -> RegistrationStep.ACCOUNT_INFO
                                    2 -> RegistrationStep.PERSONAL_INFO
                                    else -> RegistrationStep.TRAVEL_PREFERENCES
                                }
                                val isActive = registrationStep == stepEnum
                                val isCompleted = when (registrationStep) {
                                    RegistrationStep.ACCOUNT_INFO -> step < 1
                                    RegistrationStep.PERSONAL_INFO -> step < 2
                                    RegistrationStep.TRAVEL_PREFERENCES -> step < 3
                                }
                                
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .background(
                                            color = if (isActive || isCompleted) Purple600 else Color.Gray.copy(alpha = 0.3f),
                                            shape = CircleShape
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = step.toString(),
                                        color = if (isActive || isCompleted) Color.White else Color.Gray,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                
                                if (step < 3) {
                                    Box(
                                        modifier = Modifier
                                            .width(40.dp)
                                            .height(2.dp)
                                            .background(
                                                color = if (step < when (registrationStep) {
                                                    RegistrationStep.ACCOUNT_INFO -> 1
                                                    RegistrationStep.PERSONAL_INFO -> 2
                                                    RegistrationStep.TRAVEL_PREFERENCES -> 3
                                                }) Purple600 else Color.Gray.copy(alpha = 0.3f)
                                            )
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // Form fields
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        if (mode == AuthMode.LOGIN) {
                            // Login form
                            OutlinedTextField(
                                value = email,
                                onValueChange = { email = it },
                                label = { Text("Email") },
                                modifier = Modifier.fillMaxWidth(),
                                leadingIcon = {
                                    Icon(Icons.Default.Email, null)
                                },
                                singleLine = true
                            )

                            OutlinedTextField(
                                value = password,
                                onValueChange = { password = it },
                                label = { Text("Password") },
                                modifier = Modifier.fillMaxWidth(),
                                leadingIcon = {
                                    Icon(Icons.Default.Lock, null)
                                },
                                trailingIcon = {
                                    IconButton(onClick = { showPassword = !showPassword }) {
                                        Icon(
                                            imageVector = if (showPassword) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                            contentDescription = if (showPassword) "Hide password" else "Show password"
                                        )
                                    }
                                },
                                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                                singleLine = true
                            )
                        } else if (mode == AuthMode.REGISTER) {
                            // Registration form - Step 1: Account Info
                            if (registrationStep == RegistrationStep.ACCOUNT_INFO) {
                                Text(
                                    text = "Account Information",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(bottom = 8.dp)
                                )
                                
                                OutlinedTextField(
                                    value = email,
                                    onValueChange = { email = it },
                                    label = { Text("Email") },
                                    modifier = Modifier.fillMaxWidth(),
                                    leadingIcon = {
                                        Icon(Icons.Default.Email, null)
                                    },
                                    singleLine = true
                                )

                                OutlinedTextField(
                                    value = password,
                                    onValueChange = { password = it },
                                    label = { Text("Password") },
                                    modifier = Modifier.fillMaxWidth(),
                                    leadingIcon = {
                                        Icon(Icons.Default.Lock, null)
                                    },
                                    trailingIcon = {
                                        IconButton(onClick = { showPassword = !showPassword }) {
                                            Icon(
                                                imageVector = if (showPassword) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                                contentDescription = if (showPassword) "Hide password" else "Show password"
                                            )
                                        }
                                    },
                                    visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                                    singleLine = true
                                )

                                OutlinedTextField(
                                    value = confirmPassword,
                                    onValueChange = { confirmPassword = it },
                                    label = { Text("Confirm Password") },
                                    modifier = Modifier.fillMaxWidth(),
                                    leadingIcon = {
                                        Icon(Icons.Default.Lock, null)
                                    },
                                    trailingIcon = {
                                        IconButton(onClick = { showConfirmPassword = !showConfirmPassword }) {
                                            Icon(
                                                imageVector = if (showConfirmPassword) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                                contentDescription = if (showConfirmPassword) "Hide password" else "Show password"
                                            )
                                        }
                                    },
                                    visualTransformation = if (showConfirmPassword) VisualTransformation.None else PasswordVisualTransformation(),
                                    singleLine = true
                                )
                                
                                if (password.isNotEmpty() && password != confirmPassword) {
                                    Text(
                                        text = "Passwords do not match",
                                        color = MaterialTheme.colorScheme.error,
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }
                            }
                            
                            // Step 2: Personal Info and Profile
                            if (registrationStep == RegistrationStep.PERSONAL_INFO) {
                                Text(
                                    text = "Personal Information",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(bottom = 8.dp)
                                )
                                
                                // Profile Image Upload
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 16.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(100.dp)
                                                .clip(CircleShape)
                                                .background(
                                                    brush = Brush.horizontalGradient(
                                                        colors = listOf(Purple600, Blue500)
                                                    )
                                                )
                                                .border(4.dp, Color.White, CircleShape)
                                                .clickable {
                                                    // TODO: Implement image picker
                                                    // For now, this is a placeholder
                                                },
                                            contentAlignment = Alignment.Center
                                        ) {
                                            if (profileImageUri != null) {
                                                Image(
                                                    painter = rememberAsyncImagePainter(
                                                        ImageRequest.Builder(context)
                                                            .data(profileImageUri)
                                                            .build()
                                                    ),
                                                    contentDescription = "Profile Image",
                                                    modifier = Modifier.fillMaxSize(),
                                                    contentScale = ContentScale.Crop
                                                )
                                            } else {
                                                Icon(
                                                    imageVector = Icons.Default.Camera,
                                                    contentDescription = "Upload Profile Image",
                                                    tint = Color.White,
                                                    modifier = Modifier.size(40.dp)
                                                )
                                            }
                                        }
                                        Text(
                                            text = "Upload Profile Picture (Optional)",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    OutlinedTextField(
                                        value = firstName,
                                        onValueChange = { firstName = it },
                                        label = { Text("First Name") },
                                        modifier = Modifier.weight(1f),
                                        leadingIcon = {
                                            Icon(Icons.Default.Person, null)
                                        },
                                        singleLine = true
                                    )

                                    OutlinedTextField(
                                        value = lastName,
                                        onValueChange = { lastName = it },
                                        label = { Text("Last Name") },
                                        modifier = Modifier.weight(1f),
                                        leadingIcon = {
                                            Icon(Icons.Default.Person, null)
                                        },
                                        singleLine = true
                                    )
                                }

                                OutlinedTextField(
                                    value = phone,
                                    onValueChange = { phone = it.filter { it.isDigit() } },
                                    label = { Text("Phone (Optional)") },
                                    modifier = Modifier.fillMaxWidth(),
                                    leadingIcon = {
                                        Icon(Icons.Default.Phone, null)
                                    },
                                    singleLine = true
                                )
                            }
                            
                            // Step 3: Travel Preferences
                            if (registrationStep == RegistrationStep.TRAVEL_PREFERENCES) {
                                Text(
                                    text = "Travel Preferences",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(bottom = 8.dp)
                                )
                                
                                Text(
                                    text = "Travel Styles (Select all that apply)",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(top = 8.dp, bottom = 8.dp)
                                )
                                
                                FlowRow(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    travelStylesOptions.forEach { style ->
                                        FilterChip(
                                            selected = selectedTravelStyles.contains(style),
                                            onClick = {
                                                selectedTravelStyles = if (selectedTravelStyles.contains(style)) {
                                                    selectedTravelStyles - style
                                                } else {
                                                    selectedTravelStyles + style
                                                }
                                            },
                                            label = { Text(style) }
                                        )
                                    }
                                }
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                Text(
                                    text = "Interests (Select all that apply)",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(top = 8.dp, bottom = 8.dp)
                                )
                                
                                FlowRow(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    interestsOptions.forEach { interest ->
                                        FilterChip(
                                            selected = selectedInterests.contains(interest),
                                            onClick = {
                                                selectedInterests = if (selectedInterests.contains(interest)) {
                                                    selectedInterests - interest
                                                } else {
                                                    selectedInterests + interest
                                                }
                                            },
                                            label = { Text(interest) }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Submit button
                    Button(
                        onClick = {
                            errorMessage = null
                            if (mode == AuthMode.LOGIN) {
                                viewModel.login(email, password)
                            } else {
                                // Handle 3-step registration
                                when (registrationStep) {
                                    RegistrationStep.ACCOUNT_INFO -> {
                                        if (password == confirmPassword && email.isNotEmpty() && password.length >= 8) {
                                            registrationStep = RegistrationStep.PERSONAL_INFO
                                        } else {
                                            errorMessage = if (password != confirmPassword) {
                                                "Passwords do not match"
                                            } else if (password.length < 8) {
                                                "Password must be at least 8 characters"
                                            } else {
                                                "Please fill in all required fields"
                                            }
                                        }
                                    }
                                    RegistrationStep.PERSONAL_INFO -> {
                                        if (firstName.isNotEmpty() && lastName.isNotEmpty()) {
                                            registrationStep = RegistrationStep.TRAVEL_PREFERENCES
                                        } else {
                                            errorMessage = "Please fill in first and last name"
                                        }
                                    }
                                    RegistrationStep.TRAVEL_PREFERENCES -> {
                                        // Complete registration
                                        viewModel.register(
                                            email = email,
                                            password = password,
                                            firstName = firstName,
                                            lastName = lastName,
                                            phone = phone.takeIf { it.isNotEmpty() },
                                            travelStyles = selectedTravelStyles.toList(),
                                            interests = selectedInterests.toList()
                                        )
                                    }
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        enabled = !isLoading && when {
                            mode == AuthMode.LOGIN -> email.isNotEmpty() && password.isNotEmpty()
                            registrationStep == RegistrationStep.ACCOUNT_INFO -> 
                                email.isNotEmpty() && password.isNotEmpty() && confirmPassword.isNotEmpty()
                            registrationStep == RegistrationStep.PERSONAL_INFO -> 
                                firstName.isNotEmpty() && lastName.isNotEmpty()
                            else -> true // Travel preferences step - all fields optional
                        },
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
                            if (isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    color = Color.White
                                )
                            } else {
                                Text(
                                    text = when {
                                        mode == AuthMode.LOGIN -> "Sign in"
                                        registrationStep == RegistrationStep.TRAVEL_PREFERENCES -> "Complete Registration"
                                        else -> "Continue"
                                    },
                                    color = Color.White,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                    
                    // Back button for registration steps
                    if (mode == AuthMode.REGISTER && registrationStep != RegistrationStep.ACCOUNT_INFO) {
                        TextButton(
                            onClick = {
                                registrationStep = when (registrationStep) {
                                    RegistrationStep.PERSONAL_INFO -> RegistrationStep.ACCOUNT_INFO
                                    RegistrationStep.TRAVEL_PREFERENCES -> RegistrationStep.PERSONAL_INFO
                                    else -> RegistrationStep.ACCOUNT_INFO
                                }
                            }
                        ) {
                            Text("Back")
                        }
                    }

                    // Mode toggle
                    TextButton(
                        onClick = {
                            mode = if (mode == AuthMode.LOGIN) AuthMode.REGISTER else AuthMode.LOGIN
                            registrationStep = RegistrationStep.ACCOUNT_INFO
                            errorMessage = null
                        }
                    ) {
                        Text(
                            text = if (mode == AuthMode.LOGIN) {
                                "Don't have an account? Sign up"
                            } else {
                                "Already have an account? Sign in"
                            }
                        )
                    }

                    // Forgot password
                    if (mode == AuthMode.LOGIN) {
                        TextButton(onClick = { mode = AuthMode.FORGOT_PASSWORD }) {
                            Text("Forgot Password?")
                        }
                    }
                    
                    // Forgot password form
                    if (mode == AuthMode.FORGOT_PASSWORD) {
                        ForgotPasswordForm(
                            onBack = { mode = AuthMode.LOGIN },
                            onSuccess = { mode = AuthMode.LOGIN },
                            authRepository = viewModel.authRepository
                        )
                    }
                }
            }
        }
    }
}

