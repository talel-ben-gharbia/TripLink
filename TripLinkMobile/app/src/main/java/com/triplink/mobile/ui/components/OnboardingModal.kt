package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.triplink.mobile.data.repository.AuthRepository
import com.triplink.mobile.data.repository.DestinationRepository
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import kotlinx.coroutines.launch

enum class OnboardingStep {
    TRAVEL_STYLE, CATEGORIES_TAGS, BUDGET
}

@Composable
fun OnboardingModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    authRepository: AuthRepository,
    destinationRepository: DestinationRepository,
    onComplete: () -> Unit = {},
    onSkip: () -> Unit = {}
) {
    var currentStep by remember { mutableStateOf(OnboardingStep.TRAVEL_STYLE) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    
    // Step 1: Travel Style
    val travelStyles = listOf(
        "Budget Traveler" to "💰",
        "Luxury Seeker" to "✨",
        "Adventure Enthusiast" to "🏔️",
        "Relaxation Seeker" to "🏖️",
        "Culture Explorer" to "🏛️",
        "Family Traveler" to "👨‍👩‍👧‍👦"
    )
    var selectedTravelStyle by remember { mutableStateOf<String?>(null) }
    
    // Step 2: Categories & Tags
    var categories by remember { mutableStateOf<List<String>>(emptyList()) }
    var tags by remember { mutableStateOf<List<String>>(emptyList()) }
    var selectedCategories by remember { mutableStateOf<Set<String>>(emptySet()) }
    var selectedTags by remember { mutableStateOf<Set<String>>(emptySet()) }
    var loadingOptions by remember { mutableStateOf(true) }
    
    // Step 3: Budget
    var budgetMin by remember { mutableStateOf(100) }
    var budgetMax by remember { mutableStateOf(5000) }
    
    // Load categories and tags
    LaunchedEffect(isOpen) {
        if (isOpen && categories.isEmpty()) {
            loadingOptions = true
            scope.launch {
                val catsResult = destinationRepository.getAllCategories()
                val tagsResult = destinationRepository.getAllTags()
                
                catsResult.onSuccess { cats ->
                    categories = cats
                }
                tagsResult.onSuccess { tagList ->
                    tags = tagList.take(20) // Limit to 20 tags like front-end
                }
                loadingOptions = false
            }
        }
    }
    
    if (isOpen) {
        Dialog(
            onDismissRequest = onSkip,
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
                        .padding(24.dp)
                ) {
                    // Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Welcome to TripLink!",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold,
                                color = Purple600
                            )
                            Text(
                                text = "Let's personalize your experience",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        IconButton(onClick = onSkip) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close"
                            )
                        }
                    }
                    
                    // Progress Bar
                    Spacer(modifier = Modifier.height(16.dp))
                    val stepNumber = when (currentStep) {
                        OnboardingStep.TRAVEL_STYLE -> 1
                        OnboardingStep.CATEGORIES_TAGS -> 2
                        OnboardingStep.BUDGET -> 3
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Step $stepNumber of 3",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "${(stepNumber * 100 / 3)}%",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { stepNumber / 3f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp),
                        color = Purple600,
                        trackColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
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
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    
                    // Content
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Step 1: Travel Style
                        if (currentStep == OnboardingStep.TRAVEL_STYLE) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = null,
                                    modifier = Modifier.size(48.dp),
                                    tint = Purple600
                                )
                                Text(
                                    text = "What's your travel style?",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = "Help us recommend destinations you'll love",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                
                                Spacer(modifier = Modifier.height(8.dp))
                                
                                // Travel style options
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    travelStyles.chunked(2).forEach { rowStyles ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                                        ) {
                                            rowStyles.forEach { (label, emoji) ->
                                                val isSelected = selectedTravelStyle == label
                                                if (isSelected) {
                                                    Button(
                                                        onClick = { selectedTravelStyle = label },
                                                        modifier = Modifier
                                                            .weight(1f)
                                                            .height(100.dp),
                                                        colors = ButtonDefaults.buttonColors(
                                                            containerColor = Purple600
                                                        ),
                                                        shape = RoundedCornerShape(12.dp)
                                                    ) {
                                                        Column(
                                                            horizontalAlignment = Alignment.CenterHorizontally,
                                                            verticalArrangement = Arrangement.spacedBy(8.dp)
                                                        ) {
                                                            Text(
                                                                text = emoji,
                                                                style = MaterialTheme.typography.headlineMedium
                                                            )
                                                            Text(
                                                                text = label,
                                                                style = MaterialTheme.typography.bodySmall,
                                                                color = Color.White
                                                            )
                                                        }
                                                    }
                                                } else {
                                                    OutlinedButton(
                                                        onClick = { selectedTravelStyle = label },
                                                        modifier = Modifier
                                                            .weight(1f)
                                                            .height(100.dp),
                                                        shape = RoundedCornerShape(12.dp),
                                                        border = BorderStroke(2.dp, Color.Gray.copy(alpha = 0.3f))
                                                    ) {
                                                        Column(
                                                            horizontalAlignment = Alignment.CenterHorizontally,
                                                            verticalArrangement = Arrangement.spacedBy(8.dp)
                                                        ) {
                                                            Text(
                                                                text = emoji,
                                                                style = MaterialTheme.typography.headlineMedium
                                                            )
                                                            Text(
                                                                text = label,
                                                                style = MaterialTheme.typography.bodySmall
                                                            )
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Step 2: Categories & Tags
                        if (currentStep == OnboardingStep.CATEGORIES_TAGS) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = null,
                                    modifier = Modifier.size(48.dp),
                                    tint = Purple600
                                )
                                Text(
                                    text = "What interests you?",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = "Select categories and tags that match your preferences",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                
                                Spacer(modifier = Modifier.height(8.dp))
                                
                                if (loadingOptions) {
                                    CircularProgressIndicator()
                                } else {
                                    // Categories
                                    Column(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Text(
                                            text = "Categories",
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        FlowRow(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                                            verticalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            categories.forEach { category ->
                                                FilterChip(
                                                    selected = selectedCategories.contains(category),
                                                    onClick = {
                                                        selectedCategories = if (selectedCategories.contains(category)) {
                                                            selectedCategories - category
                                                        } else {
                                                            selectedCategories + category
                                                        }
                                                    },
                                                    label = { Text(category) }
                                                )
                                            }
                                        }
                                    }
                                    
                                    Spacer(modifier = Modifier.height(16.dp))
                                    
                                    // Tags
                                    Column(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Text(
                                            text = "Tags",
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        FlowRow(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                                            verticalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            tags.forEach { tag ->
                                                FilterChip(
                                                    selected = selectedTags.contains(tag),
                                                    onClick = {
                                                        selectedTags = if (selectedTags.contains(tag)) {
                                                            selectedTags - tag
                                                        } else {
                                                            selectedTags + tag
                                                        }
                                                    },
                                                    label = { Text(tag) }
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Step 3: Budget
                        if (currentStep == OnboardingStep.BUDGET) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Favorite,
                                    contentDescription = null,
                                    modifier = Modifier.size(48.dp),
                                    tint = Purple600
                                )
                                Text(
                                    text = "What's your budget range?",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = "This helps us show you relevant destinations",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                
                                Spacer(modifier = Modifier.height(8.dp))
                                
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    OutlinedTextField(
                                        value = budgetMin.toString(),
                                        onValueChange = { 
                                            budgetMin = it.toIntOrNull() ?: 0
                                        },
                                        label = { Text("Minimum Budget") },
                                        modifier = Modifier.fillMaxWidth(),
                                        leadingIcon = {
                                            Icon(Icons.Default.AttachMoney, null)
                                        },
                                        singleLine = true
                                    )
                                    
                                    OutlinedTextField(
                                        value = budgetMax.toString(),
                                        onValueChange = { 
                                            budgetMax = it.toIntOrNull() ?: 0
                                        },
                                        label = { Text("Maximum Budget") },
                                        modifier = Modifier.fillMaxWidth(),
                                        leadingIcon = {
                                            Icon(Icons.Default.AttachMoney, null)
                                        },
                                        singleLine = true
                                    )
                                }
                            }
                        }
                    }
                    
                    // Footer buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(
                            onClick = onSkip,
                            enabled = !isLoading
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(Icons.Default.SkipNext, null, modifier = Modifier.size(18.dp))
                                Text("Skip for now")
                            }
                        }
                        
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (currentStep != OnboardingStep.TRAVEL_STYLE) {
                                OutlinedButton(
                                    onClick = {
                                        currentStep = when (currentStep) {
                                            OnboardingStep.CATEGORIES_TAGS -> OnboardingStep.TRAVEL_STYLE
                                            OnboardingStep.BUDGET -> OnboardingStep.CATEGORIES_TAGS
                                            else -> OnboardingStep.TRAVEL_STYLE
                                        }
                                    },
                                    enabled = !isLoading
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Icon(Icons.Default.ArrowBack, null, modifier = Modifier.size(18.dp))
                                        Text("Back")
                                    }
                                }
                            }
                            
                            Button(
                                onClick = {
                                    if (currentStep == OnboardingStep.BUDGET) {
                                        // Complete onboarding
                                        isLoading = true
                                        errorMessage = null
                                        scope.launch {
                                            val result = authRepository.submitOnboarding(
                                                travelStyles = selectedTravelStyle?.let { listOf(it) } ?: emptyList(),
                                                interests = emptyList(),
                                                categories = selectedCategories.toList(),
                                                tags = selectedTags.toList(),
                                                budgetMin = budgetMin,
                                                budgetMax = budgetMax
                                            )
                                            result.onSuccess {
                                                isLoading = false
                                                onComplete()
                                                onClose()
                                            }.onFailure { error ->
                                                isLoading = false
                                                errorMessage = error.message ?: "Failed to save preferences"
                                            }
                                        }
                                    } else {
                                        // Move to next step
                                        if (currentStep == OnboardingStep.TRAVEL_STYLE && selectedTravelStyle == null) {
                                            errorMessage = "Please select a travel style"
                                        } else {
                                            currentStep = when (currentStep) {
                                                OnboardingStep.TRAVEL_STYLE -> OnboardingStep.CATEGORIES_TAGS
                                                OnboardingStep.CATEGORIES_TAGS -> OnboardingStep.BUDGET
                                                else -> OnboardingStep.BUDGET
                                            }
                                            errorMessage = null
                                        }
                                    }
                                },
                                modifier = Modifier.height(48.dp),
                                enabled = !isLoading && (currentStep != OnboardingStep.TRAVEL_STYLE || selectedTravelStyle != null),
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
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                                        ) {
                                            Text(
                                                text = if (currentStep == OnboardingStep.BUDGET) "Complete" else "Next",
                                                color = Color.White,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                            Icon(
                                                Icons.Default.ArrowForward,
                                                null,
                                                tint = Color.White,
                                                modifier = Modifier.size(18.dp)
                                            )
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
