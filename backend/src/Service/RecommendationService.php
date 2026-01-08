<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Destination;
use App\Repository\DestinationRepository;
use App\Repository\BookingRepository;
use App\Repository\ActivityLogRepository;
use App\Repository\WishlistItemRepository;

class RecommendationService
{
    public function __construct(
        private DestinationRepository $destinationRepository,
        private BookingRepository $bookingRepository,
        private ActivityLogRepository $activityLogRepository,
        private WishlistItemRepository $wishlistRepository
    ) {
    }

    /**
     * Get personalized recommendations for a user
     */
    public function getRecommendations(User $user, int $limit = 10): array
    {
        $recommendations = [];
        
        // Get user preferences
        $preferences = $user->getPreferences();
        $personality = $preferences?->getPersonality() ?? [];
        $categories = $preferences?->getCategories() ?? [];

        // Get user's booking history
        $bookings = $this->bookingRepository->findByUser($user);
        $bookedDestinationIds = array_map(fn($b) => $b->getDestination()->getId(), $bookings);

        // Get user's wishlist
        $wishlist = $this->wishlistRepository->findByUser($user);
        $wishlistDestinationIds = array_map(fn($w) => $w->getDestination()->getId(), $wishlist);

        // Get user's viewed destinations
        $viewedLogs = $this->activityLogRepository->findByActionType($user, 'view_destination', 50);
        $viewedDestinationIds = array_unique(array_map(function($log) {
            return $log->getEntityId();
        }, $viewedLogs));

        // Get all destinations
        $allDestinations = $this->destinationRepository->findAll();

        // Score each destination
        foreach ($allDestinations as $destination) {
            // Skip if already booked
            if (in_array($destination->getId(), $bookedDestinationIds)) {
                continue;
            }

            $score = $this->calculateRecommendationScore(
                $destination,
                $user,
                $personality,
                $categories,
                $wishlistDestinationIds,
                $viewedDestinationIds
            );

            if ($score > 0) {
                $recommendations[] = [
                    'destination' => $destination,
                    'score' => $score,
                    'reasons' => $this->getRecommendationReasons(
                        $destination,
                        $personality,
                        $categories,
                        $wishlistDestinationIds,
                        $viewedDestinationIds
                    )
                ];
            }
        }

        // Sort by score descending
        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);

        // Return top recommendations
        return array_slice($recommendations, 0, $limit);
    }

    /**
     * Calculate recommendation score for a destination
     */
    private function calculateRecommendationScore(
        Destination $destination,
        User $user,
        array $personality,
        array $categories,
        array $wishlistIds,
        array $viewedIds
    ): float {
        $score = 0.0;

        // Base score from destination rating
        $score += ($destination->getRating() ?? 0) * 10;

        // Category match (if user has category preferences)
        if (!empty($categories) && $destination->getCategory()) {
            $categoryKey = strtolower($destination->getCategory());
            if (isset($categories[$categoryKey]) && $categories[$categoryKey] > 0) {
                $score += $categories[$categoryKey] * 20;
            }
        }

        // Tag match (if user has preferences)
        if (!empty($categories) && $destination->getTags()) {
            $tags = is_array($destination->getTags()) ? $destination->getTags() : json_decode($destination->getTags(), true) ?? [];
            foreach ($tags as $tag) {
                $tagKey = strtolower($tag);
                if (isset($categories[$tagKey]) && $categories[$tagKey] > 0) {
                    $score += $categories[$tagKey] * 15;
                }
            }
        }

        // Personality match (adventure, relaxation, culture, etc.)
        if (!empty($personality)) {
            $destinationCategory = strtolower($destination->getCategory() ?? '');
            
            // Adventure destinations
            if (in_array($destinationCategory, ['adventure', 'mountain', 'outdoor']) && isset($personality['adventure'])) {
                $score += $personality['adventure'] * 15;
            }
            
            // Relaxation destinations
            if (in_array($destinationCategory, ['beach', 'spa', 'resort']) && isset($personality['relaxation'])) {
                $score += $personality['relaxation'] * 15;
            }
            
            // Cultural destinations
            if (in_array($destinationCategory, ['cultural', 'city', 'historical']) && isset($personality['culture'])) {
                $score += $personality['culture'] * 15;
            }
        }

        // Wishlist boost
        if (in_array($destination->getId(), $wishlistIds)) {
            $score += 50;
        }

        // Viewed but not booked boost
        if (in_array($destination->getId(), $viewedIds)) {
            $score += 25;
        }

        // Popularity boost (if destination is featured)
        if ($destination->isFeatured()) {
            $score += 20;
        }

        // Price consideration (if user has budget preferences)
        // This could be enhanced with actual user budget data

        return round($score, 2);
    }

    /**
     * Get reasons why a destination is recommended
     */
    private function getRecommendationReasons(
        Destination $destination,
        array $personality,
        array $categories,
        array $wishlistIds,
        array $viewedIds
    ): array {
        $reasons = [];

        if (in_array($destination->getId(), $wishlistIds)) {
            $reasons[] = 'In your wishlist';
        }

        if (in_array($destination->getId(), $viewedIds)) {
            $reasons[] = 'You viewed this destination';
        }

        if ($destination->isFeatured()) {
            $reasons[] = 'Popular destination';
        }

        if (!empty($categories) && $destination->getCategory()) {
            $categoryKey = strtolower($destination->getCategory());
            if (isset($categories[$categoryKey]) && $categories[$categoryKey] > 0) {
                $reasons[] = "Matches your interest in {$destination->getCategory()}";
            }
        }

        if ($destination->getRating() && $destination->getRating() >= 4.5) {
            $reasons[] = 'Highly rated by travelers';
        }

        return $reasons;
    }
}




