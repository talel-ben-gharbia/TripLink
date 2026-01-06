<?php

namespace App\Controller;

use App\Entity\DestinationCollection;
use App\Entity\Destination;
use App\Repository\DestinationCollectionRepository;
use App\Repository\DestinationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Phase 1: Public endpoints for curated destination collections
 */
#[Route('/api/collections')]
class DestinationCollectionController extends AbstractController
{
    /**
     * List all active collections
     */
    #[Route('', name: 'api_collections_list', methods: ['GET'])]
    public function list(Request $request, DestinationCollectionRepository $repo): JsonResponse
    {
        $type = $request->query->get('type'); // Filter by type (seasonal, theme, etc.)
        $collections = $repo->findActive($type);
        
        return $this->json(array_map([$this, 'serializeCollection'], $collections));
    }

    /**
     * Get collection by slug with destinations
     */
    #[Route('/{slug}', name: 'api_collections_detail', methods: ['GET'])]
    public function detail(string $slug, DestinationCollectionRepository $repo): JsonResponse
    {
        $collection = $repo->findBySlug($slug);
        
        if (!$collection) {
            return $this->json(['error' => 'Collection not found'], 404);
        }

        return $this->json($this->serializeCollection($collection, true));
    }

    private function serializeCollection(DestinationCollection $c, bool $includeDestinations = false): array
    {
        $data = [
            'id' => $c->getId(),
            'name' => $c->getName(),
            'slug' => $c->getSlug(),
            'description' => $c->getDescription(),
            'type' => $c->getType(),
            'coverImage' => $c->getCoverImage(),
            'createdAt' => $c->getCreatedAt()->format('c'),
        ];

        if ($includeDestinations) {
            // Sort destinations by display order
            $destinations = $c->getDestinations()->toArray();
            $orders = $c->getDestinationOrders() ?? [];
            
            usort($destinations, function (Destination $a, Destination $b) use ($orders) {
                $orderA = $orders[$a->getId()] ?? 999;
                $orderB = $orders[$b->getId()] ?? 999;
                return $orderA <=> $orderB;
            });

            $data['destinations'] = array_map(function (Destination $d) {
                $imgs = $d->getImages() ?? [];
                return [
                    'id' => $d->getId(),
                    'name' => $d->getName(),
                    'country' => $d->getCountry(),
                    'city' => $d->getCity(),
                    'category' => $d->getCategory(),
                    'rating' => $d->getRating(),
                    'image' => count($imgs) ? $imgs[0] : null,
                ];
            }, $destinations);
        } else {
            $data['destinationCount'] = $c->getDestinations()->count();
        }

        return $data;
    }
}

