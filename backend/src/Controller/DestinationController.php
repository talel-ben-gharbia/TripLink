<?php

namespace App\Controller;

use App\Repository\DestinationRepository;
use App\Repository\ActivityLogRepository;
use App\Entity\ActivityLog;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class DestinationController extends AbstractController
{
    /**
     * Phase 1: Enhanced destination listing with multi-tag filtering
     * 
     * Query parameters:
     * - q: Search query
     * - category: Filter by category
     * - tags: Comma-separated tags or array (multi-tag filter)
     * - country: Filter by country
     * - priceMin: Minimum price
     * - priceMax: Maximum price
     * - sort: popularity, rating, newest, alphabetical, price_asc, price_desc
     */
    #[Route('/api/destinations', name: 'api_destinations_list', methods: ['GET'])]
    public function list(Request $request, DestinationRepository $repo): JsonResponse
    {
        $q = $request->query->get('q');
        
        // Phase 1: Support multi-tag filtering
        $tagsParam = $request->query->get('tags');
        $tags = [];
        if ($tagsParam) {
            if (is_array($tagsParam)) {
                $tags = $tagsParam;
            } else {
                // Comma-separated tags
                $tags = array_filter(array_map('trim', explode(',', $tagsParam)));
            }
        }
        
        $filters = [
            'category' => $request->query->get('category'),
            'tags' => $tags, // Phase 1: Multi-tag support
            'country' => $request->query->get('country'),
            'priceMin' => $request->query->get('priceMin'),
            'priceMax' => $request->query->get('priceMax'),
            'sort' => $request->query->get('sort')
        ];
        $limit = (int)($request->query->get('limit', 20));
        $offset = (int)($request->query->get('offset', 0));
        $items = $repo->search($q, $filters, $limit, $offset);
        return $this->json(array_map([$this, 'serializeDestination'], $items));
    }

    #[Route('/api/destinations/popular', name: 'api_destinations_popular', methods: ['GET'])]
    public function popular(DestinationRepository $repo): JsonResponse
    {
        $items = $repo->findPopular(12);
        return $this->json(array_map([$this, 'serializeDestination'], $items));
    }

    /**
     * Phase 1: Get featured destinations (for homepage)
     */
    #[Route('/api/destinations/featured', name: 'api_destinations_featured', methods: ['GET'])]
    public function featured(Request $request, DestinationRepository $repo): JsonResponse
    {
        $limit = (int)($request->query->get('limit', 12));
        $items = $repo->findFeatured($limit);
        return $this->json(array_map([$this, 'serializeDestination'], $items));
    }

    /**
     * Phase 1: Search autocomplete
     * 
     * Returns suggestions for destination names, cities, and countries
     */
    #[Route('/api/destinations/autocomplete', name: 'api_destinations_autocomplete', methods: ['GET'])]
    public function autocomplete(Request $request, DestinationRepository $repo): JsonResponse
    {
        $query = $request->query->get('q', '');
        $limit = (int)($request->query->get('limit', 10));

        if (strlen($query) < 2) {
            return $this->json([]);
        }

        $suggestions = $repo->autocomplete($query, $limit);
        return $this->json($suggestions);
    }

    /**
     * Phase 1: Get all available tags for tag-based suggestions
     */
    #[Route('/api/destinations/tags', name: 'api_destinations_tags', methods: ['GET'])]
    public function tags(DestinationRepository $repo): JsonResponse
    {
        $tags = $repo->getAllTags();
        return $this->json($tags);
    }

    /**
     * Phase 1: Get all available categories
     */
    #[Route('/api/destinations/categories', name: 'api_destinations_categories', methods: ['GET'])]
    public function categories(DestinationRepository $repo): JsonResponse
    {
        $categories = $repo->getAllCategories();
        return $this->json($categories);
    }

    #[Route('/api/destinations/recommended', name: 'api_destinations_recommended', methods: ['GET'])]
    public function recommended(DestinationRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user || !$user instanceof \App\Entity\User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }
        $items = $repo->findRecommendedForUser($user, 12);
        return $this->json(array_map([$this, 'serializeDestination'], $items));
    }

    #[Route('/api/destinations/{id}', name: 'api_destinations_detail', methods: ['GET'])]
    public function detail(
        int $id,
        DestinationRepository $repo,
        ActivityLogRepository $activityLogRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $dest = $repo->find($id);
        if (!$dest) {
            return $this->json(['error' => 'Not found'], 404);
        }
        
        // Log view activity if user is authenticated
        $user = $this->getUser();
        if ($user && $user instanceof \App\Entity\User) {
            $activityLog = new ActivityLog();
            $activityLog->setUser($user);
            $activityLog->setActionType('view_destination');
            $activityLog->setEntityType('destination');
            $activityLog->setEntityId($dest->getId());
            $activityLog->setMetadata([
                'destinationName' => $dest->getName(),
                'destinationCity' => $dest->getCity(),
                'destinationCountry' => $dest->getCountry(),
            ]);
            $em->persist($activityLog);
            $em->flush();
        }
        
        return $this->json($this->serializeDestination($dest));
    }

    private function serializeDestination(\App\Entity\Destination $d): array
    {
        $imgs = $d->getImages() ?? [];
        return [
            'id' => $d->getId(),
            'name' => $d->getName(),
            'country' => $d->getCountry(),
            'city' => $d->getCity(),
            'category' => $d->getCategory(),
            'description' => $d->getDescription(),
            'tags' => $d->getTags(),
            'priceMin' => $d->getPriceMin(),
            'priceMax' => $d->getPriceMax(),
            'rating' => $d->getRating(),
            'image' => count($imgs) ? $imgs[0] : null,
            'images' => $imgs,
            // Phase 1: Editorial control fields
            'isFeatured' => $d->isFeatured(),
            'isPinned' => $d->isPinned(),
            'displayOrder' => $d->getDisplayOrder(),
        ];
    }
}