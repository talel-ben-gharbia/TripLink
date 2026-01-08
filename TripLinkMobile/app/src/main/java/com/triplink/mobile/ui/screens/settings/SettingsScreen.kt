package com.triplink.mobile.ui.screens.settings

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.navigation.Screen
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.components.TravelDocuments
import com.triplink.mobile.ui.theme.BackgroundCream
import com.triplink.mobile.ui.theme.Purple600
import com.triplink.mobile.ui.utils.TextUtils
import com.triplink.mobile.ui.viewmodel.SettingsViewModel
import com.triplink.mobile.ui.viewmodel.ViewModelFactory
import java.io.File

@Composable
fun SettingsScreen(
    navController: NavController,
    viewModel: SettingsViewModel = viewModel(
        factory = ViewModelFactory(
            authRepository = LocalAppContainer.current.authRepository,
            destinationRepository = LocalAppContainer.current.destinationRepository,
            apiService = LocalAppContainer.current.apiService
        )
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    
    var showDeleteConfirm by remember { mutableStateOf(false) }
    var showPasswordSection by remember { mutableStateOf(false) }
    var showUpdateForm by remember { mutableStateOf(false) }
    var deletePassword by remember { mutableStateOf("") }
    
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showCurrentPwd by remember { mutableStateOf(false) }
    var showNewPwd by remember { mutableStateOf(false) }
    var showConfirmPwd by remember { mutableStateOf(false) }
    
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var selectedTravelStyles by remember { mutableStateOf<Set<String>>(emptySet()) }
    var selectedInterests by remember { mutableStateOf<Set<String>>(emptySet()) }
    var avatarUri by remember { mutableStateOf<Uri?>(null) }
    
    val travelStylesOptions = listOf("Adventure", "Luxury", "Budget", "Cultural", "Beach", "Mountains")
    val interestsOptions = listOf("Photography", "Food", "Shopping", "Nature", "History", "Nightlife")
    
    // Initialize form data when user loads
    LaunchedEffect(uiState.user) {
        uiState.user?.let { user ->
            firstName = user.firstName ?: ""
            lastName = user.lastName ?: ""
            phone = user.phone ?: ""
            selectedTravelStyles = user.travelStyles?.toSet() ?: emptySet()
            selectedInterests = user.interests?.toSet() ?: emptySet()
        }
    }
    
    // Image picker
    val imagePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            avatarUri = it
            // Convert URI to File and upload
            try {
                val inputStream = context.contentResolver.openInputStream(it)
                val file = File(context.cacheDir, "avatar_${System.currentTimeMillis()}.jpg")
                inputStream?.use { input ->
                    file.outputStream().use { output ->
                        input.copyTo(output)
                    }
                }
                viewModel.uploadAvatar(file)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
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
                user = uiState.user,
                onOpenAuth = { navController.navigate(Screen.Home.route) },
                onLogout = {
                    viewModel.refresh()
                    navController.navigate(Screen.Home.route) {
                        popUpTo("home") { inclusive = true }
                    }
                }
            )
            
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else if (uiState.user == null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "Please log in to view settings",
                            style = MaterialTheme.typography.titleLarge
                        )
                        Button(onClick = { navController.navigate(Screen.Home.route) }) {
                            Text("Go to Home")
                        }
                    }
                }
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Settings",
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Text(
                        text = "Manage your account settings and preferences",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Update Profile Section
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(
                                    Icons.Default.Shield,
                                    null,
                                    tint = Color(0xFF3B82F6),
                                    modifier = Modifier.size(24.dp)
                                )
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Update Profile",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = "Update your personal information",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                    )
                                }
                                Button(
                                    onClick = { showUpdateForm = !showUpdateForm },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFF3B82F6)
                                    )
                                ) {
                                    Text("Update Profile")
                                }
                            }
                            
                            if (showUpdateForm) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp)
                                        .background(
                                            Color(0xFFDBEAFE),
                                            RoundedCornerShape(12.dp)
                                        )
                                        .padding(16.dp),
                                    verticalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    Text(
                                        text = "Update Your Profile Information",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    
                                    // Avatar
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(64.dp)
                                                .clip(CircleShape)
                                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                                .clickable { imagePicker.launch("image/*") },
                                            contentAlignment = Alignment.Center
                                        ) {
                                            when {
                                                avatarUri != null -> {
                                                    AsyncImage(
                                                        model = avatarUri,
                                                        contentDescription = "Avatar",
                                                        modifier = Modifier.fillMaxSize(),
                                                        contentScale = ContentScale.Crop
                                                    )
                                                }
                                                uiState.user?.profileImage != null -> {
                                                    AsyncImage(
                                                        model = uiState.user?.profileImage,
                                                        contentDescription = "Avatar",
                                                        modifier = Modifier.fillMaxSize(),
                                                        contentScale = ContentScale.Crop
                                                    )
                                                }
                                                else -> {
                                                    Icon(
                                                        Icons.Default.Person,
                                                        null,
                                                        modifier = Modifier.size(32.dp)
                                                    )
                                                }
                                            }
                                        }
                                        Column {
                                            Text(
                                                text = "Profile Picture",
                                                style = MaterialTheme.typography.labelMedium
                                            )
                                            TextButton(onClick = { imagePicker.launch("image/*") }) {
                                                Text("Change Avatar")
                                            }
                                        }
                                    }
                                    
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        OutlinedTextField(
                                            value = firstName,
                                            onValueChange = { firstName = it },
                                            label = { Text("First Name") },
                                            modifier = Modifier.weight(1f),
                                            singleLine = true
                                        )
                                        
                                        OutlinedTextField(
                                            value = lastName,
                                            onValueChange = { lastName = it },
                                            label = { Text("Last Name") },
                                            modifier = Modifier.weight(1f),
                                            singleLine = true
                                        )
                                    }
                                    
                                    OutlinedTextField(
                                        value = uiState.user?.email ?: "",
                                        onValueChange = {},
                                        label = { Text("Email (cannot be changed)") },
                                        modifier = Modifier.fillMaxWidth(),
                                        enabled = false,
                                        singleLine = true
                                    )
                                    
                                    OutlinedTextField(
                                        value = phone,
                                        onValueChange = { phone = it },
                                        label = { Text("Phone Number") },
                                        modifier = Modifier.fillMaxWidth(),
                                        singleLine = true
                                    )
                                    
                                    // Travel Styles
                                    Text(
                                        text = "Travel Styles",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.SemiBold
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
                                    
                                    // Interests
                                    Text(
                                        text = "Interests (Select all that apply)",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.SemiBold
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
                                    
                                    uiState.updateError?.let { error ->
                                        Text(
                                            text = error,
                                            color = MaterialTheme.colorScheme.error,
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    }
                                    
                                    if (uiState.updateSuccess) {
                                        Text(
                                            text = "Profile updated successfully!",
                                            color = Color(0xFF4CAF50),
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    }
                                    
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Button(
                                            onClick = {
                                                viewModel.updateProfile(
                                                    firstName = firstName.takeIf { it.isNotEmpty() },
                                                    lastName = lastName.takeIf { it.isNotEmpty() },
                                                    phone = phone.takeIf { it.isNotEmpty() },
                                                    travelStyles = selectedTravelStyles.toList().takeIf { it.isNotEmpty() },
                                                    interests = selectedInterests.toList().takeIf { it.isNotEmpty() }
                                                )
                                            },
                                            modifier = Modifier.weight(1f),
                                            enabled = !uiState.saving
                                        ) {
                                            if (uiState.saving) {
                                                CircularProgressIndicator(
                                                    modifier = Modifier.size(16.dp),
                                                    color = MaterialTheme.colorScheme.onPrimary
                                                )
                                                Spacer(modifier = Modifier.width(8.dp))
                                            }
                                            Text("Save All Changes")
                                        }
                                        
                                        OutlinedButton(
                                            onClick = {
                                                showUpdateForm = false
                                                viewModel.clearUpdateMessages()
                                            },
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Text("Cancel")
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // Change Password Section
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    null,
                                    tint = Purple600,
                                    modifier = Modifier.size(24.dp)
                                )
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Change Password",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = "Update your password. Email cannot be changed.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                    )
                                }
                                Button(
                                    onClick = { showPasswordSection = !showPasswordSection },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Purple600
                                    )
                                ) {
                                    Icon(
                                        if (showPasswordSection) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                                        null,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(if (showPasswordSection) "Hide" else "Show")
                                }
                            }
                            
                            if (showPasswordSection) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 16.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    OutlinedTextField(
                                        value = currentPassword,
                                        onValueChange = { currentPassword = it },
                                        label = { Text("Current Password") },
                                        modifier = Modifier.fillMaxWidth(),
                                        leadingIcon = { Icon(Icons.Default.Lock, null) },
                                        trailingIcon = {
                                            IconButton(onClick = { showCurrentPwd = !showCurrentPwd }) {
                                                Icon(
                                                    if (showCurrentPwd) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                                    null
                                                )
                                            }
                                        },
                                        visualTransformation = if (showCurrentPwd) VisualTransformation.None else PasswordVisualTransformation(),
                                        singleLine = true
                                    )
                                    
                                    OutlinedTextField(
                                        value = newPassword,
                                        onValueChange = { newPassword = it },
                                        label = { Text("New Password") },
                                        modifier = Modifier.fillMaxWidth(),
                                        leadingIcon = { Icon(Icons.Default.Lock, null) },
                                        trailingIcon = {
                                            IconButton(onClick = { showNewPwd = !showNewPwd }) {
                                                Icon(
                                                    if (showNewPwd) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                                    null
                                                )
                                            }
                                        },
                                        visualTransformation = if (showNewPwd) VisualTransformation.None else PasswordVisualTransformation(),
                                        singleLine = true,
                                        supportingText = {
                                            Text(
                                                text = "Min 8 chars, include upper, lower, number.",
                                                style = MaterialTheme.typography.bodySmall
                                            )
                                        }
                                    )
                                    
                                    OutlinedTextField(
                                        value = confirmPassword,
                                        onValueChange = { confirmPassword = it },
                                        label = { Text("Confirm New Password") },
                                        modifier = Modifier.fillMaxWidth(),
                                        leadingIcon = { Icon(Icons.Default.Lock, null) },
                                        trailingIcon = {
                                            IconButton(onClick = { showConfirmPwd = !showConfirmPwd }) {
                                                Icon(
                                                    if (showConfirmPwd) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                                    null
                                                )
                                            }
                                        },
                                        visualTransformation = if (showConfirmPwd) VisualTransformation.None else PasswordVisualTransformation(),
                                        singleLine = true
                                    )
                                    
                                    uiState.passwordError?.let { error ->
                                        Text(
                                            text = error,
                                            color = MaterialTheme.colorScheme.error,
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    }
                                    
                                    if (uiState.passwordSuccess) {
                                        Text(
                                            text = "Password changed successfully",
                                            color = Color(0xFF4CAF50),
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    }
                                    
                                    Button(
                                        onClick = {
                                            viewModel.changePassword(currentPassword, newPassword, confirmPassword)
                                        },
                                        modifier = Modifier.fillMaxWidth(),
                                        enabled = !uiState.saving
                                    ) {
                                        if (uiState.saving) {
                                            CircularProgressIndicator(
                                                modifier = Modifier.size(16.dp),
                                                color = MaterialTheme.colorScheme.onPrimary
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                        }
                                        Text("Update Password")
                                    }
                                }
                            }
                        }
                    }
                    
                    // Travel Documents
                    TravelDocuments(
                        travelDocumentRepository = LocalAppContainer.current.travelDocumentRepository
                    )
                    
                    // Delete Account Section
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
                        ),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(
                                    Icons.Default.Delete,
                                    null,
                                    tint = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.size(24.dp)
                                )
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Delete Account",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MaterialTheme.colorScheme.error
                                    )
                                    Text(
                                        text = "Permanently delete your account and all associated data. This action cannot be undone.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                    )
                                }
                            }
                            
                            Button(
                                onClick = { showDeleteConfirm = true },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.error
                                )
                            ) {
                                Icon(Icons.Default.Delete, null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Delete Account")
                            }
                            
                            if (showDeleteConfirm) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp)
                                        .background(
                                            Color(0xFFFEE2E2),
                                            RoundedCornerShape(12.dp)
                                        )
                                        .padding(16.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.Top,
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Warning,
                                            null,
                                            tint = MaterialTheme.colorScheme.error,
                                            modifier = Modifier.size(24.dp)
                                        )
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = "⚠️ Warning: This action is irreversible!",
                                                style = MaterialTheme.typography.titleMedium,
                                                fontWeight = FontWeight.Bold,
                                                color = MaterialTheme.colorScheme.error
                                            )
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Text(
                                                text = "Deleting your account will permanently remove all your data including:",
                                                style = MaterialTheme.typography.bodyMedium,
                                                color = MaterialTheme.colorScheme.error
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                text = "• Your profile information\n• Travel preferences and personality assessments\n• All saved data and preferences",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.error
                                            )
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Text(
                                                text = "This action cannot be undone. Are you absolutely sure?",
                                                style = MaterialTheme.typography.bodyMedium,
                                                fontWeight = FontWeight.SemiBold,
                                                color = MaterialTheme.colorScheme.error
                                            )
                                        }
                                    }
                                    
                                    OutlinedTextField(
                                        value = deletePassword,
                                        onValueChange = { deletePassword = it },
                                        label = { Text("Confirm with your password:") },
                                        modifier = Modifier.fillMaxWidth(),
                                        visualTransformation = PasswordVisualTransformation(),
                                        singleLine = true
                                    )
                                    
                                    uiState.deleteError?.let { error ->
                                        Text(
                                            text = error,
                                            color = MaterialTheme.colorScheme.error,
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    }
                                    
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Button(
                                            onClick = {
                                                viewModel.deleteAccount(deletePassword)
                                                if (uiState.user == null) {
                                                    navController.navigate(Screen.Home.route) {
                                                        popUpTo(Screen.Home.route) { inclusive = true }
                                                    }
                                                }
                                            },
                                            modifier = Modifier.weight(1f),
                                            enabled = deletePassword.isNotEmpty() && !uiState.saving,
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = MaterialTheme.colorScheme.error
                                            )
                                        ) {
                                            if (uiState.saving) {
                                                CircularProgressIndicator(
                                                    modifier = Modifier.size(16.dp),
                                                    color = MaterialTheme.colorScheme.onError
                                                )
                                                Spacer(modifier = Modifier.width(8.dp))
                                            }
                                            Text("Yes, Delete My Account")
                                        }
                                        
                                        OutlinedButton(
                                            onClick = {
                                                showDeleteConfirm = false
                                                deletePassword = ""
                                            },
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Text("Cancel")
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
}
