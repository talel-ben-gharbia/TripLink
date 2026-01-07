package com.triplink.mobile.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.triplink.mobile.ui.screens.home.HomeScreen

@Composable
fun NavGraph(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(navController = navController)
        }
        
        composable(Screen.Destinations.route) {
            com.triplink.mobile.ui.screens.destinations.DestinationsScreen(navController = navController)
        }
        
        composable(
            route = Screen.DestinationDetails.route,
            arguments = listOf(navArgument("id") { type = androidx.navigation.NavType.IntType })
        ) { backStackEntry ->
            val id = backStackEntry.arguments?.getInt("id") ?: 0
            com.triplink.mobile.ui.screens.destinationdetails.DestinationDetailsScreen(
                navController = navController,
                destinationId = id
            )
        }
        
        composable(Screen.Collections.route) {
            com.triplink.mobile.ui.screens.collections.CollectionsScreen(navController = navController)
        }
        
        composable(
            route = Screen.CollectionDetail.route,
            arguments = listOf(navArgument("slug") { type = androidx.navigation.NavType.StringType })
        ) { backStackEntry ->
            val slug = backStackEntry.arguments?.getString("slug") ?: ""
            com.triplink.mobile.ui.screens.collections.CollectionDetailScreen(
                navController = navController,
                slug = slug
            )
        }
        
        composable(Screen.Profile.route) {
            com.triplink.mobile.ui.screens.profile.ProfileScreen(navController = navController)
        }
        
        composable(Screen.Settings.route) {
            com.triplink.mobile.ui.screens.settings.SettingsScreen(navController = navController)
        }
        
        composable(Screen.Wishlist.route) {
            com.triplink.mobile.ui.screens.wishlist.WishlistScreen(navController = navController)
        }
        
        composable(Screen.MyBookings.route) {
            com.triplink.mobile.ui.screens.bookings.MyBookingsScreen(navController = navController)
        }
        
        composable(Screen.BookingSuccess.route) {
            com.triplink.mobile.ui.screens.booking.BookingSuccessScreen(
                navController = navController,
                bookingId = null, // TODO: Extract from query params
                sessionId = null // TODO: Extract from query params
            )
        }
        
        composable(Screen.BookingCancel.route) {
            com.triplink.mobile.ui.screens.booking.BookingCancelScreen(
                navController = navController,
                bookingId = null // TODO: Extract from query params
            )
        }
        
        composable(Screen.AgentDashboard.route) {
            com.triplink.mobile.ui.screens.agent.AgentDashboardScreen(navController = navController)
        }
        
        composable(Screen.ApplyAsAgent.route) {
            com.triplink.mobile.ui.screens.agent.ApplyAsAgentScreen(navController = navController)
        }
        
        composable(Screen.AdminDashboard.route) {
            com.triplink.mobile.ui.screens.admin.AdminDashboardScreen(navController = navController)
        }
        
        composable(Screen.AdminUsers.route) {
            com.triplink.mobile.ui.screens.admin.AdminUsersScreen(navController = navController)
        }
        
        composable(
            route = Screen.UserDetails.route,
            arguments = listOf(navArgument("id") { type = androidx.navigation.NavType.IntType })
        ) { backStackEntry ->
            val id = backStackEntry.arguments?.getInt("id") ?: 0
            com.triplink.mobile.ui.screens.admin.UserDetailsScreen(
                navController = navController,
                userId = id
            )
        }
        
        composable(Screen.AdminDestinations.route) {
            com.triplink.mobile.ui.screens.admin.AdminDestinationsScreen(navController = navController)
        }
        
        composable(Screen.HelpCenter.route) {
            com.triplink.mobile.ui.screens.help.HelpCenterScreen(navController = navController)
        }
        
        composable(Screen.CompareDestinations.route) {
            com.triplink.mobile.ui.screens.compare.CompareDestinationsScreen(navController = navController)
        }
        
        // Auth screens
        composable(Screen.EmailVerification.route) {
            com.triplink.mobile.ui.screens.auth.EmailVerificationScreen(navController = navController)
        }
        
        composable(Screen.ResetPassword.route) {
            com.triplink.mobile.ui.screens.auth.ResetPasswordScreen(navController = navController)
        }
        
        composable(Screen.ChangePassword.route) {
            com.triplink.mobile.ui.screens.auth.ChangePasswordScreen(navController = navController)
        }
        
        // Public Profile
        composable(
            route = Screen.PublicProfile.route,
            arguments = listOf(navArgument("id") { type = androidx.navigation.NavType.IntType })
        ) { backStackEntry ->
            val id = backStackEntry.arguments?.getInt("id") ?: 0
            com.triplink.mobile.ui.screens.profile.PublicProfileScreen(
                navController = navController,
                userId = id
            )
        }
        
        // Agent screens
        composable(Screen.ClientPortfolio.route) {
            com.triplink.mobile.ui.screens.agent.ClientPortfolioScreen(navController = navController)
        }
        
        composable(Screen.PackageBuilder.route) {
            com.triplink.mobile.ui.screens.agent.PackageBuilderScreen(navController = navController)
        }
        
        composable(Screen.CommissionDashboard.route) {
            com.triplink.mobile.ui.screens.agent.CommissionDashboardScreen(navController = navController)
        }
    }
}

