package com.triplink.mobile.data.model

import com.google.gson.annotations.SerializedName

// ========== Common Models ==========
data class ApiResponse(
    val message: String? = null,
    val success: Boolean = false
)

data class HealthResponse(
    val status: String? = null,
    val message: String,
    val timestamp: String,
    val php_version: String
)

// ========== Authentication Models ==========
data class RegisterRequest(
    val email: String,
    val password: String,
    @SerializedName("firstName") val firstName: String,
    @SerializedName("lastName") val lastName: String,
    val phone: String,
    @SerializedName("travelStyles") val travelStyles: List<String>? = null,
    @SerializedName("interests") val interests: List<String>? = null
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val token: String? = null,
    val user: UserData? = null,
    val refresh_token: String? = null,
    val message: String? = null
)

data class UserResponse(
    val user: UserData,
    val needsOnboarding: Boolean? = false
)

data class UserData(
    val id: Int,
    val email: String,
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    val phone: String? = null,
    val roles: List<String>? = null,
    @SerializedName("is_verified") val isVerified: Boolean = false,
    val status: String? = null,
    @SerializedName("profile_image") val profileImage: String? = null,
    @SerializedName("travel_styles") val travelStyles: List<String>? = null,
    val interests: List<String>? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("last_login") val lastLogin: String? = null,
    @SerializedName("personality_axis") val personalityAxis: Map<String, Int>? = null,
    @SerializedName("preference_categories") val preferenceCategories: Map<String, Int>? = null,
    @SerializedName("is_agent") val isAgent: Boolean = false,
    @SerializedName("is_admin") val isAdmin: Boolean = false,
    @SerializedName("must_change_password") val mustChangePassword: Boolean = false
)

// ========== Profile Models ==========
data class ProfileResponse(
    val user: UserData,
    val profile: UserProfileData? = null
)

data class UserProfileData(
    val id: Int,
    @SerializedName("user_id") val userId: Int,
    val bio: String? = null,
    @SerializedName("date_of_birth") val dateOfBirth: String? = null,
    val nationality: String? = null,
    @SerializedName("preferred_languages") val preferredLanguages: List<String>? = null,
    @SerializedName("emergency_contact") val emergencyContact: EmergencyContact? = null
)

data class EmergencyContact(
    val name: String,
    val phone: String,
    val relationship: String
)

data class UpdateProfileRequest(
    @SerializedName("first_name") val firstName: String? = null,
    @SerializedName("last_name") val lastName: String? = null,
    val phone: String? = null,
    val bio: String? = null,
    @SerializedName("date_of_birth") val dateOfBirth: String? = null,
    val nationality: String? = null,
    @SerializedName("preferred_languages") val preferredLanguages: List<String>? = null,
    @SerializedName("travel_styles") val travelStyles: List<String>? = null,
    val interests: List<String>? = null,
    @SerializedName("emergency_contact") val emergencyContact: EmergencyContact? = null,
    @SerializedName("personality_axis") val personalityAxis: Map<String, Int>? = null,
    @SerializedName("preference_categories") val preferenceCategories: Map<String, Int>? = null
)

data class PublicProfileResponse(
    val user: UserData,
    val profile: UserProfileData? = null,
    val stats: ProfileStats? = null
)

data class ProfileStats(
    val bookings: Int = 0,
    val reviews: Int = 0,
    val wishlist: Int = 0
)

