<?php

namespace App\Controller;

use App\Entity\Itinerary;
use App\Repository\ItineraryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/itinerary')]
#[IsGranted('ROLE_USER')]
class ItineraryController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ItineraryRepository $itineraryRepository
    ) {
    }

    /**
     * Get user's itinerary
     */
    #[Route('', name: 'api_itinerary_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $startDate = $request->query->get('startDate');
        $endDate = $request->query->get('endDate');

        $start = $startDate ? new \DateTime($startDate) : null;
        $end = $endDate ? new \DateTime($endDate) : null;

        $itinerary = $this->itineraryRepository->findByUser($user, $start, $end);

        return $this->json([
            'itinerary' => array_map([$this, 'serializeItinerary'], $itinerary)
        ]);
    }

    /**
     * Create itinerary item
     */
    #[Route('', name: 'api_itinerary_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);

        $itinerary = new Itinerary();
        $itinerary->setUser($user);
        $itinerary->setType($data['type'] ?? 'activity');
        $itinerary->setTitle($data['title'] ?? '');
        $itinerary->setDate(new \DateTime($data['date']));
        if (isset($data['time']) && !empty($data['time'])) {
            $itinerary->setTime(new \DateTime($data['time']));
        }
        $itinerary->setNotes($data['notes'] ?? null);
        $itinerary->setCost((string)($data['cost'] ?? 0));

        if (isset($data['bookingId'])) {
            $booking = $this->em->getRepository(\App\Entity\Booking::class)->find($data['bookingId']);
            if ($booking) {
                $itinerary->setBooking($booking);
            }
        }

        $this->em->persist($itinerary);
        $this->em->flush();

        return $this->json([
            'message' => 'Itinerary item created',
            'itinerary' => $this->serializeItinerary($itinerary)
        ], 201);
    }

    /**
     * Update itinerary item
     */
    #[Route('/{id}', name: 'api_itinerary_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $itinerary = $this->itineraryRepository->find($id);
        if (!$itinerary || $itinerary->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Itinerary item not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['type'])) {
            $itinerary->setType($data['type']);
        }
        if (isset($data['title'])) {
            $itinerary->setTitle($data['title']);
        }
        if (isset($data['date'])) {
            $itinerary->setDate(new \DateTime($data['date']));
        }
        if (isset($data['time'])) {
            $itinerary->setTime($data['time'] ? new \DateTime($data['time']) : null);
        }
        if (isset($data['notes'])) {
            $itinerary->setNotes($data['notes']);
        }
        if (isset($data['cost'])) {
            $itinerary->setCost((string)$data['cost']);
        }

        $itinerary->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json([
            'message' => 'Itinerary item updated',
            'itinerary' => $this->serializeItinerary($itinerary)
        ]);
    }

    /**
     * Delete itinerary item
     */
    #[Route('/{id}', name: 'api_itinerary_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $itinerary = $this->itineraryRepository->find($id);
        if (!$itinerary || $itinerary->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Itinerary item not found'], 404);
        }

        $this->em->remove($itinerary);
        $this->em->flush();

        return $this->json(['message' => 'Itinerary item deleted']);
    }

    private function serializeItinerary(Itinerary $itinerary): array
    {
        return [
            'id' => $itinerary->getId(),
            'type' => $itinerary->getType(),
            'title' => $itinerary->getTitle(),
            'date' => $itinerary->getDate()->format('Y-m-d'),
            'time' => $itinerary->getTime() ? $itinerary->getTime()->format('H:i') : null,
            'notes' => $itinerary->getNotes(),
            'cost' => $itinerary->getCost(),
            'bookingId' => $itinerary->getBooking()?->getId(),
            'createdAt' => $itinerary->getCreatedAt()->format('c'),
            'updatedAt' => $itinerary->getUpdatedAt()?->format('c'),
        ];
    }
}




