<?php

namespace App\Controller;

use App\Service\RecommendationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/recommendations')]
#[IsGranted('ROLE_USER')]
class RecommendationController extends AbstractController
{
    public function __construct(
        private RecommendationService $recommendationService
    ) {
    }

    /**
     * Get personalized recommendations
     */
    #[Route('', name: 'api_recommendations', methods: ['GET'])]
    public function getRecommendations(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $limit = (int)($_GET['limit'] ?? 10);
        $recommendations = $this->recommendationService->getRecommendations($user, $limit);

        return $this->json([
            'recommendations' => array_map(function($rec) {
                $destination = $rec['destination'];
                return [
                    'destination' => [
                        'id' => $destination->getId(),
                        'name' => $destination->getName(),
                        'city' => $destination->getCity(),
                        'country' => $destination->getCountry(),
                        'category' => $destination->getCategory(),
                        'image' => $destination->getImage(),
                        'rating' => $destination->getRating(),
                        'priceMin' => $destination->getPriceMin(),
                        'priceMax' => $destination->getPriceMax(),
                        'description' => $destination->getDescription(),
                    ],
                    'score' => $rec['score'],
                    'reasons' => $rec['reasons']
                ];
            }, $recommendations)
        ]);
    }
}