// ========== Destination Models ==========
data class DestinationResponse(
    val id: Int,
    val name: String? = null,
    val description: String? = null,
    val country: String? = null,
    val city: String? = null,
    val images: List<String>? = null,
    val price: Double? = null, // Legacy field, use priceMin/priceMax
    @SerializedName("price_min") val priceMin: Int? = null,
    @SerializedName("price_max") val priceMax: Int? = null,
    val currency: String = "USD",
    val rating: Double? = null,
    @SerializedName("review_count") val reviewCount: Int = 0,
    val tags: List<String>? = null,
    val category: String? = null,
    @SerializedName("is_featured") val isFeatured: Boolean = false,
    @SerializedName("is_pinned") val isPinned: Boolean = false,
    @SerializedName("is_popular") val isPopular: Boolean = false,
    @SerializedName("ai_recommended") val aiRecommended: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("updated_at") val updatedAt: String? = null,
    val highlights: List<String>? = null,
    val itinerary: List<ItineraryItem>? = null,
    val inclusions: List<String>? = null,
    val exclusions: List<String>? = null,
    val duration: String? = null,
    @SerializedName("max_travelers") val maxTravelers: Int? = null,
    @SerializedName("min_travelers") val minTravelers: Int? = null,
    val availability: AvailabilityInfo? = null
)

data class ItineraryItem(
    val day: Int,
    val title: String,
    val description: String,
    val activities: List<String>? = null
)

data class AvailabilityInfo(
    val available: Boolean = true,
    @SerializedName("available_dates") val availableDates: List<String>? = null,
    @SerializedName("blackout_dates") val blackoutDates: List<String>? = null
)

data class AutocompleteSuggestion(
    val id: Int,
    val name: String? = null,
    val country: String? = null,
    val type: String? = null
)

// ========== Collection Models ==========
data class CollectionResponse(
    val id: Int,
    val name: String,
    val slug: String,
    val description: String? = null,
    @SerializedName("cover_image") val coverImage: String? = null,
    @SerializedName("destination_count") val destinationCount: Int = 0,
    val type: String? = null,
    @SerializedName("is_featured") val isFeatured: Boolean = false
)

data class CollectionDetailResponse(
    // Collection fields at root level (matching backend response)
    val id: Int,
    val name: String,
    val slug: String,
    val description: String? = null,
    @SerializedName("coverImage") val coverImage: String? = null,
    val type: String? = null,
    @SerializedName("createdAt") val createdAt: String? = null,
    val destinations: List<DestinationResponse> = emptyList()
)

// ========== Booking Models ==========
data class BookingsListResponse(
    val bookings: List<BookingResponse>
)

data class BookingResponse(
    val id: Int,
    @SerializedName("destination_id") val destinationId: Int,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("travel_date") val travelDate: String? = null,
    @SerializedName("return_date") val returnDate: String? = null,
    @SerializedName("check_in_date") val checkInDate: String? = null,
    @SerializedName("check_out_date") val checkOutDate: String? = null,
    @SerializedName("number_of_travelers") val numberOfTravelers: Int,
    @SerializedName("number_of_guests") val numberOfGuests: Int? = null,
    @SerializedName("total_price") val totalPrice: Double? = null,
    val currency: String = "USD",
    val status: String? = null,
    @SerializedName("payment_status") val paymentStatus: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String? = null,
    val destination: DestinationResponse? = null,
    val notes: String? = null,
    @SerializedName("agent_id") val agentId: Int? = null,
    val agent: UserData? = null,
    val user: UserData? = null,
    @SerializedName("booking_reference") val bookingReference: String? = null,
    @SerializedName("booking_type") val bookingType: String? = null,
    @SerializedName("contact_email") val contactEmail: String? = null,
    @SerializedName("contact_phone") val contactPhone: String? = null,
    @SerializedName("special_requests") val specialRequests: String? = null
)

data class CreateBookingRequest(
    @SerializedName("destination_id") val destinationId: Int,
    @SerializedName("travel_date") val travelDate: String,
    @SerializedName("return_date") val returnDate: String? = null,
    @SerializedName("number_of_travelers") val numberOfTravelers: Int,
    val notes: String? = null
)

data class UpdateBookingRequest(
    @SerializedName("travel_date") val travelDate: String? = null,
    @SerializedName("return_date") val returnDate: String? = null,
    @SerializedName("check_in_date") val checkInDate: String? = null,
    @SerializedName("check_out_date") val checkOutDate: String? = null,
    @SerializedName("number_of_travelers") val numberOfTravelers: Int? = null,
    @SerializedName("number_of_guests") val numberOfGuests: Int? = null,
    @SerializedName("contact_email") val contactEmail: String? = null,
    @SerializedName("contact_phone") val contactPhone: String? = null,
    @SerializedName("special_requests") val specialRequests: String? = null,
    val notes: String? = null
)

