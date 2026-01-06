<?php

namespace App\Controller;

use App\Repository\DestinationReviewRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Controller for public reviews (homepage)
 */
#[Route('/api/reviews')]
class PublicReviewController extends AbstractController
{
    /**
     * Get recent public reviews for homepage
     */
    #[Route('/public', name: 'api_reviews_public', methods: ['GET'])]
    public function getPublicReviews(
        Request $request,
        DestinationReviewRepository $reviewRepo
    ): JsonResponse {
        $limit = (int)($request->query->get('limit', 10));
        
        // Get public reviews from all destinations
        // Only include reviews where isPublic = true (or 1 in database)
        $qb = $reviewRepo->createQueryBuilder('r')
            ->leftJoin('r.user', 'u')
            ->addSelect('u')
            ->leftJoin('u.profile', 'p')
            ->addSelect('p')
            ->leftJoin('r.destination', 'd')
            ->addSelect('d')
            ->where('r.isPublic = :isPublic')
            ->setParameter('isPublic', true)
            ->orderBy('r.createdAt', 'DESC')
            ->setMaxResults($limit);
        
        $reviews = $qb->getQuery()->getResult();
        
        $data = array_map(function ($review) {
            $user = $review->getUser();
            $profile = $user->getProfile();
            $destination = $review->getDestination();
            
            return [
                'id' => $review->getId(),
                'rating' => $review->getRating(),
                'comment' => $review->getComment(),
                'createdAt' => $review->getCreatedAt()->format('c'),
                'user' => [
                    'id' => $user->getId(),
                    'firstName' => $profile?->getFirstName() ?? '',
                    'lastName' => $profile?->getLastName() ?? '',
                    'avatar' => $profile?->getAvatar(),
                ],
                'destination' => [
                    'id' => $destination->getId(),
                    'name' => $destination->getName(),
                    'city' => $destination->getCity(),
                    'country' => $destination->getCountry(),
                    'image' => $destination->getImages() ? $destination->getImages()[0] : null,
                ],
            ];
        }, $reviews);
        
        return $this->json($data);
    }
}

