<?php

namespace App\Controller;

use App\Entity\WishlistItem;
use App\Repository\DestinationRepository;
use App\Repository\WishlistItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class WishlistController extends AbstractController
{
    #[Route('/api/wishlist', name: 'api_wishlist_list', methods: ['GET'])]
    public function list(WishlistItemRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        if (!$user || !$user instanceof \App\Entity\User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }
        $items = $repo->findBy(['user' => $user], ['createdAt' => 'DESC']);
        $data = array_map(function (WishlistItem $w) {
            $d = $w->getDestination();
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
                'wishlistedAt' => $w->getCreatedAt()->format('c')
            ];
        }, $items);
        return $this->json($data);
    }

    #[Route('/api/wishlist/{destinationId}', name: 'api_wishlist_add', methods: ['POST'])]
    public function add(int $destinationId, DestinationRepository $destRepo, WishlistItemRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user || !$user instanceof \App\Entity\User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }
        $dest = $destRepo->find($destinationId);
        if (!$dest) {
            return $this->json(['error' => 'Destination not found'], 404);
        }
        if ($repo->isWishlisted($user, $dest)) {
            return $this->json(['status' => 'exists']);
        }
        $w = new WishlistItem();
        $w->setUser($user);
        $w->setDestination($dest);
        $em->persist($w);
        $em->flush();
        return $this->json(['status' => 'added']);
    }

    #[Route('/api/wishlist/{destinationId}', name: 'api_wishlist_remove', methods: ['DELETE'])]
    public function remove(int $destinationId, DestinationRepository $destRepo, WishlistItemRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        if (!$user || !$user instanceof \App\Entity\User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }
        $dest = $destRepo->find($destinationId);
        if (!$dest) {
            return $this->json(['error' => 'Destination not found'], 404);
        }
        $item = $repo->findOneBy(['user' => $user, 'destination' => $dest]);
        if ($item) {
            $em->remove($item);
            $em->flush();
        }
        return $this->json(['status' => 'removed']);
    }
}