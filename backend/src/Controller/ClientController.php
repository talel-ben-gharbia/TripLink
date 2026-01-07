<?php

namespace App\Controller;

use App\Entity\Client;
use App\Repository\ClientRepository;
use App\Repository\BookingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/agent/clients')]
#[IsGranted('ROLE_AGENT')]
class ClientController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ClientRepository $clientRepository,
        private BookingRepository $bookingRepository
    ) {
    }

    /**
     * Get agent's clients
     */
    #[Route('', name: 'api_agent_clients_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $clients = $this->clientRepository->findByAgent($agent);

        return $this->json([
            'clients' => array_map([$this, 'serializeClient'], $clients)
        ]);
    }

    /**
     * Get client details with booking history
     */
    #[Route('/{userId}', name: 'api_agent_client_details', methods: ['GET'])]
    public function getClientDetails(int $userId): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $user = $this->em->getRepository(\App\Entity\User::class)->find($userId);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $client = $this->clientRepository->findByAgentAndUser($agent, $user);
        if (!$client) {
            // Auto-create client relationship if booking exists
            $hasBookings = $this->bookingRepository->createQueryBuilder('b')
                ->where('b.user = :user')
                ->andWhere('b.agent = :agent')
                ->setParameter('user', $user)
                ->setParameter('agent', $agent)
                ->setMaxResults(1)
                ->getQuery()
                ->getOneOrNullResult();

            if ($hasBookings) {
                $client = new Client();
                $client->setAgent($agent);
                $client->setUser($user);
                $this->em->persist($client);
                $this->em->flush();
            } else {
                return $this->json(['error' => 'Client not found'], 404);
            }
        }

        // Get booking history
        $bookings = $this->bookingRepository->createQueryBuilder('b')
            ->where('b.user = :user')
            ->andWhere('b.agent = :agent')
            ->setParameter('user', $user)
            ->setParameter('agent', $agent)
            ->orderBy('b.createdAt', 'DESC')
            ->getQuery()
            ->getResult();

        return $this->json([
            'client' => $this->serializeClient($client),
            'bookings' => array_map(function($booking) {
                return [
                    'id' => $booking->getId(),
                    'bookingReference' => $booking->getBookingReference(),
                    'destination' => $booking->getDestination()?->getName(),
                    'status' => $booking->getStatus(),
                    'totalPrice' => $booking->getTotalPrice(),
                    'createdAt' => $booking->getCreatedAt()->format('c'),
                ];
            }, $bookings),
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getProfile()?->getFirstName(),
                'lastName' => $user->getProfile()?->getLastName(),
                'phone' => $user->getProfile()?->getPhone(),
            ]
        ]);
    }

    /**
     * Update client notes and preferences
     */
    #[Route('/{userId}', name: 'api_agent_client_update', methods: ['PUT'])]
    public function updateClient(int $userId, Request $request): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $user = $this->em->getRepository(\App\Entity\User::class)->find($userId);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $client = $this->clientRepository->findByAgentAndUser($agent, $user);
        if (!$client) {
            $client = new Client();
            $client->setAgent($agent);
            $client->setUser($user);
            $this->em->persist($client);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['notes'])) {
            $client->setNotes($data['notes']);
        }
        if (isset($data['tags'])) {
            $client->setTags($data['tags']);
        }
        if (isset($data['preferences'])) {
            $client->setPreferences($data['preferences']);
        }
        if (isset($data['status'])) {
            $client->setStatus($data['status']);
        }

        $client->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json([
            'message' => 'Client updated successfully',
            'client' => $this->serializeClient($client)
        ]);
    }

    private function serializeClient(Client $client): array
    {
        $user = $client->getUser();
        $profile = $user->getProfile();

        return [
            'id' => $client->getId(),
            'userId' => $user->getId(),
            'email' => $user->getEmail(),
            'firstName' => $profile?->getFirstName(),
            'lastName' => $profile?->getLastName(),
            'phone' => $profile?->getPhone(),
            'notes' => $client->getNotes(),
            'tags' => $client->getTags(),
            'preferences' => $client->getPreferences(),
            'status' => $client->getStatus(),
            'createdAt' => $client->getCreatedAt()->format('c'),
            'updatedAt' => $client->getUpdatedAt()?->format('c'),
        ];
    }
}


