package com.triplink.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.triplink.mobile.data.model.UserData
import com.triplink.mobile.navigation.Screen
import com.triplink.mobile.ui.theme.Purple600
import com.triplink.mobile.ui.theme.Blue500
import com.triplink.mobile.ui.utils.LocalWindowSize
import com.triplink.mobile.ui.utils.TextUtils
import com.triplink.mobile.ui.utils.horizontalPadding

@Composable
fun Navbar(
    navController: NavController,
    user: UserData?,
    onOpenAuth: () -> Unit,
    onLogout: () -> Unit
) {
    val windowSize = LocalWindowSize.current
    val padding = horizontalPadding(windowSize)
    var showMobileMenu by remember { mutableStateOf(false) }
    val isAgent = user?.roles?.contains("ROLE_AGENT") == true
    val isAdmin = user?.roles?.contains("ROLE_ADMIN") == true
    val isCompact = windowSize.width == com.triplink.mobile.ui.utils.WindowType.Compact

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.surface.copy(alpha = 0.85f),
                        MaterialTheme.colorScheme.surface.copy(alpha = 0.85f)
                    )
                )
            )
            .padding(horizontal = padding, vertical = 16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Logo
            Row(
                modifier = Modifier
                    .clickable { navController.navigate(Screen.Home.route) }
                    .weight(1f),
                horizontalArrangement = Arrangement.Start,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(Purple600, Blue500)
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.FlightTakeoff,
                        contentDescription = "TripLink Logo",
                        tint = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Trip Link",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        ),
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Intelligent Travel Companion",
                        style = MaterialTheme.typography.bodySmall,
                        fontSize = 10.sp
                    )
                }
            }

            // Desktop Navigation
            if (!isCompact) {
                Row(
                    modifier = Modifier.weight(2f),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    NavLink(navController, Screen.Home.route, "Home")
                    Spacer(modifier = Modifier.width(24.dp))
                    NavLink(navController, Screen.Destinations.route, "Destinations")
                    Spacer(modifier = Modifier.width(24.dp))
                    NavLink(navController, Screen.Collections.route, "Collections")
                    
                    if (user != null) {
                        Spacer(modifier = Modifier.width(24.dp))
                        NavLink(navController, Screen.Wishlist.route, "Wishlist")
                        Spacer(modifier = Modifier.width(24.dp))
                        NavLink(navController, Screen.MyBookings.route, "My Bookings")
                        
                        if (isAgent) {
                            Spacer(modifier = Modifier.width(24.dp))
                            NavLink(navController, Screen.AgentDashboard.route, "Agent Dashboard")
                        }
                        
                        Spacer(modifier = Modifier.width(24.dp))
                        NavLink(navController, Screen.Profile.route, "Profile")
                    }
                }
            }

            // Desktop Actions
            Row(
                modifier = Modifier.weight(if (isCompact) 1f else 1f),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (!isCompact) {
                    if (user != null) {
                        // Notification Center
                        val appContainer = com.triplink.mobile.di.LocalAppContainer.current
                        NotificationCenter(
                            notificationRepository = appContainer.notificationRepository
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        
                        Text(
                            text = TextUtils.formatUserName(user.firstName, user.lastName, user.email),
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(end = 12.dp)
                        )
                        Button(
                            onClick = onLogout,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error
                            ),
                            modifier = Modifier.padding(start = 8.dp)
                        ) {
                            Text("Logout")
                        }
                    } else {
                        Button(
                            onClick = onOpenAuth,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            )
                        ) {
                            Text("Sign up / Sign in")
                        }
                    }
                }
                
                // Mobile menu button (always visible on compact, or as fallback)
                IconButton(
                    onClick = { showMobileMenu = !showMobileMenu },
                    modifier = Modifier.padding(start = if (isCompact) 0.dp else 8.dp)
                ) {
                    Icon(
                        imageVector = if (showMobileMenu) Icons.Default.Close else Icons.Default.Menu,
                        contentDescription = "Menu"
                    )
                }
            }
        }

        // Mobile Menu
        if (showMobileMenu) {
            MobileMenu(
                navController = navController,
                user = user,
                isAgent = isAgent,
                onOpenAuth = {
                    onOpenAuth()
                    showMobileMenu = false
                },
                onLogout = {
                    onLogout()
                    showMobileMenu = false
                },
                onClose = { showMobileMenu = false }
            )
        }
    }
}

@Composable
fun NavLink(
    navController: NavController,
    route: String,
    label: String
) {
    TextButton(
        onClick = { navController.navigate(route) }
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun MobileMenu(
    navController: NavController,
    user: UserData?,
    isAgent: Boolean,
    onOpenAuth: () -> Unit,
    onLogout: () -> Unit,
    onClose: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        MobileNavLink(navController, Screen.Home.route, "Home", onClose)
        MobileNavLink(navController, Screen.Destinations.route, "Destinations", onClose)
        MobileNavLink(navController, Screen.Collections.route, "Collections", onClose)
        
        if (user != null) {
            Divider()
            MobileNavLink(navController, Screen.Wishlist.route, "Wishlist", onClose)
            MobileNavLink(navController, Screen.MyBookings.route, "My Bookings", onClose)
            
            if (isAgent) {
                MobileNavLink(navController, Screen.AgentDashboard.route, "Agent Dashboard", onClose)
            }
            
            MobileNavLink(navController, Screen.Profile.route, "Profile", onClose)
            
            Divider()
            
            Text(
                text = TextUtils.formatUserName(user.firstName, user.lastName, user.email),
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            
            Button(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                )
            ) {
                Text("Logout")
            }
        } else {
            Divider()
            Button(
                onClick = onOpenAuth,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Sign up / Sign in")
            }
        }
    }
}

@Composable
fun MobileNavLink(
    navController: NavController,
    route: String,
    label: String,
    onClose: () -> Unit
) {
    TextButton(
        onClick = {
            navController.navigate(route)
            onClose()
        },
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}