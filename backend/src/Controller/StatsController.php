<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\DestinationRepository;
use App\Repository\BookingRepository;
use App\Repository\DestinationReviewRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/stats')]
class StatsController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private DestinationRepository $destinationRepository,
        private BookingRepository $bookingRepository,
        private DestinationReviewRepository $reviewRepository
    ) {
    }

    /**
     * Get public platform statistics
     */
    #[Route('/public', name: 'api_stats_public', methods: ['GET'])]
    public function getPublicStats(): JsonResponse
    {
        try {
            // Get real stats from database
            $totalUsers = $this->userRepository->count(['status' => 'ACTIVE']);
            $totalDestinations = $this->destinationRepository->count([]);
            $totalBookings = $this->bookingRepository->count(['status' => 'CONFIRMED']);
            
            // Calculate average rating from reviews
            $reviews = $this->reviewRepository->findAll();
            $avgRating = 0;
            if (count($reviews) > 0) {
                $totalRating = 0;
                foreach ($reviews as $review) {
                    $totalRating += $review->getRating();
                }
                $avgRating = round($totalRating / count($reviews), 1);
            }

            // Calculate satisfaction rate (based on reviews with 4+ stars)
            $satisfactionRate = 0;
            if (count($reviews) > 0) {
                $satisfiedReviews = 0;
                foreach ($reviews as $review) {
                    if ($review->getRating() >= 4) {
                        $satisfiedReviews++;
                    }
                }
                $satisfactionRate = round(($satisfiedReviews / count($reviews)) * 100);
            }

            return $this->json([
                'stats' => [
                    'totalUsers' => $totalUsers,
                    'totalDestinations' => $totalDestinations,
                    'totalBookings' => $totalBookings,
                    'averageRating' => $avgRating,
                    'satisfactionRate' => $satisfactionRate,
                ],
                'formatted' => [
                    'users' => $this->formatNumber($totalUsers),
                    'destinations' => $this->formatNumber($totalDestinations),
                    'bookings' => $this->formatNumber($totalBookings),
                    'rating' => number_format($avgRating, 1),
                    'satisfaction' => $satisfactionRate . '%',
                ]
            ]);
        } catch (\Exception $e) {
            error_log('Error fetching stats: ' . $e->getMessage());
            return $this->json([
                'error' => 'Failed to fetch statistics',
                'stats' => [
                    'totalUsers' => 0,
                    'totalDestinations' => 0,
                    'totalBookings' => 0,
                    'averageRating' => 0,
                    'satisfactionRate' => 0,
                ],
                'formatted' => [
                    'users' => '0',
                    'destinations' => '0',
                    'bookings' => '0',
                    'rating' => '0.0',
                    'satisfaction' => '0%',
                ]
            ], 500);
        }
    }

    private function formatNumber(int $number): string
    {
        if ($number >= 1000000) {
            return round($number / 1000000, 1) . 'M+';
        } elseif ($number >= 1000) {
            return round($number / 1000, 1) . 'K+';
        }
        return (string)$number;
    }
}