data class CancelBookingRequest(
    val reason: String
)

data class FinalizeBookingRequest(
    val notes: String? = null
)

data class CheckRoutingRequest(
    @SerializedName("destination_id") val destinationId: Int,
    @SerializedName("travel_date") val travelDate: String,
    @SerializedName("return_date") val returnDate: String? = null,
    @SerializedName("number_of_travelers") val numberOfTravelers: Int
)

data class RoutingResponse(
    val available: Boolean,
    val message: String? = null,
    @SerializedName("suggested_dates") val suggestedDates: List<String>? = null
)

// ========== Payment Models ==========
data class CreatePaymentIntentRequest(
    @SerializedName("booking_id") val bookingId: Int
)

data class PaymentIntentResponse(
    @SerializedName("client_secret") val clientSecret: String,
    @SerializedName("payment_intent_id") val paymentIntentId: String
)

data class CreateCheckoutSessionRequest(
    @SerializedName("booking_id") val bookingId: Int
)

data class CheckoutSessionResponse(
    @SerializedName("session_id") val sessionId: String,
    @SerializedName("checkout_url") val checkoutUrl: String
)

data class VerifyCheckoutRequest(
    @SerializedName("booking_id") val bookingId: Int,
    @SerializedName("session_id") val sessionId: String
)

data class ConfirmPaymentRequest(
    @SerializedName("booking_id") val bookingId: Int,
    @SerializedName("payment_intent_id") val paymentIntentId: String
)

// ========== Agent Models ==========
data class AgentApplicationRequest(
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val email: String,
    val phone: String,
    val company: String? = null,
    @SerializedName("license_number") val licenseNumber: String? = null,
    val experience: String? = null,
    val motivation: String? = null
)

data class AgentDashboardResponse(
    val stats: AgentStats,
    @SerializedName("pending_bookings") val pendingBookings: List<BookingResponse> = emptyList(),
    @SerializedName("recent_bookings") val recentBookings: List<BookingResponse> = emptyList(),
    @SerializedName("unread_messages") val unreadMessages: Int = 0
)

data class AgentStats(
    val bookings: Int = 0,
    @SerializedName("total_revenue") val totalRevenue: Double = 0.0,
    @SerializedName("pending_bookings") val pendingBookings: Int = 0,
    @SerializedName("completed_bookings") val completedBookings: Int = 0,
    val clients: Int = 0
)

data class SendMessageRequest(
    @SerializedName("client_id") val clientId: Int,
    val subject: String,
    val message: String,
    @SerializedName("booking_id") val bookingId: Int? = null
)

data class MessageResponse(
    val id: Int,
    @SerializedName("sender_id") val senderId: Int,
    @SerializedName("receiver_id") val receiverId: Int,
    val subject: String,
    val message: String,
    @SerializedName("is_read") val isRead: Boolean,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("booking_id") val bookingId: Int? = null
)

data class UnreadCountResponse(
    val count: Int
)

data class CommissionResponse(
    val id: Int,
    @SerializedName("booking_id") val bookingId: Int,
    val amount: Double,
    val currency: String = "USD",
    val status: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("paid_at") val paidAt: String? = null
)

// ========== Admin Models ==========
data class UserDetailsResponse(
    val user: UserData,
    val profile: UserProfileData? = null,
    val stats: UserAdminStats? = null,
    @SerializedName("login_attempts") val loginAttempts: List<LoginAttempt>? = null,
    @SerializedName("recent_activity") val recentActivity: List<UserActivity>? = null
)

data class UserAdminStats(
    val bookings: Int = 0,
    val reviews: Int = 0,
    val wishlist: Int = 0,
    @SerializedName("total_spent") val totalSpent: Double = 0.0
)

