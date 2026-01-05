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
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

/**
 * Phase 1: Admin endpoints for managing curated destination collections
 */
#[Route('/api/admin/collections')]
#[IsGranted('ROLE_ADMIN')]
class AdminDestinationCollectionController extends AbstractController
{
    /**
     * List all collections (including inactive)
     */
    #[Route('', name: 'admin_collections_list', methods: ['GET'])]
    public function list(DestinationCollectionRepository $repo): JsonResponse
    {
        $collections = $repo->findAll();
        return $this->json(array_map([$this, 'serializeCollection'], $collections));
    }

    /**
     * Get collection details
     */
    #[Route('/{id}', name: 'admin_collections_detail', methods: ['GET'])]
    public function detail(int $id, DestinationCollectionRepository $repo): JsonResponse
    {
        $collection = $repo->find($id);
        if (!$collection) {
            return $this->json(['error' => 'Collection not found'], 404);
        }
        return $this->json($this->serializeCollection($collection, true));
    }

    /**
     * Create new collection
     */
    #[Route('', name: 'admin_collections_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        SluggerInterface $slugger
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        $collection = new DestinationCollection();
        $collection->setName($data['name'] ?? '');
        $collection->setDescription($data['description'] ?? null);
        $collection->setType($data['type'] ?? null);
        $collection->setCoverImage($data['coverImage'] ?? null);
        $collection->setDisplayOrder($data['displayOrder'] ?? null);
        $collection->setIsActive($data['isActive'] ?? true);

        // Generate slug from name
        $slug = $data['slug'] ?? $slugger->slug($collection->getName())->lower()->toString();
        $collection->setSlug($slug);

        $em->persist($collection);
        $em->flush();

        return $this->json([
            'id' => $collection->getId(),
            'slug' => $collection->getSlug()
        ], 201);
    }

    /**
     * Update collection
     */
    #[Route('/{id}', name: 'admin_collections_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        DestinationCollectionRepository $repo,
        EntityManagerInterface $em,
        SluggerInterface $slugger
    ): JsonResponse {
        $collection = $repo->find($id);
        if (!$collection) {
            return $this->json(['error' => 'Collection not found'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['name'])) $collection->setName($data['name']);
        if (isset($data['description'])) $collection->setDescription($data['description']);
        if (isset($data['type'])) $collection->setType($data['type']);
        if (isset($data['coverImage'])) $collection->setCoverImage($data['coverImage']);
        if (array_key_exists('displayOrder', $data)) {
            $collection->setDisplayOrder($data['displayOrder'] !== null ? (int)$data['displayOrder'] : null);
        }
        if (array_key_exists('isActive', $data)) {
            $collection->setIsActive((bool)$data['isActive']);
        }
        if (isset($data['slug'])) {
            $collection->setSlug($data['slug']);
        } elseif (isset($data['name'])) {
            // Auto-update slug if name changed
            $slug = $slugger->slug($collection->getName())->lower()->toString();
            $collection->setSlug($slug);
        }

        $collection->setUpdatedAt(new \DateTimeImmutable());
        $em->flush();

        return $this->json(['status' => 'updated']);
    }

    /**
     * Delete collection
     */
    #[Route('/{id}', name: 'admin_collections_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        DestinationCollectionRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $collection = $repo->find($id);
        if (!$collection) {
            return $this->json(['error' => 'Collection not found'], 404);
        }

        $em->remove($collection);
        $em->flush();

        return $this->json(['status' => 'deleted']);
    }

    /**
     * Add destination to collection
     */
    #[Route('/{id}/destinations/{destinationId}', name: 'admin_collections_add_destination', methods: ['POST'])]
    public function addDestination(
        int $id,
        int $destinationId,
        DestinationCollectionRepository $collectionRepo,
        DestinationRepository $destinationRepo,
        EntityManagerInterface $em,
        Request $request
    ): JsonResponse {
        $collection = $collectionRepo->find($id);
        $destination = $destinationRepo->find($destinationId);

        if (!$collection || !$destination) {
            return $this->json(['error' => 'Collection or destination not found'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $order = $data['order'] ?? null;

        $collection->addDestination($destination, $order);
        $collection->setUpdatedAt(new \DateTimeImmutable());
        $em->flush();

        return $this->json(['status' => 'added']);
    }

    /**
     * Remove destination from collection
     */
    #[Route('/{id}/destinations/{destinationId}', name: 'admin_collections_remove_destination', methods: ['DELETE'])]
    public function removeDestination(
        int $id,
        int $destinationId,
        DestinationCollectionRepository $collectionRepo,
        DestinationRepository $destinationRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $collection = $collectionRepo->find($id);
        $destination = $destinationRepo->find($destinationId);

        if (!$collection || !$destination) {
            return $this->json(['error' => 'Collection or destination not found'], 404);
        }

        $collection->removeDestination($destination);
        $collection->setUpdatedAt(new \DateTimeImmutable());
        $em->flush();

        return $this->json(['status' => 'removed']);
    }

    /**
     * Update destination order in collection
     */
    #[Route('/{id}/destinations/order', name: 'admin_collections_update_order', methods: ['PUT'])]
    public function updateDestinationOrder(
        int $id,
        Request $request,
        DestinationCollectionRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $collection = $repo->find($id);
        if (!$collection) {
            return $this->json(['error' => 'Collection not found'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        // Expected format: { "destinationOrders": { "1": 1, "2": 2, "3": 3 } }
        if (isset($data['destinationOrders']) && is_array($data['destinationOrders'])) {
            $collection->setDestinationOrders($data['destinationOrders']);
            $collection->setUpdatedAt(new \DateTimeImmutable());
            $em->flush();
        }

        return $this->json(['status' => 'updated']);
    }

    private function serializeCollection(DestinationCollection $c, bool $includeDestinations = false): array
    {
        $data = [
            'id' => $c->getId(),
            'name' => $c->getName(),
            'slug' => $c->getSlug(),
            'description' => $c->getDescription(),
            'type' => $c->getType(),
            'isActive' => $c->isActive(),
            'coverImage' => $c->getCoverImage(),
            'displayOrder' => $c->getDisplayOrder(),
            'createdAt' => $c->getCreatedAt()->format('c'),
            'updatedAt' => $c->getUpdatedAt()?->format('c'),
        ];

        if ($includeDestinations) {
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
            $data['destinationOrders'] = $c->getDestinationOrders();
        } else {
            $data['destinationCount'] = $c->getDestinations()->count();
        }

        return $data;
    }
}

