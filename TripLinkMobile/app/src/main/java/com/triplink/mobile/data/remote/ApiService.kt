package com.triplink.mobile.data.remote

import com.triplink.mobile.data.model.*
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

/**
 * Main API service interface matching all Symfony backend endpoints
 * DO NOT modify endpoint paths or request/response structures
 */
interface ApiService {
    
    // ========== Authentication ==========
    @Multipart
    @POST("/api/register")
    suspend fun register(
        @Part("email") email: okhttp3.RequestBody,
        @Part("password") password: okhttp3.RequestBody,
        @Part("firstName") firstName: okhttp3.RequestBody,
        @Part("lastName") lastName: okhttp3.RequestBody,
        @Part("phone") phone: okhttp3.RequestBody,
        @Part("travelStyles") travelStyles: okhttp3.RequestBody?,
        @Part("interests") interests: okhttp3.RequestBody?,
        @Part profileImage: okhttp3.MultipartBody.Part?
    ): Response<AuthResponse>
    
    @POST("/api/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("/api/logout")
    suspend fun logout(): Response<ApiResponse>
    
    @POST("/api/logout-all")
    suspend fun logoutAll(): Response<ApiResponse>
    
    @POST("/api/refresh-token")
    suspend fun refreshToken(): Response<AuthResponse>
    
    @GET("/api/me")
    suspend fun getCurrentUser(): Response<UserResponse>
    
    // ========== Health Check ==========
    @GET("/health")
    suspend fun healthCheck(): Response<HealthResponse>
    
    // ========== Profile ==========
    @GET("/api/profile")
    suspend fun getProfile(): Response<ProfileResponse>
    
    @PUT("/api/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<ProfileResponse>
    
    @GET("/api/users/{userId}/profile")
    suspend fun getPublicProfile(@Path("userId") userId: Int): Response<PublicProfileResponse>
    
    @GET("/api/profile/reviews")
    suspend fun getProfileReviews(): Response<List<ReviewResponse>>
    
    @GET("/api/profile/activity")
    suspend fun getProfileActivity(): Response<ProfileActivityResponse>
    
    // ========== Account ==========
    @POST("/api/account/delete")
    suspend fun deleteAccount(@Body request: DeleteAccountRequest): Response<ApiResponse>
    
    @Multipart
    @POST("/api/profile/avatar")
    suspend fun uploadAvatar(@Part avatar: MultipartBody.Part): Response<ProfileResponse>
    
    // ========== Destinations ==========
    @GET("/api/destinations")
    suspend fun getDestinations(
        @Query("q") query: String? = null,
        @Query("country") country: String? = null,
        @Query("tags") tags: String? = null,
        @Query("category") category: String? = null,
        @Query("priceMin") priceMin: Double? = null,
        @Query("priceMax") priceMax: Double? = null,
        @Query("sort") sort: String? = null,
        @Query("limit") limit: Int = 100,
        @Query("offset") offset: Int = 0
    ): Response<List<DestinationResponse>>
    
    @GET("/api/destinations/{id}")
    suspend fun getDestination(@Path("id") id: Int): Response<DestinationResponse>
    
    @GET("/api/destinations/featured")
    suspend fun getFeaturedDestinations(): Response<List<DestinationResponse>>
    
    @GET("/api/destinations/popular")
    suspend fun getPopularDestinations(): Response<List<DestinationResponse>>
    
    @GET("/api/destinations/autocomplete")
    suspend fun getAutocompleteSuggestions(
        @Query("q") query: String,
        @Query("limit") limit: Int = 10
    ): Response<List<AutocompleteSuggestion>>
    
    @GET("/api/destinations/tags")
    suspend fun getAllTags(): Response<List<String>>
    
    @GET("/api/destinations/categories")
    suspend fun getAllCategories(): Response<List<String>>
    
    @GET("/api/destinations/recommended")
    suspend fun getRecommendedDestinations(): Response<List<DestinationResponse>>
    
    // ========== Collections ==========
    @GET("/api/collections")
    suspend fun getCollections(@Query("type") type: String? = null): Response<List<CollectionResponse>>
    
    @GET("/api/collections/{slug}")
    suspend fun getCollectionBySlug(@Path("slug") slug: String): Response<CollectionDetailResponse>
    
    // ========== Wishlist ==========
    @GET("/api/wishlist")
    suspend fun getWishlist(): Response<List<DestinationResponse>>
    
    @POST("/api/wishlist/{destinationId}")
    suspend fun addToWishlist(@Path("destinationId") destinationId: Int): Response<ApiResponse>
    
    @DELETE("/api/wishlist/{destinationId}")
    suspend fun removeFromWishlist(@Path("destinationId") destinationId: Int): Response<ApiResponse>
    
    // ========== Bookings ==========
    @GET("/api/bookings")
    suspend fun getMyBookings(): Response<BookingsListResponse>
    
    @GET("/api/bookings/{id}")
    suspend fun getBooking(@Path("id") id: Int): Response<BookingResponse>
    
    @POST("/api/bookings")
    suspend fun createBooking(@Body request: CreateBookingRequest): Response<BookingResponse>
    
    @PUT("/api/bookings/{id}")
    suspend fun updateBooking(@Path("id") id: Int, @Body request: UpdateBookingRequest): Response<BookingResponse>
    
    @POST("/api/bookings/{id}/cancel")
    suspend fun cancelBooking(@Path("id") id: Int, @Body request: CancelBookingRequest): Response<ApiResponse>
    
    @POST("/api/bookings/{id}/complete")
    suspend fun completeBooking(@Path("id") id: Int): Response<BookingResponse>
    
    @POST("/api/bookings/{id}/finalize")
    suspend fun finalizeBooking(@Path("id") id: Int, @Body request: FinalizeBookingRequest): Response<BookingResponse>
    
    @POST("/api/bookings/check-routing")
    suspend fun checkRouting(@Body request: CheckRoutingRequest): Response<RoutingResponse>
    
    // ========== Payments ==========
    @POST("/api/payments/create-intent")
    suspend fun createPaymentIntent(@Body request: CreatePaymentIntentRequest): Response<PaymentIntentResponse>
    
    @POST("/api/payments/create-checkout")
    suspend fun createCheckoutSession(@Body request: CreateCheckoutSessionRequest): Response<CheckoutSessionResponse>
    
    @POST("/api/payments/verify-checkout")
    suspend fun verifyCheckoutSession(@Body request: VerifyCheckoutRequest): Response<ApiResponse>
    
    @POST("/api/payments/confirm")
    suspend fun confirmPayment(@Body request: ConfirmPaymentRequest): Response<ApiResponse>
    
    // ========== Agent ==========
    @POST("/api/agent/apply")
    suspend fun submitAgentApplication(@Body request: AgentApplicationRequest): Response<ApiResponse>
    
    @GET("/api/agent/application")
    suspend fun getAgentApplicationStatus(): Response<AgentApplicationResponse>
    
    @GET("/api/agent/dashboard")
    suspend fun getAgentDashboard(): Response<AgentDashboardResponse>
    
    @GET("/api/agent/pending-bookings")
    suspend fun getPendingBookings(): Response<List<BookingResponse>>
    
    @GET("/api/agent/bookings")
    suspend fun getAgentBookings(): Response<List<BookingResponse>>
    
    @POST("/api/agent/bookings/{id}/assign")
    suspend fun assignBooking(@Path("id") id: Int): Response<ApiResponse>
    
    @POST("/api/agent/bookings/{id}/confirm")
    suspend fun confirmAgentBooking(@Path("id") id: Int): Response<ApiResponse>
    
    @POST("/api/agent/messages")
    suspend fun sendMessage(@Body request: SendMessageRequest): Response<ApiResponse>
    
    @GET("/api/agent/messages/conversation/{clientId}")
    suspend fun getConversation(@Path("clientId") clientId: Int): Response<List<MessageResponse>>
    
    @GET("/api/agent/messages/unread-count")
    suspend fun getUnreadMessageCount(): Response<UnreadCountResponse>
    
    @POST("/api/agent/messages/{id}/read")
    suspend fun markMessageAsRead(@Path("id") id: Int): Response<ApiResponse>
    
    @GET("/api/agent/commissions")
    suspend fun getCommissions(): Response<List<CommissionResponse>>
    
    // ========== Admin ==========
    @GET("/api/admin/users")
    suspend fun getUsers(): Response<List<UserData>>
    
    @GET("/api/admin/users/{id}")
    suspend fun getUserDetails(@Path("id") id: Int): Response<UserDetailsResponse>
    
    @PUT("/api/admin/users/{id}/status")
    suspend fun updateUserStatus(@Path("id") id: Int, @Body request: UpdateUserStatusRequest): Response<ApiResponse>
    
    @DELETE("/api/admin/users/{id}")
    suspend fun deleteUser(@Path("id") id: Int): Response<ApiResponse>
    
    // ========== Admin Destinations ==========
    @GET("/api/admin/destinations")
    suspend fun getAdminDestinations(): Response<List<DestinationResponse>>
    
    @PUT("/api/admin/destinations/{id}/featured")
    suspend fun updateDestinationFeatured(@Path("id") id: Int, @Body request: Map<String, Any>): Response<ApiResponse>
    
    @POST("/api/admin/destinations/{id}/feature")
    suspend fun featureDestination(@Path("id") id: Int): Response<ApiResponse>
    
    @POST("/api/admin/destinations/{id}/unfeature")
    suspend fun unfeatureDestination(@Path("id") id: Int): Response<ApiResponse>
    
    @POST("/api/admin/destinations/{id}/pin")
    suspend fun pinDestination(@Path("id") id: Int): Response<ApiResponse>
    
    @POST("/api/admin/destinations/{id}/unpin")
    suspend fun unpinDestination(@Path("id") id: Int): Response<ApiResponse>
    
    @POST("/api/admin/destinations")
    suspend fun createDestination(@Body request: Map<String, Any>): Response<DestinationResponse>
    
    @PUT("/api/admin/destinations/{id}")
    suspend fun updateDestination(@Path("id") id: Int, @Body request: Map<String, Any>): Response<DestinationResponse>
    
    @DELETE("/api/admin/destinations/{id}")
    suspend fun deleteDestination(@Path("id") id: Int): Response<ApiResponse>
    
    // ========== Admin Stats ==========
    @GET("/api/admin/stats")
    suspend fun getAdminStats(): Response<AdminStatsResponse>
    
    // ========== Admin Bookings ==========
    @GET("/api/admin/bookings")
    suspend fun getAdminBookings(): Response<AdminBookingsResponse>
    
    @GET("/api/admin/bookings/stats")
    suspend fun getAdminBookingStats(): Response<AdminBookingStatsResponse>
    
    // ========== Admin Agents ==========
    @GET("/api/admin/agents")
    suspend fun getAdminAgents(): Response<AdminAgentsResponse>
    
    @POST("/api/admin/agents/{id}/remove-role")
    suspend fun removeAgentRole(@Path("id") id: Int): Response<ApiResponse>
    
    // ========== Admin Agent Applications ==========
    @GET("/api/admin/agent-applications")
    suspend fun getAdminAgentApplications(): Response<AdminAgentApplicationsResponse>
    
    @POST("/api/admin/agent-applications/{id}/approve")
    suspend fun approveAgentApplication(@Path("id") id: Int, @Body request: ApproveAgentApplicationRequest): Response<ApiResponse>
    
    @POST("/api/admin/agent-applications/{id}/reject")
    suspend fun rejectAgentApplication(@Path("id") id: Int, @Body request: RejectAgentApplicationRequest): Response<ApiResponse>
    
    // ========== Admin Collections ==========
    @GET("/api/admin/collections")
    suspend fun getAdminCollections(): Response<List<CollectionResponse>>
    
    @GET("/api/admin/collections/{id}")
    suspend fun getAdminCollection(@Path("id") id: Int): Response<CollectionDetailResponse>
    
    @POST("/api/admin/collections")
    suspend fun createCollection(@Body request: CreateCollectionRequest): Response<CollectionResponse>
    
    @PUT("/api/admin/collections/{id}")
    suspend fun updateCollection(@Path("id") id: Int, @Body request: UpdateCollectionRequest): Response<CollectionResponse>
    
    @DELETE("/api/admin/collections/{id}")
    suspend fun deleteCollection(@Path("id") id: Int): Response<ApiResponse>
    
    @POST("/api/admin/collections/{collectionId}/destinations/{destinationId}")
    suspend fun addDestinationToCollection(
        @Path("collectionId") collectionId: Int,
        @Path("destinationId") destinationId: Int,
        @Body request: Map<String, Any>? = null
    ): Response<ApiResponse>
    
    @DELETE("/api/admin/collections/{collectionId}/destinations/{destinationId}")
    suspend fun removeDestinationFromCollection(
        @Path("collectionId") collectionId: Int,
        @Path("destinationId") destinationId: Int
    ): Response<ApiResponse>
    
    @PUT("/api/admin/collections/{collectionId}/destinations/order")
    suspend fun updateDestinationOrder(
        @Path("collectionId") collectionId: Int,
        @Body request: UpdateDestinationOrderRequest
    ): Response<ApiResponse>
    
    // ========== Admin User Actions ==========
    @POST("/api/admin/users/{id}/suspend")
    suspend fun suspendUser(@Path("id") id: Int): Response<ApiResponse>
    
    @POST("/api/admin/users/{id}/activate")
    suspend fun activateUser(@Path("id") id: Int): Response<ApiResponse>
    
    @POST("/api/admin/users/{id}/ban")
    suspend fun banUser(@Path("id") id: Int): Response<ApiResponse>
    
    // ========== Reviews ==========
    @GET("/api/destinations/{id}/reviews")
    suspend fun getDestinationReviews(@Path("id") id: Int): Response<List<ReviewResponse>>
    
    @GET("/api/destinations/{id}/reviews/stats")
    suspend fun getReviewStats(@Path("id") id: Int): Response<ReviewStatsResponse>
    
    @POST("/api/destinations/{id}/reviews")
    suspend fun createReview(@Path("id") id: Int, @Body request: CreateReviewRequest): Response<ReviewResponse>
    
    @PUT("/api/destinations/{id}/reviews/{reviewId}")
    suspend fun updateReview(
        @Path("id") id: Int,
        @Path("reviewId") reviewId: Int,
        @Body request: UpdateReviewRequest
    ): Response<ReviewResponse>
    
    @DELETE("/api/destinations/{id}/reviews/{reviewId}")
    suspend fun deleteReview(
        @Path("id") id: Int,
        @Path("reviewId") reviewId: Int
    ): Response<ApiResponse>
    
    @GET("/api/reviews/public")
    suspend fun getPublicReviews(): Response<List<ReviewResponse>>
    
    // ========== Recommendations ==========
    @GET("/api/recommendations")
    suspend fun getRecommendations(): Response<List<DestinationResponse>>
    
    // ========== Onboarding ==========
    @POST("/api/onboarding")
    suspend fun submitOnboarding(@Body request: OnboardingRequest): Response<ApiResponse>
    
    @GET("/api/onboarding/status")
    suspend fun getOnboardingStatus(): Response<OnboardingStatusResponse>
    
    @POST("/api/onboarding/complete")
    suspend fun completeOnboarding(@Body request: OnboardingRequest): Response<ApiResponse>
    
    @POST("/api/onboarding/skip")
    suspend fun skipOnboarding(): Response<ApiResponse>
    
    // ========== Itinerary ==========
    @GET("/api/itinerary")
    suspend fun getItinerary(
        @Query("startDate") startDate: String? = null,
        @Query("endDate") endDate: String? = null
    ): Response<ItineraryResponse>
    
    @POST("/api/itinerary")
    suspend fun createItineraryItem(@Body request: CreateItineraryItemRequest): Response<ItineraryItemResponse>
    
    @PUT("/api/itinerary/{id}")
    suspend fun updateItineraryItem(
        @Path("id") id: Int,
        @Body request: UpdateItineraryItemRequest
    ): Response<ItineraryItemResponse>
    
    @DELETE("/api/itinerary/{id}")
    suspend fun deleteItineraryItem(@Path("id") id: Int): Response<ApiResponse>
    
    // ========== Travel Documents ==========
    @GET("/api/documents")
    suspend fun getTravelDocuments(): Response<TravelDocumentListResponse>
    
    @retrofit2.http.Multipart
    @POST("/api/documents")
    suspend fun uploadTravelDocument(
        @retrofit2.http.Part("file") file: okhttp3.MultipartBody.Part,
        @retrofit2.http.Part("data") data: okhttp3.RequestBody
    ): Response<TravelDocumentResponse>
    
    @PUT("/api/documents/{id}")
    suspend fun updateTravelDocument(
        @Path("id") id: Int,
        @Body request: UpdateTravelDocumentRequest
    ): Response<TravelDocumentResponse>
    
    @DELETE("/api/documents/{id}")
    suspend fun deleteTravelDocument(@Path("id") id: Int): Response<ApiResponse>
    
    // ========== Notifications ==========
    @GET("/api/notifications")
    suspend fun getNotifications(
        @Query("limit") limit: Int = 50,
        @Query("offset") offset: Int = 0,
        @Query("unread_only") unreadOnly: String? = null
    ): Response<NotificationListResponse>
    
    @GET("/api/notifications/unread-count")
    suspend fun getUnreadCount(): Response<UnreadCountResponse>
    
    @POST("/api/notifications/mark-read")
    suspend fun markAsRead(@Body request: MarkNotificationsReadRequest): Response<ApiResponse>
    
    @POST("/api/notifications/mark-all-read")
    suspend fun markAllAsRead(): Response<ApiResponse>
    
    @POST("/api/notifications/{id}/read")
    suspend fun markNotificationAsRead(@Path("id") id: Int): Response<ApiResponse>
    
    // ========== Public Stats ==========
    @GET("/api/stats/public")
    suspend fun getPublicStats(): Response<PublicStatsResponse>
    
    // ========== FAQ ==========
    @GET("/api/faq")
    suspend fun getFAQs(): Response<List<FAQResponse>>
    
    // ========== Testimonials ==========
    @GET("/api/testimonials")
    suspend fun getTestimonials(): Response<List<TestimonialResponse>>
    
    // ========== Password Reset ==========
    @POST("/api/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ApiResponse>
    
    @POST("/api/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<ApiResponse>
    
    @POST("/api/change-password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): Response<ApiResponse>
    
    // ========== Email Verification ==========
    @GET("/verify/email")
    suspend fun verifyEmail(@Query("token") token: String): Response<ApiResponse>
    
    @POST("/api/resend-verification")
    suspend fun resendVerification(): Response<ApiResponse>
}

