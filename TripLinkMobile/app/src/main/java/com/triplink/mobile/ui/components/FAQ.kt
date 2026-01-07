package com.triplink.mobile.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

data class FAQData(
    val question: String,
    val answer: String
)

@Composable
fun FAQ(
    faqs: List<FAQData> = defaultFAQs,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Frequently Asked Questions",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        Text(
            text = "Find answers to common questions about TripLink",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            modifier = Modifier.padding(bottom = 24.dp)
        )
        
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            faqs.forEach { faq ->
                FAQItem(
                    question = faq.question,
                    answer = faq.answer
                )
            }
        }
    }
}

@Composable
fun FAQItem(
    question: String,
    answer: String
) {
    var expanded by remember { mutableStateOf(false) }
    val rotation by animateFloatAsState(
        targetValue = if (expanded) 180f else 0f,
        label = "chevronRotation"
    )
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = { expanded = !expanded },
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
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
                    text = question,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.weight(1f)
                )
                
                IconButton(onClick = { expanded = !expanded }) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = if (expanded) "Collapse" else "Expand",
                        modifier = Modifier.rotate(rotation)
                    )
                }
            }
            
            if (expanded) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = answer,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
        }
    }
}

private val defaultFAQs = listOf(
    FAQData(
        question = "How do I book a destination?",
        answer = "Browse our destinations, select your preferred location, choose your travel dates, and complete the booking process. You can pay securely through our payment gateway."
    ),
    FAQData(
        question = "Can I cancel my booking?",
        answer = "Yes, you can cancel your booking. Cancellation policies vary by destination. Check the cancellation terms before booking or in your booking details."
    ),
    FAQData(
        question = "What payment methods do you accept?",
        answer = "We accept all major credit cards, debit cards, and digital payment methods. All transactions are secure and encrypted."
    ),
    FAQData(
        question = "How do I become a travel agent?",
        answer = "You can apply to become a travel agent by clicking on 'Apply as Agent' in the navigation menu. Fill out the application form and our team will review it."
    ),
    FAQData(
        question = "Is my personal information secure?",
        answer = "Yes, we take data security seriously. All your personal and payment information is encrypted and stored securely. We comply with international data protection standards."
    )
)

