<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Entity\User;
use App\Repository\BookingRepository;
use App\Service\BookingService;
use App\Service\RoutingService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/bookings')]
class BookingController extends AbstractController
{
    public function __construct(
        private BookingService $bookingService,
        private BookingRepository $bookingRepository,
        private EntityManagerInterface $em
    ) {
    }

    /**
     * Create a new booking
     */
    #[Route('', name: 'api_booking_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (empty($data['destinationId'])) {
            return $this->json(['error' => 'Destination ID is required'], 400);
        }

        $result = $this->bookingService->createBooking($user, $data['destinationId'], $data);

        if (!$result['success']) {
            return $this->json(['error' => $result['error']], 400);
        }

        $booking = $result['booking'];
        
        return $this->json([
            'message' => 'Booking created successfully',
            'booking' => $this->serializeBooking($booking),
            'routing' => $result['routing'],
            'requiresPayment' => $result['requiresPayment']
        ], 201);
    }

    /**
     * Get user's bookings
     */
    #[Route('', name: 'api_booking_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $bookings = $this->bookingRepository->findByUser($user);
        
        return $this->json([
            'bookings' => array_map([$this, 'serializeBooking'], $bookings)
        ]);
    }

    /**
     * Get booking details
     */
    #[Route('/{id}', name: 'api_booking_get', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function get(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $booking = $this->bookingRepository->find($id);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        // Check ownership or agent assignment
        if ($booking->getUser()->getId() !== $user->getId() && 
            ($booking->getAgent() === null || $booking->getAgent()->getId() !== $user->getId()) &&
            !$user->isAdmin()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        return $this->json([
            'booking' => $this->serializeBooking($booking)
        ]);
    }

    /**
     * Update booking details
     */
    #[Route('/{id}', name: 'api_booking_update', methods: ['PUT', 'PATCH'])]
    #[IsGranted('ROLE_USER')]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $booking = $this->bookingRepository->find($id);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        // Check access: owner, assigned agent, or admin
        $hasAccess = $booking->getUser()->getId() === $user->getId() ||
                     ($booking->getAgent() && $booking->getAgent()->getId() === $user->getId()) ||
                     $user->isAdmin();

        if (!$hasAccess) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        // Can't edit cancelled or completed bookings
        if ($booking->getStatus() === 'CANCELLED' || $booking->getStatus() === 'COMPLETED') {
            return $this->json(['error' => 'Cannot edit cancelled or completed bookings'], 400);
        }

        $data = json_decode($request->getContent(), true);
        $this->bookingService->updateBooking($booking, $data);

        return $this->json([
            'message' => 'Booking updated successfully',
            'booking' => $this->serializeBooking($booking)
        ]);
    }

    /**
     * Cancel booking
     */
    #[Route('/{id}/cancel', name: 'api_booking_cancel', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function cancel(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $booking = $this->bookingRepository->find($id);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        // Check ownership or admin/agent access
        $hasAccess = $booking->getUser()->getId() === $user->getId() ||
                     ($booking->getAgent() && $booking->getAgent()->getId() === $user->getId()) ||
                     $user->isAdmin();

        if (!$hasAccess) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $reason = $data['reason'] ?? null;

        // Check payment status before cancellation
        $wasPaid = $booking->isPaid();
        $hadPendingPayment = $booking->getPaymentStatus() === 'PENDING';
        $stripePaymentId = $booking->getStripePaymentIntentId();

        // Process refund if payment was made
        $refundProcessed = false;
        if ($wasPaid && $stripePaymentId) {
            try {
                $stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'] ?? null;
                if ($stripeSecretKey && class_exists(\Stripe\Stripe::class)) {
                    \Stripe\Stripe::setApiKey($stripeSecretKey);
                    
                    // Try to refund via PaymentIntent first
                    try {
                        $paymentIntent = \Stripe\PaymentIntent::retrieve($stripePaymentId);
                        if ($paymentIntent->status === 'succeeded') {
                            \Stripe\Refund::create([
                                'payment_intent' => $paymentIntent->id,
                                'reason' => 'requested_by_customer',
                            ]);
                            $refundProcessed = true;
                        }
                    } catch (\Exception $e) {
                        // If PaymentIntent doesn't work, try CheckoutSession
                        try {
                            $session = \Stripe\Checkout\Session::retrieve($stripePaymentId);
                            if ($session->payment_intent) {
                                \Stripe\Refund::create([
                                    'payment_intent' => $session->payment_intent,
                                    'reason' => 'requested_by_customer',
                                ]);
                                $refundProcessed = true;
                            }
                        } catch (\Exception $e2) {
                            error_log('Stripe refund error: ' . $e2->getMessage());
                            // Continue with cancellation even if refund fails
                        }
                    }
                }
            } catch (\Exception $e) {
                error_log('Error processing refund: ' . $e->getMessage());
                // Continue with cancellation even if refund fails
            }
        }

        // Cancel the booking (this will update payment status)
        $this->bookingService->cancelBooking($booking, $reason);

        // Build response message
        $message = 'Booking cancelled successfully.';
        if ($wasPaid) {
            $message .= $refundProcessed ? ' Payment refund has been processed.' : ' Refund will be processed.';
        } else if ($hadPendingPayment) {
            $message .= ' Payment has been cancelled.';
        }

        return $this->json([
            'message' => $message,
            'booking' => $this->serializeBooking($booking)
        ]);
    }

    /**
     * Complete booking (mark trip as completed)
     */
    #[Route('/{id}/complete', name: 'api_booking_complete', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function complete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $booking = $this->bookingRepository->find($id);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        // Only admin, agent, or owner can complete bookings
        $hasAccess = $booking->getUser()->getId() === $user->getId() ||
                     ($booking->getAgent() && $booking->getAgent()->getId() === $user->getId()) ||
                     $user->isAdmin();

        if (!$hasAccess) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        if (!$this->bookingService->completeBooking($booking)) {
            return $this->json(['error' => 'Cannot complete this booking'], 400);
        }

        return $this->json([
            'message' => 'Booking marked as completed',
            'booking' => $this->serializeBooking($booking)
        ]);
    }

    /**
     * Finalize booking
     */
    #[Route('/{id}/finalize', name: 'api_booking_finalize', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function finalize(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $booking = $this->bookingRepository->find($id);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        // Only admin or assigned agent can finalize
        $hasAccess = ($booking->getAgent() && $booking->getAgent()->getId() === $user->getId()) ||
                     $user->isAdmin();

        if (!$hasAccess) {
            return $this->json(['error' => 'Access denied. Only assigned agent or admin can finalize bookings.'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $notes = $data['notes'] ?? null;

        if (!$this->bookingService->finalizeBooking($booking, $notes)) {
            return $this->json(['error' => 'Cannot finalize this booking'], 400);
        }

        return $this->json([
            'message' => 'Booking finalized successfully',
            'booking' => $this->serializeBooking($booking)
        ]);
    }

    /**
     * Check routing for a booking (before creating)
     */
    #[Route('/check-routing', name: 'api_booking_check_routing', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function checkRouting(Request $request, RoutingService $routingService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['destinationId'])) {
            return $this->json(['error' => 'Destination ID is required'], 400);
        }

        $destination = $this->em->getRepository(\App\Entity\Destination::class)->find($data['destinationId']);
        if (!$destination) {
            return $this->json(['error' => 'Destination not found'], 404);
        }

        $routing = $routingService->determineBookingType($destination, $data);

        return $this->json([
            'routing' => $routing
        ]);
    }

    private function serializeBooking(Booking $booking): array
    {
        $destination = $booking->getDestination();
        
        return [
            'id' => $booking->getId(),
            'bookingReference' => $booking->getBookingReference(),
            'destination' => [
                'id' => $destination->getId(),
                'name' => $destination->getName(),
                'city' => $destination->getCity(),
                'country' => $destination->getCountry(),
                'images' => $destination->getImages(),
            ],
            'bookingType' => $booking->getBookingType(),
            'checkInDate' => $booking->getCheckInDate()?->format('Y-m-d'),
            'checkOutDate' => $booking->getCheckOutDate()?->format('Y-m-d'),
            'numberOfGuests' => $booking->getNumberOfGuests(),
            'totalPrice' => $booking->getTotalPrice(),
            'status' => $booking->getStatus(),
            'paymentStatus' => $booking->getPaymentStatus(),
            'specialRequests' => $booking->getSpecialRequests(),
            'contactEmail' => $booking->getContactEmail(),
            'contactPhone' => $booking->getContactPhone(),
            'agent' => $booking->getAgent() ? [
                'id' => $booking->getAgent()->getId(),
                'email' => $booking->getAgent()->getEmail(),
                'profile' => $booking->getAgent()->getProfile() ? [
                    'firstName' => $booking->getAgent()->getProfile()->getFirstName(),
                    'lastName' => $booking->getAgent()->getProfile()->getLastName(),
                ] : null
            ] : null,
            'createdAt' => $booking->getCreatedAt()->format('Y-m-d H:i:s'),
            'confirmedAt' => $booking->getConfirmedAt()?->format('Y-m-d H:i:s'),
        ];
    }
}

