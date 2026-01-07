<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\WishlistItemRepository;
use App\Repository\DestinationReviewRepository;
use App\Repository\ActivityLogRepository;
use App\Repository\BookingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Controller for user profile endpoints
 */
class ProfileController extends AbstractController
{
    /**
     * Get current user's profile
     *
     * @return JsonResponse
     */
    #[Route('/api/profile', name: 'api_profile_get', methods: ['GET'])]
    public function getProfile(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $profile = $user->getProfile();
        $preferences = $user->getPreferences();
        
        return new JsonResponse([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $profile?->getFirstName(),
                'lastName' => $profile?->getLastName(),
                'phone' => $profile?->getPhone(),
                'profileImage' => $profile?->getAvatar(),
                'travelStyles' => $preferences?->getTravelStyles(),
                'interests' => $preferences?->getInterests(),
                'personalityAxis' => $preferences?->getPersonalityAxis(),
                'preferenceCategories' => $preferences?->getPreferenceCategories(),
            ]
        ]);
    }

    /**
     * Update user profile
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/api/profile', name: 'api_profile_update', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $preferences = $user->getPreferences();
        $profile = $user->getProfile();

        if (!$preferences) {
            $preferences = new \App\Entity\UserPreferences();
            $preferences->setUser($user);
            $user->setPreferences($preferences);
            $em->persist($preferences);
        }

        if (isset($data['personalityAxis'])) {
            $preferences->setPersonalityAxis($data['personalityAxis']);
        }

        if (isset($data['preferenceCategories'])) {
            $preferences->setPreferenceCategories($data['preferenceCategories']);
        }

        if (isset($data['travelStyles'])) {
            $preferences->setTravelStyles($data['travelStyles']);
        }

        if (isset($data['interests'])) {
            $preferences->setInterests($data['interests']);
        }

        if (isset($data['firstName']) && $profile) {
            $profile->setFirstName($data['firstName']);
        }

        if (isset($data['lastName']) && $profile) {
            $profile->setLastName($data['lastName']);
        }

        if (isset($data['phone']) && $profile) {
            $profile->setPhone($data['phone']);
        }

        $em->flush();

        return new JsonResponse([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $profile?->getFirstName(),
                'lastName' => $profile?->getLastName(),
                'phone' => $profile?->getPhone(),
                'profileImage' => $profile?->getAvatar(),
                'travelStyles' => $preferences->getTravelStyles(),
                'interests' => $preferences->getInterests(),
                'personalityAxis' => $preferences->getPersonalityAxis(),
                'preferenceCategories' => $preferences->getPreferenceCategories(),
            ]
        ]);
    }

    /**
     * Upload or update profile avatar
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/api/profile/avatar', name: 'api_profile_avatar', methods: ['POST'])]
    public function uploadAvatar(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user || !$user instanceof \App\Entity\User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $file = $request->files->get('avatar');
        if (!$file) {
            return new JsonResponse(['error' => 'No avatar file provided'], 400);
        }

        // Basic validation
        $allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMime, true)) {
            return new JsonResponse(['error' => 'Invalid file type'], 400);
        }
        if ($file->getSize() > 5 * 1024 * 1024) { // 5MB
            return new JsonResponse(['error' => 'File too large'], 400);
        }

        $uploadDir = $this->getParameter('profiles_directory');
        $safeName = uniqid('avatar_', true) . '.' . $file->guessExtension();
        try {
            $file->move($uploadDir, $safeName);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Failed to save file'], 500);
        }

        $profile = $user->getProfile();
        if (!$profile) {
            $profile = new \App\Entity\UserProfile();
            $profile->setUser($user);
            $user->setProfile($profile);
            $em->persist($profile);
        }

        // Assuming frontend can resolve this path; adjust if a CDN/base URL is used
        $profile->setAvatar($safeName);
        $em->flush();

        return new JsonResponse([
            'message' => 'Avatar updated successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $profile?->getFirstName(),
                'lastName' => $profile?->getLastName(),
                'phone' => $profile?->getPhone(),
                'profileImage' => $profile?->getAvatar(),
            ]
        ], 200);
    }

    /**
     * Phase 1: Get public user profile (read-only)
     * 
     * Shows public profile information and contribution summary
     * Does not require authentication
     */
    #[Route('/api/users/{id}/profile', name: 'api_user_public_profile', methods: ['GET'])]
    public function getPublicProfile(
        int $id,
        UserRepository $userRepo,
        WishlistItemRepository $wishlistRepo,
        DestinationReviewRepository $reviewRepo
    ): JsonResponse {
        $user = $userRepo->find($id);
        
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        // Only show active users
        if ($user->getStatus() !== 'ACTIVE') {
            return new JsonResponse(['error' => 'User profile not available'], 404);
        }

        $profile = $user->getProfile();
        $preferences = $user->getPreferences();
        $activity = $user->getActivity();

        // Phase 1: Contribution summary
        $wishlistCount = $wishlistRepo->countByUser($user);
        $reviewCount = $reviewRepo->countByUser($user);

        return new JsonResponse([
            'id' => $user->getId(),
            'firstName' => $profile?->getFirstName(),
            'lastName' => $profile?->getLastName(),
            'profileImage' => $profile?->getAvatar(),
            // Phase 1: Public travel preferences (non-sensitive)
            'travelStyles' => $preferences?->getTravelStyles(),
            'interests' => $preferences?->getInterests(),
            // Phase 1: Contribution summary
            'contributions' => [
                'wishlistCount' => $wishlistCount,
                'reviewCount' => $reviewCount, // Will be implemented in Phase 2
                'totalContributions' => $wishlistCount + $reviewCount,
            ],
            // Public activity info
            'memberSince' => $activity?->getCreatedAt()?->format('Y-m-d'),
            'isVerified' => $user->isVerified(),
            // Roles (for trust signals - Phase 2)
            'isAgent' => $user->isAgent(),
        ]);
    }

    /**
     * Get current user's reviews and ratings
     */
    #[Route('/api/profile/reviews', name: 'api_profile_reviews', methods: ['GET'])]
    public function getMyReviews(
        DestinationReviewRepository $reviewRepo
    ): JsonResponse {
        $user = $this->getUser();
        
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $reviews = $reviewRepo->findByUser($user, 50);
        $data = array_map(function ($review) {
            $destination = $review->getDestination();
            return [
                'id' => $review->getId(),
                'rating' => $review->getRating(),
                'comment' => $review->getComment(),
                'isPublic' => $review->isPublic(),
                'createdAt' => $review->getCreatedAt()->format('c'),
                'updatedAt' => $review->getUpdatedAt()?->format('c'),
                'destination' => [
                    'id' => $destination->getId(),
                    'name' => $destination->getName(),
                    'city' => $destination->getCity(),
                    'country' => $destination->getCountry(),
                    'image' => $destination->getImages() ? $destination->getImages()[0] : null,
                ],
            ];
        }, $reviews);

        return new JsonResponse($data);
    }

    /**
     * Get current user's activity summary with detailed activity log
     */
    #[Route('/api/profile/activity', name: 'api_profile_activity', methods: ['GET'])]
    public function getMyActivity(
        DestinationReviewRepository $reviewRepo,
        WishlistItemRepository $wishlistRepo,
        ActivityLogRepository $activityLogRepo,
        BookingRepository $bookingRepo
    ): JsonResponse {
        $user = $this->getUser();
        
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $activity = $user->getActivity();
        $reviews = $reviewRepo->findByUser($user, 10);
        $wishlistCount = $wishlistRepo->countByUser($user);
        $reviewCount = $reviewRepo->countByUser($user);
        
        // Get booking statistics
        $allBookings = $bookingRepo->findByUser($user);
        $totalBookings = count($allBookings);
        $confirmedBookings = count(array_filter($allBookings, fn($b) => $b->getStatus() === 'CONFIRMED'));
        $completedBookings = count(array_filter($allBookings, fn($b) => $b->getStatus() === 'COMPLETED'));

        // Calculate average rating given
        $avgRatingGiven = null;
        if ($reviewCount > 0) {
            $ratings = array_map(fn($r) => $r->getRating(), $reviews);
            $avgRatingGiven = round(array_sum($ratings) / count($ratings), 1);
        }

        // Get detailed activity log
        $activityLogs = $activityLogRepo->findByUser($user, 100);
        $activityTimeline = array_map(function ($log) {
            $actionLabels = [
                'view_destination' => 'Viewed destination',
                'create_review' => 'Created review',
                'update_review' => 'Updated review',
                'delete_review' => 'Deleted review',
                'add_wishlist' => 'Added to wishlist',
                'remove_wishlist' => 'Removed from wishlist',
                'create_booking' => 'Created booking',
                'confirm_booking' => 'Confirmed booking',
                'cancel_booking' => 'Cancelled booking',
                'update_booking' => 'Updated booking',
                'complete_booking' => 'Completed booking',
                'finalize_booking' => 'Finalized booking',
            ];
            
            return [
                'id' => $log->getId(),
                'actionType' => $log->getActionType(),
                'actionLabel' => $actionLabels[$log->getActionType()] ?? ucfirst(str_replace('_', ' ', $log->getActionType())),
                'entityType' => $log->getEntityType(),
                'entityId' => $log->getEntityId(),
                'metadata' => $log->getMetadata(),
                'createdAt' => $log->getCreatedAt()->format('c'),
            ];
        }, $activityLogs);

        return new JsonResponse([
            'memberSince' => $activity?->getCreatedAt()?->format('c'),
            'lastLogin' => $activity?->getLastLogin()?->format('c'),
            'stats' => [
                'totalReviews' => $reviewCount,
                'totalWishlistItems' => $wishlistCount,
                'averageRatingGiven' => $avgRatingGiven,
                'totalViews' => $activityLogRepo->countByActionType($user, 'view_destination'),
                'totalBookings' => $totalBookings,
                'confirmedBookings' => $confirmedBookings,
                'completedBookings' => $completedBookings,
            ],
            'recentReviews' => array_map(function ($review) {
                $destination = $review->getDestination();
                return [
                    'id' => $review->getId(),
                    'rating' => $review->getRating(),
                    'comment' => $review->getComment(),
                    'createdAt' => $review->getCreatedAt()->format('c'),
                    'destination' => [
                        'id' => $destination->getId(),
                        'name' => $destination->getName(),
                    ],
                ];
            }, array_slice($reviews, 0, 5)),
            'activityTimeline' => $activityTimeline,
        ]);
    }
}

