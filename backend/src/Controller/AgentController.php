<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Entity\User;
use App\Entity\TravelPackage;
use App\Entity\Destination;
use App\Entity\AgentMessage;
use App\Entity\Commission;
use App\Repository\BookingRepository;
use App\Repository\TravelPackageRepository;
use App\Repository\DestinationRepository;
use App\Repository\AgentMessageRepository;
use App\Repository\CommissionRepository;
use App\Service\BookingService;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/agent')]
#[IsGranted('ROLE_AGENT')]
class AgentController extends AbstractController
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private TravelPackageRepository $packageRepository,
        private DestinationRepository $destinationRepository,
        private AgentMessageRepository $messageRepository,
        private CommissionRepository $commissionRepository,
        private BookingService $bookingService,
        private ?NotificationService $notificationService = null,
        private EntityManagerInterface $em
    ) {
    }

    /**
     * Get agent dashboard stats
     */
    #[Route('/dashboard', name: 'api_agent_dashboard', methods: ['GET'])]
    public function dashboard(): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $allBookings = $this->bookingRepository->findByAgent($agent);
        $pendingBookings = array_filter($allBookings, fn($b) => $b->isPending());
        $confirmedBookings = array_filter($allBookings, fn($b) => $b->isConfirmed());

        return $this->json([
            'stats' => [
                'totalBookings' => count($allBookings),
                'pendingBookings' => count($pendingBookings),
                'confirmedBookings' => count($confirmedBookings),
                'totalRevenue' => array_sum(array_map(fn($b) => (float)$b->getTotalPrice(), $confirmedBookings)),
            ],
            'recentBookings' => array_map([$this, 'serializeBooking'], array_slice($allBookings, 0, 10))
        ]);
    }

    /**
     * Get pending bookings that need agent assignment
     */
    #[Route('/pending-bookings', name: 'api_agent_pending_bookings', methods: ['GET'])]
    public function getPendingBookings(): JsonResponse
    {
        $pendingBookings = $this->bookingRepository->findPendingAgentBookings();

        return $this->json([
            'bookings' => array_map([$this, 'serializeBooking'], $pendingBookings)
        ]);
    }

    /**
     * Assign agent to a booking
     */
    #[Route('/bookings/{id}/assign', name: 'api_agent_assign_booking', methods: ['POST'])]
    public function assignBooking(int $id): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $booking = $this->bookingRepository->find($id);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->getBookingType() !== 'AGENT') {
            return $this->json(['error' => 'This booking does not require an agent'], 400);
        }

        if ($booking->getAgent() !== null) {
            return $this->json(['error' => 'Booking already assigned to an agent'], 400);
        }

        $booking->setAgent($agent);
        $this->em->flush();

        return $this->json([
            'message' => 'Booking assigned successfully',
            'booking' => $this->serializeBooking($booking)
        ]);
    }

    /**
     * Get agent's bookings
     */
    #[Route('/bookings', name: 'api_agent_bookings', methods: ['GET'])]
    public function getBookings(): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $bookings = $this->bookingRepository->findByAgent($agent);

        return $this->json([
            'bookings' => array_map([$this, 'serializeBooking'], $bookings)
        ]);
    }

    /**
     * Confirm booking (agent confirms after handling)
     */
    #[Route('/bookings/{id}/confirm', name: 'api_agent_confirm_booking', methods: ['POST'])]
    public function confirmBooking(int $id): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $booking = $this->bookingRepository->find($id);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->getAgent()?->getId() !== $agent->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $this->bookingService->confirmBooking($booking);

        return $this->json([
            'message' => 'Booking confirmed successfully',
            'booking' => $this->serializeBooking($booking)
        ]);
    }

    /**
     * Get agent's clients (users who have bookings with this agent)
     */
    #[Route('/clients', name: 'api_agent_clients', methods: ['GET'])]
    public function getClients(): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        // Get all bookings assigned to this agent
        $bookings = $this->bookingRepository->findByAgent($agent);
        
        // Group by user and collect unique clients
        $clientsMap = [];
        foreach ($bookings as $booking) {
            $user = $booking->getUser();
            $userId = $user->getId();
            
            if (!isset($clientsMap[$userId])) {
                $profile = $user->getProfile();
                $clientsMap[$userId] = [
                    'userId' => $userId,
                    'id' => $userId, // For compatibility
                    'firstName' => $profile?->getFirstName() ?? '',
                    'lastName' => $profile?->getLastName() ?? '',
                    'email' => $user->getEmail(),
                    'phone' => $profile?->getPhone(),
                    'status' => 'ACTIVE', // Default status
                    'tags' => [], // Can be extended later
                    'notes' => null, // Can be extended later
                    'bookingCount' => 0,
                ];
            }
            $clientsMap[$userId]['bookingCount']++;
        }

        return $this->json([
            'clients' => array_values($clientsMap)
        ]);
    }

    /**
     * Get client details with booking history
     */
    #[Route('/clients/{userId}', name: 'api_agent_client_details', methods: ['GET'])]
    public function getClientDetails(int $userId): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        try {
            // Get user
            $userRepo = $this->em->getRepository(User::class);
            $user = $userRepo->find($userId);
            
            if (!$user) {
                return $this->json(['error' => 'Client not found'], 404);
            }

            // Get bookings for this user assigned to this agent using query builder
            $bookings = $this->bookingRepository->createQueryBuilder('b')
                ->where('b.user = :user')
                ->andWhere('b.agent = :agent')
                ->setParameter('user', $user)
                ->setParameter('agent', $agent)
                ->orderBy('b.createdAt', 'DESC')
                ->getQuery()
                ->getResult();

            // Verify this user has bookings with this agent (for security)
            if (empty($bookings)) {
                // Check if user has any bookings at all with this agent
                // If not, they're not a client of this agent
                return $this->json(['error' => 'Client not found in your portfolio'], 404);
            }

            $profile = $user->getProfile();
            
            $bookingsData = [];
            foreach ($bookings as $booking) {
                try {
                    $destination = $booking->getDestination();
                    $createdAt = $booking->getCreatedAt();
                    $checkInDate = $booking->getCheckInDate();
                    $checkOutDate = $booking->getCheckOutDate();
                    
                    $bookingsData[] = [
                        'id' => $booking->getId(),
                        'bookingReference' => $booking->getBookingReference(),
                        'destination' => $destination ? $destination->getName() : 'Unknown Destination',
                        'totalPrice' => $booking->getTotalPrice(),
                        'status' => $booking->getStatus(),
                        'checkInDate' => $checkInDate ? ($checkInDate instanceof \DateTimeInterface ? $checkInDate->format('Y-m-d') : (string)$checkInDate) : null,
                        'checkOutDate' => $checkOutDate ? ($checkOutDate instanceof \DateTimeInterface ? $checkOutDate->format('Y-m-d') : (string)$checkOutDate) : null,
                        'createdAt' => $createdAt ? ($createdAt instanceof \DateTimeInterface ? $createdAt->format('Y-m-d H:i:s') : (string)$createdAt) : null,
                    ];
                } catch (\Exception $e) {
                    error_log('Error serializing booking ' . ($booking->getId() ?? 'unknown') . ': ' . $e->getMessage());
                    error_log('Stack trace: ' . $e->getTraceAsString());
                    // Skip this booking but continue with others
                    continue;
                }
            }
            
            return $this->json([
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'firstName' => $profile ? ($profile->getFirstName() ?? '') : '',
                    'lastName' => $profile ? ($profile->getLastName() ?? '') : '',
                    'phone' => $profile ? ($profile->getPhone() ?? '') : '',
                ],
                'client' => [
                    'userId' => $user->getId(),
                    'status' => 'ACTIVE',
                    'tags' => [],
                    'notes' => null,
                ],
                'bookings' => $bookingsData
            ]);
        } catch (\Exception $e) {
            error_log('Error loading client details: ' . $e->getMessage());
            return $this->json(['error' => 'Failed to load client details: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update client notes and tags
     */
    #[Route('/clients/{userId}', name: 'api_agent_update_client', methods: ['PUT'])]
    public function updateClient(int $userId, Request $request): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        // Verify this user has bookings with this agent
        $userRepo = $this->em->getRepository(User::class);
        $user = $userRepo->find($userId);
        
        if (!$user) {
            return $this->json(['error' => 'Client not found'], 404);
        }

        $bookings = $this->bookingRepository->findBy([
            'user' => $user,
            'agent' => $agent
        ]);

        if (empty($bookings)) {
            return $this->json(['error' => 'Client not found in your portfolio'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        // For now, we'll just return success
        // In the future, you could store notes/tags in a separate ClientNotes entity
        return $this->json([
            'message' => 'Client updated successfully',
            'client' => [
                'userId' => $userId,
                'notes' => $data['notes'] ?? null,
                'tags' => $data['tags'] ?? [],
            ]
        ]);
    }

    /**
     * List agent's packages
     */
    #[Route('/packages', name: 'api_agent_packages_list', methods: ['GET'])]
    public function listPackages(): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $packages = $this->packageRepository->findByAgent($agent);

        return $this->json([
            'packages' => array_map([$this, 'serializePackage'], $packages)
        ]);
    }

    /**
     * Create a new package
     */
    #[Route('/packages', name: 'api_agent_packages_create', methods: ['POST'])]
    public function createPackage(Request $request): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['name']) || empty($data['destinations']) || !is_array($data['destinations'])) {
            return $this->json(['error' => 'Package name and at least one destination are required'], 400);
        }

        // Calculate total price
        $totalPrice = 0.0;
        foreach ($data['destinations'] as $destId) {
            $destination = $this->destinationRepository->find($destId);
            if ($destination && $destination->getPriceMin()) {
                $totalPrice += (float)$destination->getPriceMin();
            }
        }

        // Add activities cost
        if (!empty($data['activities']) && is_array($data['activities'])) {
            foreach ($data['activities'] as $activity) {
                if (isset($activity['cost'])) {
                    $totalPrice += (float)$activity['cost'];
                }
            }
        }

        // Apply guest multiplier
        $numberOfGuests = (int)($data['numberOfGuests'] ?? 2);
        $guestMultiplier = min(1.5, 1 + ($numberOfGuests - 1) * 0.1);
        $totalPrice *= $guestMultiplier;

        // Calculate days if dates provided
        if (!empty($data['startDate']) && !empty($data['endDate'])) {
            $start = new \DateTime($data['startDate']);
            $end = new \DateTime($data['endDate']);
            $days = max(1, $end->diff($start)->days);
            $totalPrice *= $days;
        }

        $package = new TravelPackage();
        $package->setAgent($agent);
        $package->setName($data['name']);
        $package->setDescription($data['description'] ?? null);
        $package->setDestinations($data['destinations']);
        $package->setActivities($data['activities'] ?? null);
        $package->setStartDate(!empty($data['startDate']) ? new \DateTime($data['startDate']) : null);
        $package->setEndDate(!empty($data['endDate']) ? new \DateTime($data['endDate']) : null);
        $package->setNumberOfGuests($numberOfGuests);
        $package->setTotalPrice(number_format($totalPrice, 2, '.', ''));
        $package->setStatus($data['status'] ?? 'DRAFT');

        if (!empty($data['clientId'])) {
            $client = $this->em->getRepository(User::class)->find($data['clientId']);
            if ($client) {
                $package->setClient($client);
            }
        }

        $this->em->persist($package);
        $this->em->flush();

        return $this->json([
            'message' => 'Package created successfully',
            'package' => $this->serializePackage($package)
        ], 201);
    }

    /**
     * Calculate package price
     */
    #[Route('/packages/calculate-price', name: 'api_agent_packages_calculate_price', methods: ['POST'])]
    public function calculatePrice(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['destinations']) || !is_array($data['destinations'])) {
            return $this->json(['error' => 'Destinations are required'], 400);
        }

        $totalPrice = 0.0;
        foreach ($data['destinations'] as $destId) {
            $destination = $this->destinationRepository->find($destId);
            if ($destination && $destination->getPriceMin()) {
                $totalPrice += (float)$destination->getPriceMin();
            }
        }

        // Add activities cost
        if (!empty($data['activities']) && is_array($data['activities'])) {
            foreach ($data['activities'] as $activity) {
                if (isset($activity['cost'])) {
                    $totalPrice += (float)$activity['cost'];
                }
            }
        }

        // Apply guest multiplier
        $numberOfGuests = (int)($data['numberOfGuests'] ?? 2);
        $guestMultiplier = min(1.5, 1 + ($numberOfGuests - 1) * 0.1);
        $totalPrice *= $guestMultiplier;

        // Calculate days if dates provided
        if (!empty($data['startDate']) && !empty($data['endDate'])) {
            $start = new \DateTime($data['startDate']);
            $end = new \DateTime($data['endDate']);
            $days = max(1, $end->diff($start)->days);
            $totalPrice *= $days;
        }

        return $this->json([
            'totalPrice' => round($totalPrice, 2)
        ]);
    }

    /**
     * Update a package
     */
    #[Route('/packages/{id}', name: 'api_agent_packages_update', methods: ['PUT'])]
    public function updatePackage(int $id, Request $request): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $package = $this->packageRepository->find($id);
        if (!$package) {
            return $this->json(['error' => 'Package not found'], 404);
        }

        if ($package->getAgent()->getId() !== $agent->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $package->setName($data['name']);
        }
        if (isset($data['description'])) {
            $package->setDescription($data['description']);
        }
        if (isset($data['destinations'])) {
            $package->setDestinations($data['destinations']);
        }
        if (isset($data['activities'])) {
            $package->setActivities($data['activities']);
        }
        if (isset($data['startDate'])) {
            $package->setStartDate(!empty($data['startDate']) ? new \DateTime($data['startDate']) : null);
        }
        if (isset($data['endDate'])) {
            $package->setEndDate(!empty($data['endDate']) ? new \DateTime($data['endDate']) : null);
        }
        if (isset($data['numberOfGuests'])) {
            $package->setNumberOfGuests((int)$data['numberOfGuests']);
        }
        if (isset($data['status'])) {
            $package->setStatus($data['status']);
        }

        // Recalculate price if relevant fields changed
        if (isset($data['destinations']) || isset($data['activities']) || isset($data['numberOfGuests']) || isset($data['startDate']) || isset($data['endDate'])) {
            $totalPrice = 0.0;
            foreach ($package->getDestinations() as $destId) {
                $destination = $this->destinationRepository->find($destId);
                if ($destination && $destination->getPriceMin()) {
                    $totalPrice += (float)$destination->getPriceMin();
                }
            }

            if ($package->getActivities()) {
                foreach ($package->getActivities() as $activity) {
                    if (isset($activity['cost'])) {
                        $totalPrice += (float)$activity['cost'];
                    }
                }
            }

            $guestMultiplier = min(1.5, 1 + ($package->getNumberOfGuests() - 1) * 0.1);
            $totalPrice *= $guestMultiplier;

            if ($package->getStartDate() && $package->getEndDate()) {
                $days = max(1, $package->getEndDate()->diff($package->getStartDate())->days);
                $totalPrice *= $days;
            }

            $package->setTotalPrice(number_format($totalPrice, 2, '.', ''));
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Package updated successfully',
            'package' => $this->serializePackage($package)
        ]);
    }

    /**
     * Delete a package
     */
    #[Route('/packages/{id}', name: 'api_agent_packages_delete', methods: ['DELETE'])]
    public function deletePackage(int $id): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $package = $this->packageRepository->find($id);
        if (!$package) {
            return $this->json(['error' => 'Package not found'], 404);
        }

        if ($package->getAgent()->getId() !== $agent->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $this->em->remove($package);
        $this->em->flush();

        return $this->json(['message' => 'Package deleted successfully']);
    }

    private function serializePackage(TravelPackage $package): array
    {
        return [
            'id' => $package->getId(),
            'name' => $package->getName(),
            'description' => $package->getDescription(),
            'destinations' => $package->getDestinations(),
            'activities' => $package->getActivities(),
            'startDate' => $package->getStartDate()?->format('Y-m-d'),
            'endDate' => $package->getEndDate()?->format('Y-m-d'),
            'numberOfGuests' => $package->getNumberOfGuests(),
            'totalPrice' => $package->getTotalPrice(),
            'status' => $package->getStatus(),
            'clientId' => $package->getClient()?->getId(),
            'createdAt' => $package->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $package->getUpdatedAt()?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Send message to client
     */
    #[Route('/messages', name: 'api_agent_messages_send', methods: ['POST'])]
    public function sendMessage(Request $request): JsonResponse
    {
        try {
            $agent = $this->getUser();
            if (!$agent instanceof User) {
                return $this->json(['error' => 'Not authenticated'], 401);
            }

            // Verify user is an agent
            if (!$agent->isAgent()) {
                return $this->json(['error' => 'Access denied. Agent role required.'], 403);
            }

            $data = json_decode($request->getContent(), true);
            
            if ($data === null) {
                return $this->json(['error' => 'Invalid JSON data'], 400);
            }

            if (empty($data['clientId']) || empty($data['subject']) || empty($data['message'])) {
                return $this->json(['error' => 'Client ID, subject, and message are required'], 400);
            }

            // Validate input length
            if (strlen($data['subject']) > 255) {
                return $this->json(['error' => 'Subject must be 255 characters or less'], 400);
            }

            if (strlen($data['message']) > 10000) {
                return $this->json(['error' => 'Message must be 10,000 characters or less'], 400);
            }

            $client = $this->em->getRepository(User::class)->find($data['clientId']);
            if (!$client) {
                return $this->json(['error' => 'Client not found'], 404);
            }

            // Verify this client has bookings with this agent (or allow if admin)
            $bookings = $this->bookingRepository->findBy([
                'user' => $client,
                'agent' => $agent
            ]);

            // Allow messaging if agent has bookings with client OR if agent is admin
            if (empty($bookings) && !$agent->isAdmin()) {
                return $this->json(['error' => 'Client not found in your portfolio'], 404);
            }

            // Create message entity
            $message = new AgentMessage();
            $message->setAgent($agent);
            $message->setClient($client);
            $message->setSubject(trim($data['subject']));
            $message->setMessage(trim($data['message']));
            $message->setDirection('TO_CLIENT');

            if (!empty($data['bookingId'])) {
                $booking = $this->bookingRepository->find($data['bookingId']);
                if ($booking && ($booking->getAgent()?->getId() === $agent->getId() || $agent->isAdmin())) {
                    $message->setBooking($booking);
                }
            }

            try {
                $this->em->persist($message);
                $this->em->flush();
            } catch (\Exception $e) {
                error_log('Error creating message entity: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
                return $this->json([
                    'error' => 'Failed to create message',
                    'message' => 'An error occurred while creating your message. Please try again.'
                ], 500);
            }

            // Send notification to client
            try {
                if ($this->notificationService) {
                    $agentName = 'Your Agent';
                    $profile = $agent->getProfile();
                    if ($profile) {
                        $firstName = $profile->getFirstName() ?? '';
                        $lastName = $profile->getLastName() ?? '';
                        $agentName = trim($firstName . ' ' . $lastName) ?: 'Your Agent';
                    }
                    
                    $this->notificationService->createNotification(
                        $client,
                        'agent_message',
                        'New Message from Agent',
                        "You have a new message: {$data['subject']}",
                        'message',
                        $message->getId(),
                        "/messages?agent={$agent->getId()}",
                        ['agentName' => $agentName]
                    );
                }
            } catch (\Exception $e) {
                // Log error but don't fail the message sending
                error_log('Failed to send notification: ' . $e->getMessage());
            }

            return $this->json([
                'message' => 'Message sent successfully',
                'messageData' => $this->serializeMessage($message)
            ], 201);
        } catch (\Exception $e) {
            error_log('Error sending message: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            error_log('Request data: ' . ($request->getContent() ?: 'empty'));
            
            // Return more specific error message
            $errorMessage = 'An error occurred while sending your message.';
            if (strpos($e->getMessage(), 'SQLSTATE') !== false) {
                $errorMessage = 'Database error occurred. Please contact support.';
            } elseif (strpos($e->getMessage(), 'constraint') !== false) {
                $errorMessage = 'Invalid data provided. Please check your input.';
            }
            
            return $this->json([
                'error' => 'Failed to send message',
                'message' => $errorMessage
            ], 500);
        }
    }

    /**
     * Get conversation with client
     */
    #[Route('/messages/conversation/{clientId}', name: 'api_agent_messages_conversation', methods: ['GET'])]
    public function getConversation(int $clientId): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $client = $this->em->getRepository(User::class)->find($clientId);
        if (!$client) {
            return $this->json(['error' => 'Client not found'], 404);
        }

        // Verify this client has bookings with this agent
        $bookings = $this->bookingRepository->findBy([
            'user' => $client,
            'agent' => $agent
        ]);

        if (empty($bookings)) {
            return $this->json(['error' => 'Client not found in your portfolio'], 404);
        }

        $messages = $this->messageRepository->findConversation($agent, $client);

        return $this->json([
            'messages' => array_map([$this, 'serializeMessage'], $messages)
        ]);
    }

    /**
     * Get unread message count
     */
    #[Route('/messages/unread-count', name: 'api_agent_messages_unread_count', methods: ['GET'])]
    public function getUnreadMessageCount(): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $count = $this->messageRepository->countUnreadForAgent($agent);

        return $this->json(['count' => $count]);
    }

    /**
     * Mark message as read
     */
    #[Route('/messages/{id}/read', name: 'api_agent_messages_mark_read', methods: ['POST'])]
    public function markMessageAsRead(int $id): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $message = $this->messageRepository->find($id);
        if (!$message) {
            return $this->json(['error' => 'Message not found'], 404);
        }

        if ($message->getAgent()->getId() !== $agent->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $message->setRead(true);
        $this->em->flush();

        return $this->json(['message' => 'Message marked as read']);
    }

    /**
     * Get commissions
     */
    #[Route('/commissions', name: 'api_agent_commissions', methods: ['GET'])]
    public function getCommissions(): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $commissions = $this->commissionRepository->findByAgent($agent);
        $totalPaid = $this->commissionRepository->getTotalCommission($agent);
        $totalPending = $this->commissionRepository->getPendingCommission($agent);
        $paidCount = $this->commissionRepository->countByStatus($agent, 'PAID');
        $pendingCount = $this->commissionRepository->countByStatus($agent, 'PENDING');

        return $this->json([
            'commissions' => array_map([$this, 'serializeCommission'], $commissions),
            'stats' => [
                'totalPaid' => number_format($totalPaid, 2, '.', ''),
                'totalPending' => number_format($totalPending, 2, '.', ''),
                'paidCount' => $paidCount,
                'pendingCount' => $pendingCount,
            ]
        ]);
    }

    /**
     * Send package proposal to client
     */
    #[Route('/packages/{id}/send', name: 'api_agent_packages_send', methods: ['POST'])]
    public function sendPackageProposal(int $id, Request $request): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $package = $this->packageRepository->find($id);
        if (!$package) {
            return $this->json(['error' => 'Package not found'], 404);
        }

        if ($package->getAgent()->getId() !== $agent->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $clientId = $data['clientId'] ?? null;

        if ($clientId) {
            $client = $this->em->getRepository(User::class)->find($clientId);
            if ($client) {
                $package->setClient($client);
            }
        }

        if (!$package->getClient()) {
            return $this->json(['error' => 'Client ID is required'], 400);
        }

        $package->setStatus('SENT');
        $this->em->flush();

        // Send notification to client
        if ($this->notificationService) {
            $this->notificationService->createNotification(
                $package->getClient(),
                'package_proposal',
                'New Travel Package Proposal',
                "You have received a new travel package proposal: {$package->getName()}",
                'package',
                $package->getId(),
                "/packages/{$package->getId()}",
                ['packageName' => $package->getName(), 'totalPrice' => $package->getTotalPrice()]
            );
        }

        return $this->json([
            'message' => 'Package proposal sent successfully',
            'package' => $this->serializePackage($package)
        ]);
    }

    /**
     * Accept package proposal (client action, but endpoint here for consistency)
     */
    #[Route('/packages/{id}/accept', name: 'api_agent_packages_accept', methods: ['POST'])]
    public function acceptPackageProposal(int $id): JsonResponse
    {
        $package = $this->packageRepository->find($id);
        if (!$package) {
            return $this->json(['error' => 'Package not found'], 404);
        }

        if ($package->getStatus() !== 'SENT') {
            return $this->json(['error' => 'Package is not in SENT status'], 400);
        }

        $package->setStatus('ACCEPTED');
        $this->em->flush();

        // Notify agent
        if ($this->notificationService) {
            $this->notificationService->createNotification(
                $package->getAgent(),
                'package_accepted',
                'Package Proposal Accepted',
                "Your package proposal '{$package->getName()}' has been accepted by the client.",
                'package',
                $package->getId(),
                "/agent/packages/{$package->getId()}",
                ['packageName' => $package->getName()]
            );
        }

        return $this->json([
            'message' => 'Package proposal accepted',
            'package' => $this->serializePackage($package)
        ]);
    }

    /**
     * Reject package proposal
     */
    #[Route('/packages/{id}/reject', name: 'api_agent_packages_reject', methods: ['POST'])]
    public function rejectPackageProposal(int $id): JsonResponse
    {
        $package = $this->packageRepository->find($id);
        if (!$package) {
            return $this->json(['error' => 'Package not found'], 404);
        }

        if ($package->getStatus() !== 'SENT') {
            return $this->json(['error' => 'Package is not in SENT status'], 400);
        }

        $package->setStatus('REJECTED');
        $this->em->flush();

        // Notify agent
        if ($this->notificationService) {
            $this->notificationService->createNotification(
                $package->getAgent(),
                'package_rejected',
                'Package Proposal Rejected',
                "Your package proposal '{$package->getName()}' has been rejected by the client.",
                'package',
                $package->getId(),
                "/agent/packages/{$package->getId()}",
                ['packageName' => $package->getName()]
            );
        }

        return $this->json([
            'message' => 'Package proposal rejected',
            'package' => $this->serializePackage($package)
        ]);
    }

    private function serializeMessage(AgentMessage $message): array
    {
        return [
            'id' => $message->getId(),
            'subject' => $message->getSubject(),
            'message' => $message->getMessage(),
            'direction' => $message->getDirection(),
            'read' => $message->isRead(),
            'bookingId' => $message->getBooking()?->getId(),
            'createdAt' => $message->getCreatedAt()->format('Y-m-d H:i:s'),
        ];
    }

    private function serializeCommission(Commission $commission): array
    {
        $booking = $commission->getBooking();
        $destination = $booking->getDestination();

        return [
            'id' => $commission->getId(),
            'bookingId' => $booking->getId(),
            'bookingReference' => $booking->getBookingReference(),
            'destination' => $destination ? $destination->getName() : 'Unknown',
            'amount' => $commission->getAmount(),
            'percentage' => $commission->getPercentage(),
            'status' => $commission->getStatus(),
            'paidAt' => $commission->getPaidAt()?->format('Y-m-d H:i:s'),
            'createdAt' => $commission->getCreatedAt()->format('Y-m-d H:i:s'),
        ];
    }

    private function serializeBooking(Booking $booking): array
    {
        $destination = $booking->getDestination();
        $user = $booking->getUser();
        $profile = $user->getProfile();
        
        return [
            'id' => $booking->getId(),
            'bookingReference' => $booking->getBookingReference(),
            'destination' => [
                'id' => $destination->getId(),
                'name' => $destination->getName(),
                'city' => $destination->getCity(),
                'country' => $destination->getCountry(),
            ],
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $profile?->getFirstName(),
                'lastName' => $profile?->getLastName(),
                'phone' => $profile?->getPhone(),
            ],
            'checkInDate' => $booking->getCheckInDate()?->format('Y-m-d'),
            'checkOutDate' => $booking->getCheckOutDate()?->format('Y-m-d'),
            'numberOfGuests' => $booking->getNumberOfGuests(),
            'totalPrice' => $booking->getTotalPrice(),
            'status' => $booking->getStatus(),
            'paymentStatus' => $booking->getPaymentStatus(),
            'specialRequests' => $booking->getSpecialRequests(),
            'contactEmail' => $booking->getContactEmail(),
            'contactPhone' => $booking->getContactPhone(),
            'createdAt' => $booking->getCreatedAt()->format('Y-m-d H:i:s'),
        ];
    }
}