data class LoginAttempt(
    val id: Int,
    val ip: String,
    val success: Boolean,
    @SerializedName("created_at") val createdAt: String
)

data class UserActivity(
    val id: Int,
    val action: String,
    @SerializedName("created_at") val createdAt: String
)

data class UpdateUserStatusRequest(
    val status: String
)

// ========== Review Models ==========
data class ReviewResponse(
    val id: Int,
    @SerializedName("destination_id") val destinationId: Int,
    @SerializedName("user_id") val userId: Int,
    val rating: Int,
    val comment: String? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    val user: UserData? = null,
    @SerializedName("is_public") val isPublic: Boolean = true
)

data class CreateReviewRequest(
    val rating: Int,
    val comment: String? = null,
    @SerializedName("is_public") val isPublic: Boolean = true
)

data class UpdateReviewRequest(
    val rating: Int? = null,
    val comment: String? = null,
    @SerializedName("is_public") val isPublic: Boolean? = null
)

data class ReviewStatsResponse(
    @SerializedName("average_rating") val averageRating: Double,
    @SerializedName("total_reviews") val totalReviews: Int,
    @SerializedName("rating_distribution") val ratingDistribution: Map<Int, Int> = emptyMap() // rating -> count
)

// ========== Onboarding Models ==========
data class OnboardingRequest(
    @SerializedName("travel_styles") val travelStyles: List<String>? = null,
    val interests: List<String>? = null,
    @SerializedName("budget_range") val budgetRange: String? = null,
    @SerializedName("preferred_destinations") val preferredDestinations: List<String>? = null
)

// ========== Travel Document Models ==========
data class TravelDocumentResponse(
    val id: Int,
    val type: String,
    @SerializedName("document_number") val documentNumber: String? = null,
    @SerializedName("expiry_date") val expiryDate: String? = null,
    @SerializedName("issue_date") val issueDate: String? = null,
    @SerializedName("country") val country: String? = null,
    @SerializedName("file_url") val fileUrl: String? = null,
    @SerializedName("file_path") val filePath: String? = null,
    @SerializedName("file_name") val fileName: String? = null,
    @SerializedName("file_size") val fileSize: Long? = null,
    @SerializedName("is_expired") val isExpired: Boolean = false,
    @SerializedName("is_expiring_soon") val isExpiringSoon: Boolean = false,
    @SerializedName("is_verified") val isVerified: Boolean = false,
    @SerializedName("created_at") val createdAt: String
)

data class TravelDocumentListResponse(
    val documents: List<TravelDocumentResponse>,
    val alerts: DocumentAlerts? = null
)

data class DocumentAlerts(
    val expiring: List<TravelDocumentResponse> = emptyList(),
    val expired: List<TravelDocumentResponse> = emptyList()
)

data class UpdateTravelDocumentRequest(
    @SerializedName("document_type") val documentType: String? = null,
    @SerializedName("document_number") val documentNumber: String? = null,
    @SerializedName("expiration_date") val expirationDate: String? = null,
    @SerializedName("issue_date") val issueDate: String? = null,
    val country: String? = null
)

// ========== Notification Models ==========
data class NotificationResponse(
    val id: Int,
    val type: String,
    val title: String,
    val message: String,
    @SerializedName("is_read") val isRead: Boolean,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("related_id") val relatedId: Int? = null,
    @SerializedName("related_type") val relatedType: String? = null
)

data class NotificationListResponse(
    val notifications: List<NotificationResponse>,
    @SerializedName("unread_count") val unreadCount: Int,
    val total: Int
)

data class MarkNotificationsReadRequest(
    @SerializedName("notification_ids") val notificationIds: List<Int>
)

// ========== Public Stats Models ==========
data class PublicStatsResponse(
    @SerializedName("total_destinations") val totalDestinations: Int,
    @SerializedName("total_bookings") val totalBookings: Int,
    @SerializedName("total_users") val totalUsers: Int,
    @SerializedName("average_rating") val averageRating: Double
)

