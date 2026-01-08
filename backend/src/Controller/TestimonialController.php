<?php

namespace App\Controller;

use App\Repository\DestinationReviewRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/testimonials')]
class TestimonialController extends AbstractController
{
    public function __construct(
        private DestinationReviewRepository $reviewRepository
    ) {
    }

    /**
     * Get featured testimonials from real reviews
     */
    #[Route('/featured', name: 'api_testimonials_featured', methods: ['GET'])]
    public function getFeatured(): JsonResponse
    {
        try {
            // Get top-rated reviews with comments (these become testimonials)
            $reviews = $this->reviewRepository->createQueryBuilder('r')
                ->where('r.rating >= 4')
                ->andWhere('r.comment IS NOT NULL')
                ->andWhere('LENGTH(r.comment) > 20')
                ->orderBy('r.rating', 'DESC')
                ->addOrderBy('r.createdAt', 'DESC')
                ->setMaxResults(6)
                ->getQuery()
                ->getResult();

            $testimonials = [];
            foreach ($reviews as $review) {
                $user = $review->getUser();
                $destination = $review->getDestination();
                $profile = $user?->getProfile();

                $testimonials[] = [
                    'id' => $review->getId(),
                    'name' => $profile 
                        ? ($profile->getFirstName() . ' ' . $profile->getLastName())
                        : ($user?->getEmail() ?? 'Anonymous'),
                    'location' => $destination->getCity() 
                        ? $destination->getCity() . ', ' . $destination->getCountry()
                        : $destination->getCountry(),
                    'rating' => $review->getRating(),
                    'text' => $review->getComment(),
                    'avatar' => $profile?->getAvatar() ? '/uploads/profiles/' . $profile->getAvatar() : null,
                    'destination' => [
                        'id' => $destination->getId(),
                        'name' => $destination->getName(),
                    ],
                    'createdAt' => $review->getCreatedAt()->format('Y-m-d'),
                ];
            }

            return $this->json([
                'testimonials' => $testimonials
            ]);
        } catch (\Exception $e) {
            error_log('Error fetching testimonials: ' . $e->getMessage());
            return $this->json([
                'testimonials' => []
            ]);
        }
    }
}



