package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.triplink.mobile.data.model.AutocompleteSuggestion
import com.triplink.mobile.data.repository.DestinationRepository
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import kotlinx.coroutines.launch

@Composable
fun SearchBar(
    simple: Boolean = false,
    compact: Boolean = false,
    onSearch: (SearchPayload) -> Unit = {},
    destinationRepository: DestinationRepository? = null
) {
    var destination by remember { mutableStateOf("") }
    var showSuggestions by remember { mutableStateOf(false) }
    var suggestions by remember { mutableStateOf<List<AutocompleteSuggestion>>(emptyList()) }
    var loadingSuggestions by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    val popularDestinations = listOf("Paris", "Tokyo", "Bali", "New York", "Dubai", "Barcelona")

    // Fetch autocomplete suggestions
    LaunchedEffect(destination) {
        if (destination.length >= 2 && destinationRepository != null) {
            loadingSuggestions = true
            scope.launch {
                val result = destinationRepository.getAutocompleteSuggestions(destination, 8)
                result.onSuccess {
                    suggestions = it
                    loadingSuggestions = false
                }.onFailure {
                    suggestions = emptyList()
                    loadingSuggestions = false
                }
            }
        } else {
            suggestions = emptyList()
        }
    }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f),
        shadowElevation = 8.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            if (!compact) {
                Text(
                    text = "Where would you like to go?",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Destination input
                OutlinedTextField(
                    value = destination,
                    onValueChange = { destination = it },
                    modifier = Modifier.weight(2f),
                    placeholder = { Text("Search destinations, cities, or countries") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null
                        )
                    },
                    trailingIcon = if (loadingSuggestions) {
                        {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp))
                        }
                    } else null,
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(
                        onSearch = {
                            onSearch(SearchPayload(destination))
                            showSuggestions = false
                        }
                    )
                )

                // Search button
                Button(
                    onClick = {
                        onSearch(SearchPayload(destination))
                        showSuggestions = false
                    },
                    modifier = Modifier.height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Purple600
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            // Suggestions dropdown
            if (showSuggestions) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp)
                    ) {
                        if (loadingSuggestions) {
                            Box(
                                modifier = Modifier.fillMaxWidth(),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(modifier = Modifier.size(24.dp))
                            }
                        } else if (suggestions.isNotEmpty()) {
                            suggestions.forEach { suggestion ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            destination = suggestion.name
                                            showSuggestions = false
                                            onSearch(SearchPayload(suggestion.name))
                                        }
                                        .padding(12.dp),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.LocationOn,
                                        contentDescription = null,
                                        tint = Purple600,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Text(
                                        text = suggestion.name,
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                }
                                Divider()
                            }
                        } else if (destination.length < 2) {
                            Text(
                                text = "Popular destinations",
                                style = MaterialTheme.typography.labelSmall,
                                modifier = Modifier.padding(8.dp)
                            )
                            popularDestinations.forEach { dest ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            destination = dest
                                            showSuggestions = false
                                            onSearch(SearchPayload(dest))
                                        }
                                        .padding(12.dp),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.LocationOn,
                                        contentDescription = null,
                                        tint = Purple600,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Text(
                                        text = dest,
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                }
                                Divider()
                            }
                        }
                    }
                }
            }

            if (!compact && !simple) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Popular:",
                        style = MaterialTheme.typography.bodySmall
                    )
                    listOf("Beach", "Mountain", "City", "Luxury", "Adventure").forEach { filter ->
                        AssistChip(
                            onClick = { destination = filter },
                            label = { Text(filter) }
                        )
                    }
                }
            }
        }
    }
}

data class SearchPayload(
    val destination: String,
    val checkIn: String? = null,
    val checkOut: String? = null,
    val guests: Int = 2,
    val budgetMin: Double? = null,
    val budgetMax: Double? = null
)