// ========== FAQ Models ==========
data class FAQResponse(
    val id: Int,
    val question: String,
    val answer: String,
    val category: String? = null,
    @SerializedName("display_order") val displayOrder: Int = 0
)

// ========== Testimonial Models ==========
data class TestimonialResponse(
    val id: Int,
    val name: String,
    val content: String,
    val rating: Int,
    @SerializedName("user_image") val userImage: String? = null,
    @SerializedName("created_at") val createdAt: String
)

// ========== Password Models ==========
data class ForgotPasswordRequest(
    val email: String
)

data class ResetPasswordRequest(
    val token: String,
    val password: String
)

data class ChangePasswordRequest(
    @SerializedName("current_password") val currentPassword: String,
    @SerializedName("new_password") val newPassword: String
)

data class DeleteAccountRequest(
    val password: String
)

// ========== Profile Activity Models ==========
data class ProfileActivityResponse(
    val totalBookings: Int = 0,
    val totalReviews: Int = 0,
    val totalWishlist: Int = 0,
    @SerializedName("recent_bookings") val recentBookings: List<BookingResponse> = emptyList(),
    @SerializedName("recent_reviews") val recentReviews: List<ReviewResponse> = emptyList(),
    @SerializedName("recent_activity") val recentActivity: List<ActivityItem> = emptyList()
)

data class ActivityItem(
    val id: Int,
    val action: String,
    val description: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("related_id") val relatedId: Int? = null,
    @SerializedName("related_type") val relatedType: String? = null
)

// ========== Admin Models ==========
data class AdminStatsUsers(
    @SerializedName("totalUsers") val totalUsers: Int = 0,
    @SerializedName("activeUsers") val activeUsers: Int = 0,
    @SerializedName("suspendedUsers") val suspendedUsers: Int = 0,
    @SerializedName("pendingUsers") val pendingUsers: Int = 0,
    @SerializedName("verifiedUsers") val verifiedUsers: Int = 0,
    @SerializedName("unverifiedUsers") val unverifiedUsers: Int = 0
)

data class AdminStatsAgents(
    @SerializedName("totalAgents") val totalAgents: Int = 0,
    @SerializedName("activeAgents") val activeAgents: Int = 0
)

data class AdminStatsBookings(
    @SerializedName("totalBookings") val totalBookings: Int = 0,
    @SerializedName("pendingBookings") val pendingBookings: Int = 0,
    @SerializedName("confirmedBookings") val confirmedBookings: Int = 0,
    @SerializedName("cancelledBookings") val cancelledBookings: Int = 0,
    @SerializedName("completedBookings") val completedBookings: Int = 0
)

data class AdminStatsPayments(
    @SerializedName("totalRevenue") val totalRevenue: Double = 0.0,
    @SerializedName("paidCount") val paidCount: Int = 0,
    @SerializedName("pendingPayments") val pendingPayments: Int = 0,
    @SerializedName("refundedCount") val refundedCount: Int = 0
)

data class AdminStatsApplications(
    @SerializedName("pendingApplications") val pendingApplications: Int = 0
)

data class AdminStatsResponse(
    @SerializedName("users") val users: AdminStatsUsers? = null,
    @SerializedName("agents") val agents: AdminStatsAgents? = null,
    @SerializedName("bookings") val bookings: AdminStatsBookings? = null,
    @SerializedName("payments") val payments: AdminStatsPayments? = null,
    @SerializedName("applications") val applications: AdminStatsApplications? = null,
    @SerializedName("recentActivity") val recentActivity: Int = 0
) {
    // Computed properties for easy access
    val totalUsers: Int get() = users?.totalUsers ?: 0
    val totalDestinations: Int get() = 0 // Not in backend stats, will be computed from destinations list
    val totalBookings: Int get() = bookings?.totalBookings ?: 0
    val totalCollections: Int get() = 0 // Not in backend stats, will be computed from collections list
    val totalAgents: Int get() = agents?.totalAgents ?: 0
    val pendingApplications: Int get() = applications?.pendingApplications ?: 0
    val totalRevenue: Double get() = payments?.totalRevenue ?: 0.0
}

