package com.triplink.mobile.navigation

sealed class Screen(val route: String) {
    // Public screens
    object Home : Screen("home")
    object Destinations : Screen("destinations")
    object DestinationDetails : Screen("destinations/{id}") {
        fun createRoute(id: Int) = "destinations/$id"
    }
    object Collections : Screen("collections")
    object CollectionDetail : Screen("collections/{slug}") {
        fun createRoute(slug: String) = "collections/$slug"
    }
    object PublicProfile : Screen("users/{id}/profile") {
        fun createRoute(id: Int) = "users/$id/profile"
    }
    object HelpCenter : Screen("help")
    object CompareDestinations : Screen("compare")
    
    // Auth screens
    object EmailVerification : Screen("email-verification")
    object ResetPassword : Screen("reset-password")
    object ChangePassword : Screen("change-password")
    
    // User screens
    object Profile : Screen("profile")
    object Settings : Screen("settings")
    object Wishlist : Screen("wishlist")
    object MyBookings : Screen("bookings")
    object BookingSuccess : Screen("booking-success")
    object BookingCancel : Screen("booking-cancel")
    
    // Agent screens
    object AgentDashboard : Screen("agent/dashboard")
    object ApplyAsAgent : Screen("agent/apply")
    object ClientPortfolio : Screen("agent/clients")
    object PackageBuilder : Screen("agent/packages")
    object CommissionDashboard : Screen("agent/commissions")
    
    // Admin screens
    object AdminDashboard : Screen("admin")
    object UserDetails : Screen("admin/users/{id}") {
        fun createRoute(id: Int) = "admin/users/$id"
    }
    object AdminDestinations : Screen("admin/destinations")
    object AdminUsers : Screen("admin/users")
}

