package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.window.Popup
import androidx.compose.ui.window.PopupProperties
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.theme.Purple600
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DatePicker(
    label: String? = null,
    value: Date? = null,
    onValueChange: (Date?) -> Unit,
    placeholder: String = "Select date",
    modifier: Modifier = Modifier
) {
    var isOpen by remember { mutableStateOf(false) }
    var selectedDate by remember { mutableStateOf(value) }
    var currentMonth by remember { mutableStateOf(Calendar.getInstance()) }
    
    val monthNames = listOf(
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    )
    val dayNames = listOf("Su", "Mo", "Tu", "We", "Th", "Fr", "Sa")
    
    val currentYear = Calendar.getInstance().get(Calendar.YEAR)
    val years = (currentYear - 5..currentYear + 14).toList()
    
    LaunchedEffect(value) {
        selectedDate = value
    }
    
    val dateFormat = remember { SimpleDateFormat("MMMM dd, yyyy", Locale.getDefault()) }
    
    Column(modifier = modifier) {
        label?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }
        
        Box {
            OutlinedTextField(
                value = selectedDate?.let { dateFormat.format(it) } ?: "",
                onValueChange = {},
                readOnly = true,
                placeholder = { Text(placeholder) },
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { isOpen = true },
                trailingIcon = {
                    IconButton(onClick = { isOpen = true }) {
                        Icon(Icons.Default.CalendarToday, null)
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
                )
            )
            
            if (isOpen) {
                Popup(
                    onDismissRequest = { isOpen = false },
                    alignment = Alignment.TopStart,
                    properties = PopupProperties(
                        focusable = true,
                        dismissOnBackPress = true,
                        dismissOnClickOutside = true
                    )
                ) {
                    Card(
                        modifier = Modifier.width(320.dp),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Month and Year selectors
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                var selectedMonth by remember { mutableStateOf(currentMonth.get(Calendar.MONTH)) }
                                var selectedYear by remember { mutableStateOf(currentMonth.get(Calendar.YEAR)) }
                                
                                DropdownMenu(
                                    expanded = false,
                                    onDismissRequest = {}
                                ) {
                                    // Month dropdown
                                    ExposedDropdownMenuBox(
                                        expanded = false,
                                        onExpandedChange = {}
                                    ) {
                                        OutlinedTextField(
                                            value = monthNames[selectedMonth],
                                            onValueChange = {},
                                            readOnly = true,
                                            modifier = Modifier
                                                .menuAnchor()
                                                .weight(1f),
                                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = false) }
                                        )
                                    }
                                }
                                
                                // Simplified: Use TextField with dropdown
                                OutlinedTextField(
                                    value = monthNames[selectedMonth],
                                    onValueChange = {},
                                    readOnly = true,
                                    modifier = Modifier.weight(1f),
                                    trailingIcon = {
                                        Icon(Icons.Default.ArrowDropDown, null)
                                    }
                                )
                                
                                OutlinedTextField(
                                    value = selectedYear.toString(),
                                    onValueChange = { 
                                        selectedYear = it.toIntOrNull() ?: selectedYear
                                        currentMonth.set(Calendar.YEAR, selectedYear)
                                    },
                                    modifier = Modifier.width(100.dp),
                                    trailingIcon = {
                                        Icon(Icons.Default.ArrowDropDown, null)
                                    }
                                )
                            }
                            
                            // Day names header
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceEvenly
                            ) {
                                dayNames.forEach { day ->
                                    Text(
                                        text = day,
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                            
                            // Calendar grid
                            CalendarGrid(
                                currentMonth = currentMonth,
                                selectedDate = selectedDate,
                                onDateSelect = { date ->
                                    selectedDate = date
                                    onValueChange(date)
                                    isOpen = false
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CalendarGrid(
    currentMonth: Calendar,
    selectedDate: Date?,
    onDateSelect: (Date) -> Unit
) {
    val calendar = Calendar.getInstance().apply {
        time = currentMonth.time
        set(Calendar.DAY_OF_MONTH, 1)
    }
    
    val firstDayOfWeek = calendar.get(Calendar.DAY_OF_WEEK) - 1 // 0 = Sunday
    val daysInMonth = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
    val today = Calendar.getInstance()
    
    val days = (1..daysInMonth).toList()
    val emptyDays = (0 until firstDayOfWeek).toList()
    
    Column(
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        // Empty days at start
        if (emptyDays.isNotEmpty()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                emptyDays.forEach {
                    Spacer(modifier = Modifier.weight(1f))
                }
                days.take(7 - emptyDays.size).forEach { day ->
                    DayButton(
                        day = day,
                        calendar = calendar,
                        selectedDate = selectedDate,
                        today = today,
                        onDateSelect = onDateSelect,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
        
        // Remaining days
        val remainingDays = if (emptyDays.isNotEmpty()) {
            days.drop(7 - emptyDays.size)
        } else {
            days
        }
        
        remainingDays.chunked(7).forEach { weekDays ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                weekDays.forEach { day ->
                    DayButton(
                        day = day,
                        calendar = calendar,
                        selectedDate = selectedDate,
                        today = today,
                        onDateSelect = onDateSelect,
                        modifier = Modifier.weight(1f)
                    )
                }
                // Fill remaining spaces
                (weekDays.size until 7).forEach {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
fun DayButton(
    day: Int,
    calendar: Calendar,
    selectedDate: Date?,
    today: Calendar,
    onDateSelect: (Date) -> Unit,
    modifier: Modifier = Modifier
) {
    val dayCalendar = Calendar.getInstance().apply {
        time = calendar.time
        set(Calendar.DAY_OF_MONTH, day)
    }
    val dayDate = dayCalendar.time
    
    val isSelected = selectedDate?.let {
        val selectedCal = Calendar.getInstance().apply { time = it }
        selectedCal.get(Calendar.YEAR) == dayCalendar.get(Calendar.YEAR) &&
        selectedCal.get(Calendar.MONTH) == dayCalendar.get(Calendar.MONTH) &&
        selectedCal.get(Calendar.DAY_OF_MONTH) == dayCalendar.get(Calendar.DAY_OF_MONTH)
    } ?: false
    
    val isToday = today.get(Calendar.YEAR) == dayCalendar.get(Calendar.YEAR) &&
            today.get(Calendar.MONTH) == dayCalendar.get(Calendar.MONTH) &&
            today.get(Calendar.DAY_OF_MONTH) == dayCalendar.get(Calendar.DAY_OF_MONTH)
    
    Button(
        onClick = { onDateSelect(dayDate) },
        modifier = modifier.padding(2.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = when {
                isSelected -> Color.Transparent
                isToday -> Color(0xFFE9D5FF) // Purple-100
                else -> Color.Transparent
            }
        ),
        shape = RoundedCornerShape(8.dp)
    ) {
        if (isSelected) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(Purple600, Blue500)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = day.toString(),
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.bodySmall
                )
            }
        } else {
            Text(
                text = day.toString(),
                color = if (isToday) Purple600 else MaterialTheme.colorScheme.onSurface,
                fontWeight = if (isToday) FontWeight.Bold else FontWeight.Normal,
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