data class AdminBookingsResponse(
    val bookings: List<BookingResponse> = emptyList()
)

data class AdminBookingStatsResponse(
    @SerializedName("total_bookings") val totalBookings: Int = 0,
    @SerializedName("pending_bookings") val pendingBookings: Int = 0,
    @SerializedName("confirmed_bookings") val confirmedBookings: Int = 0,
    @SerializedName("completed_bookings") val completedBookings: Int = 0,
    @SerializedName("cancelled_bookings") val cancelledBookings: Int = 0,
    @SerializedName("total_revenue") val totalRevenue: Double = 0.0
)

data class AdminAgentsResponse(
    val agents: List<UserData> = emptyList()
)

data class AdminAgentApplicationsResponse(
    val applications: List<AgentApplicationResponse> = emptyList()
)

data class AgentApplicationResponse(
    val id: Int,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val email: String,
    val phone: String? = null,
    val company: String? = null,
    @SerializedName("license_number") val licenseNumber: String? = null,
    val experience: String? = null,
    val motivation: String? = null,
    val status: String? = null,
    @SerializedName("admin_notes") val adminNotes: String? = null,
    @SerializedName("rejection_reason") val rejectionReason: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String? = null,
    val user: UserData? = null
)

data class ApproveAgentApplicationRequest(
    @SerializedName("admin_notes") val adminNotes: String? = null
)

data class RejectAgentApplicationRequest(
    val reason: String? = null,
    @SerializedName("admin_notes") val adminNotes: String? = null
)

data class CreateCollectionRequest(
    val name: String,
    val description: String? = null,
    val type: String? = null,
    @SerializedName("cover_image") val coverImage: String? = null,
    @SerializedName("display_order") val displayOrder: Int? = null,
    @SerializedName("is_active") val isActive: Boolean = true,
    val slug: String? = null
)

data class UpdateCollectionRequest(
    val name: String? = null,
    val description: String? = null,
    val type: String? = null,
    @SerializedName("cover_image") val coverImage: String? = null,
    @SerializedName("display_order") val displayOrder: Int? = null,
    @SerializedName("is_active") val isActive: Boolean? = null,
    val slug: String? = null
)

data class UpdateDestinationOrderRequest(
    @SerializedName("destinationOrders") val destinationOrders: Map<Int, Int> // destinationId -> order
)

// ========== Onboarding Models ==========
data class OnboardingStatusResponse(
    @SerializedName("needs_onboarding") val needsOnboarding: Boolean = false,
    @SerializedName("completed_steps") val completedSteps: List<String> = emptyList()
)

// ========== Itinerary Models ==========
data class ItineraryResponse(
    val items: List<ItineraryItemResponse> = emptyList()
)

data class ItineraryItemResponse(
    val id: Int,
    @SerializedName("destination_id") val destinationId: Int? = null,
    @SerializedName("booking_id") val bookingId: Int? = null,
    val title: String,
    val description: String? = null,
    @SerializedName("start_date") val startDate: String? = null,
    @SerializedName("end_date") val endDate: String? = null,
    val time: String? = null,
    val location: String? = null,
    val notes: String? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String? = null,
    val destination: DestinationResponse? = null,
    val booking: BookingResponse? = null
)

data class CreateItineraryItemRequest(
    @SerializedName("destination_id") val destinationId: Int? = null,
    @SerializedName("booking_id") val bookingId: Int? = null,
    val title: String,
    val description: String? = null,
    @SerializedName("start_date") val startDate: String? = null,
    @SerializedName("end_date") val endDate: String? = null,
    val time: String? = null,
    val location: String? = null,
    val notes: String? = null
)

data class UpdateItineraryItemRequest(
    val title: String? = null,
    val description: String? = null,
    @SerializedName("start_date") val startDate: String? = null,
    @SerializedName("end_date") val endDate: String? = null,
    val time: String? = null,
    val location: String? = null,
    val notes: String? = null
)

