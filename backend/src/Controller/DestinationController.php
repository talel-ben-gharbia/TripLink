<?php

namespace App\Controller;

use App\Repository\DestinationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class DestinationController extends AbstractController
{
    #[Route('/api/destinations', name: 'api_destinations_list', methods: ['GET'])]
    public function list(Request $request, DestinationRepository $repo): JsonResponse
    {
        $q = $request->query->get('q');
        $filters = [
            'category' => $request->query->get('category'),
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
    public function detail(int $id, DestinationRepository $repo): JsonResponse
    {
        $dest = $repo->find($id);
        if (!$dest) {
            return $this->json(['error' => 'Not found'], 404);
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
        ];
    }
}