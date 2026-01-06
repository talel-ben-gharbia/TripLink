<?php

namespace App\Controller;

use App\Entity\Destination;
use App\Repository\DestinationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/destinations')]
#[IsGranted('ROLE_ADMIN')]
class AdminDestinationController extends AbstractController
{
    #[Route('', name: 'admin_destinations_list', methods: ['GET'])]
    public function list(DestinationRepository $repo): JsonResponse
    {
        $items = $repo->findBy([], ['createdAt' => 'DESC']);
        $data = array_map(function (Destination $d) {
            $imgs = $d->getImages() ?? [];
            return [
                'id' => $d->getId(),
                'name' => $d->getName(),
                'country' => $d->getCountry(),
                'city' => $d->getCity(),
                'category' => $d->getCategory(),
                'priceMin' => $d->getPriceMin(),
                'priceMax' => $d->getPriceMax(),
                'rating' => $d->getRating(),
                'image' => count($imgs) ? $imgs[0] : null,
                // Phase 1: Editorial control fields
                'isFeatured' => $d->isFeatured(),
                'isPinned' => $d->isPinned(),
                'displayOrder' => $d->getDisplayOrder(),
            ];
        }, $items);
        return $this->json($data);
    }

    #[Route('', name: 'admin_destinations_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $d = new Destination();
        $d->setName($data['name'] ?? '');
        $d->setCountry($data['country'] ?? '');
        $d->setCity($data['city'] ?? null);
        $d->setCategory($data['category'] ?? 'general');
        $d->setDescription($data['description'] ?? null);
        $d->setTags($data['tags'] ?? null);
        $d->setPriceMin(isset($data['priceMin']) ? (int)$data['priceMin'] : null);
        $d->setPriceMax(isset($data['priceMax']) ? (int)$data['priceMax'] : null);
        // Rating is set by users via reviews, not by admin
        $d->setImages($data['images'] ?? null);
        $em->persist($d);
        $em->flush();
        return $this->json(['id' => $d->getId()]);
    }

    #[Route('/{id}', name: 'admin_destinations_update', methods: ['PUT'])]
    public function update(int $id, Request $request, DestinationRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $d = $repo->find($id);
        if (!$d) return $this->json(['error' => 'Not found'], 404);
        $data = json_decode($request->getContent(), true) ?? [];
        if (isset($data['name'])) $d->setName($data['name']);
        if (isset($data['country'])) $d->setCountry($data['country']);
        if (isset($data['city'])) $d->setCity($data['city']);
        if (isset($data['category'])) $d->setCategory($data['category']);
        if (isset($data['description'])) $d->setDescription($data['description']);
        if (isset($data['tags'])) $d->setTags($data['tags']);
        if (array_key_exists('priceMin', $data)) $d->setPriceMin($data['priceMin'] !== null ? (int)$data['priceMin'] : null);
        if (array_key_exists('priceMax', $data)) $d->setPriceMax($data['priceMax'] !== null ? (int)$data['priceMax'] : null);
        // Rating is set by users via reviews, not by admin
        if (isset($data['images'])) $d->setImages($data['images']);
        // Phase 1: Editorial control fields
        if (array_key_exists('isFeatured', $data)) $d->setIsFeatured((bool)$data['isFeatured']);
        if (array_key_exists('isPinned', $data)) $d->setIsPinned((bool)$data['isPinned']);
        if (array_key_exists('displayOrder', $data)) $d->setDisplayOrder($data['displayOrder'] !== null ? (int)$data['displayOrder'] : null);
        $em->flush();
        return $this->json(['status' => 'updated']);
    }

    #[Route('/{id}', name: 'admin_destinations_delete', methods: ['DELETE'])]
    public function delete(int $id, DestinationRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $d = $repo->find($id);
        if (!$d) return $this->json(['error' => 'Not found'], 404);
        $em->remove($d);
        $em->flush();
        return $this->json(['status' => 'deleted']);
    }

    /**
     * Phase 1: Feature/unfeature a destination (for homepage highlights)
     */
    #[Route('/{id}/feature', name: 'admin_destinations_feature', methods: ['POST'])]
    public function feature(int $id, Request $request, DestinationRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $d = $repo->find($id);
        if (!$d) return $this->json(['error' => 'Not found'], 404);
        
        $data = json_decode($request->getContent(), true) ?? [];
        $isFeatured = $data['featured'] ?? true;
        $displayOrder = $data['displayOrder'] ?? null;
        
        $d->setIsFeatured($isFeatured);
        if ($displayOrder !== null) {
            $d->setDisplayOrder((int)$displayOrder);
        }
        
        $em->flush();
        return $this->json([
            'status' => 'updated',
            'isFeatured' => $d->isFeatured(),
            'displayOrder' => $d->getDisplayOrder()
        ]);
    }

    /**
     * Phase 1: Pin/unpin a destination (for manual ordering)
     */
    #[Route('/{id}/pin', name: 'admin_destinations_pin', methods: ['POST'])]
    public function pin(int $id, Request $request, DestinationRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $d = $repo->find($id);
        if (!$d) return $this->json(['error' => 'Not found'], 404);
        
        $data = json_decode($request->getContent(), true) ?? [];
        $isPinned = $data['pinned'] ?? true;
        $displayOrder = $data['displayOrder'] ?? null;
        
        $d->setIsPinned($isPinned);
        if ($displayOrder !== null) {
            $d->setDisplayOrder((int)$displayOrder);
        }
        
        $em->flush();
        return $this->json([
            'status' => 'updated',
            'isPinned' => $d->isPinned(),
            'displayOrder' => $d->getDisplayOrder()
        ]);
    }
}