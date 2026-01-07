package com.triplink.mobile.ui.screens.help

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.triplink.mobile.di.LocalAppContainer
import com.triplink.mobile.ui.components.FAQ
import com.triplink.mobile.ui.components.LoadingSpinner
import com.triplink.mobile.ui.components.Navbar
import com.triplink.mobile.ui.theme.BackgroundCream
import kotlinx.coroutines.launch

@Composable
fun HelpCenterScreen(
    navController: NavController
) {
    var faqs by remember { mutableStateOf<List<com.triplink.mobile.data.model.FAQResponse>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()
    val appContainer = LocalAppContainer.current
    
    LaunchedEffect(Unit) {
        scope.launch {
            isLoading = true
            val result = appContainer.apiService.getFAQs()
            if (result.isSuccessful && result.body() != null) {
                faqs = result.body()!!
            }
            isLoading = false
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
                user = null,
                onOpenAuth = {},
                onLogout = {}
            )
            
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(16.dp)
            ) {
                Text(
                    text = "Help Center",
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            
            if (isLoading) {
                LoadingSpinner()
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(faqs) { faq ->
                        FAQItem(faq = faq)
                    }
                }
            }
        }
    }
}

@Composable
fun FAQItem(
    faq: com.triplink.mobile.data.model.FAQResponse
) {
    var expanded by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = faq.question,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = { expanded = !expanded }) {
                    Icon(
                        imageVector = if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = null
                    )
                }
            }
            
            if (expanded) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = faq.answer,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}

