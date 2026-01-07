<?php

namespace App\Service;

use App\Entity\ActivityLog;
use App\Entity\Booking;
use App\Entity\Destination;
use App\Entity\User;
use App\Entity\Commission;
use App\Repository\BookingRepository;
use App\Repository\DestinationRepository;
use App\Repository\CommissionRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Service\EmailService;

class BookingService
{
    public function __construct(
        private EntityManagerInterface $em,
        private BookingRepository $bookingRepository,
        private DestinationRepository $destinationRepository,
        private CommissionRepository $commissionRepository,
        private RoutingService $routingService,
        private ?EmailService $emailService = null,
        private ?\App\Service\NotificationService $notificationService = null,
        private ?\App\Service\AutomationService $automationService = null
    ) {
    }

    /**
     * Log booking activity
     */
    private function logActivity(User $user, string $actionType, Booking $booking, ?array $metadata = null): void
    {
        try {
            $activityLog = new ActivityLog();
            $activityLog->setUser($user);
            $activityLog->setActionType($actionType);
            $activityLog->setEntityType('booking');
            $activityLog->setEntityId($booking->getId());
            
            $destination = $booking->getDestination();
            $logMetadata = [
                'bookingReference' => $booking->getBookingReference(),
                'destination' => $destination ? $destination->getName() : 'Unknown Destination',
                'destinationId' => $destination ? $destination->getId() : null,
                'status' => $booking->getStatus(),
                'paymentStatus' => $booking->getPaymentStatus(),
                'totalPrice' => $booking->getTotalPrice(),
            ];
            
            if ($metadata) {
                $logMetadata = array_merge($logMetadata, $metadata);
            }
            
            $activityLog->setMetadata($logMetadata);
            $this->em->persist($activityLog);
        } catch (\Exception $e) {
            // Log error but don't break the booking flow
            error_log('Failed to log booking activity: ' . $e->getMessage());
        }
    }

    /**
     * Calculate booking price
     */
    public function calculatePrice(Destination $destination, array $bookingData): float
    {
        $basePrice = $destination->getPriceMin() ?? 0;
        $guests = isset($bookingData['numberOfGuests']) ? (int)$bookingData['numberOfGuests'] : 1;
        $days = 1;

        if (isset($bookingData['checkInDate']) && !empty($bookingData['checkInDate'])) {
            $checkIn = new \DateTime($bookingData['checkInDate']);
            if (isset($bookingData['checkOutDate']) && !empty($bookingData['checkOutDate'])) {
                $checkOut = new \DateTime($bookingData['checkOutDate']);
                $days = max(1, $checkOut->diff($checkIn)->days);
            }
        }

        // Simple pricing: base price * days * guest multiplier
        $guestMultiplier = min(1.5, 1 + ($guests - 1) * 0.1); // 10% per additional guest, max 50% increase
        $totalPrice = $basePrice * $days * $guestMultiplier;

        return round($totalPrice, 2);
    }

    /**
     * Create a new booking
     */
    public function createBooking(User $user, int $destinationId, array $data): array
    {
        $destination = $this->destinationRepository->find($destinationId);
        if (!$destination) {
            return ['success' => false, 'error' => 'Destination not found'];
        }

        // Determine routing
        $routing = $this->routingService->determineBookingType($destination, $data);
        
        // Check if user manually requested agent
        if (isset($data['requestAgent']) && $data['requestAgent']) {
            $routing['type'] = 'AGENT';
            $routing['reason'] = 'User requested agent assistance';
        }

        // Calculate price
        $totalPrice = $this->calculatePrice($destination, $data);

        // Create booking
        $booking = new Booking();
        $booking->setUser($user);
        $booking->setDestination($destination);
        $booking->setBookingType($routing['type']);
        
        // Handle check-in date
        if (isset($data['checkInDate']) && !empty($data['checkInDate'])) {
            $checkInDate = is_string($data['checkInDate']) 
                ? new \DateTime($data['checkInDate']) 
                : $data['checkInDate'];
            $booking->setCheckInDate($checkInDate);
        } else {
            return ['success' => false, 'error' => 'Check-in date is required'];
        }
        
        // Handle check-out date (optional)
        if (isset($data['checkOutDate']) && !empty($data['checkOutDate'])) {
            $checkOutDate = is_string($data['checkOutDate']) 
                ? new \DateTime($data['checkOutDate']) 
                : $data['checkOutDate'];
            $booking->setCheckOutDate($checkOutDate);
        }
        $booking->setNumberOfGuests(isset($data['numberOfGuests']) ? (int)$data['numberOfGuests'] : 1);
        $booking->setTotalPrice((string)$totalPrice);
        $booking->setContactEmail($data['contactEmail'] ?? $user->getEmail());
        $booking->setContactPhone($data['contactPhone'] ?? null);
        $booking->setSpecialRequests($data['specialRequests'] ?? null);
        $booking->setStatus('PENDING');
        $booking->setPaymentStatus('PENDING');

        $this->em->persist($booking);
        $this->em->flush();

        // If agent booking, try auto-assignment (after booking is persisted)
        if ($routing['type'] === 'AGENT' && $this->automationService) {
            try {
                $this->automationService->autoAssignAgent($booking);
            } catch (\Exception $e) {
                // Log error but don't fail booking creation
                // Booking will be created without agent assignment, can be assigned later
                error_log('Failed to auto-assign agent: ' . $e->getMessage());
            }
        }

        // Log booking creation (after flush so booking has an ID)
        $this->logActivity($user, 'create_booking', $booking, [
            'bookingType' => $routing['type'],
            'routingReason' => $routing['reason'] ?? null,
        ]);
        $this->em->flush(); // Flush the activity log

        return [
            'success' => true,
            'booking' => $booking,
            'routing' => $routing,
            'requiresPayment' => $routing['type'] === 'DIRECT'
        ];
    }

    /**
     * Confirm booking (after payment or agent approval)
     */
    public function confirmBooking(Booking $booking, ?string $stripePaymentIntentId = null): bool
    {
        if ($booking->isConfirmed()) {
            return false;
        }

        $booking->setStatus('CONFIRMED');
        
        // Only set payment status to PAID if payment intent ID is provided (direct bookings)
        // For agent bookings, payment will be processed after agent confirmation
        if ($stripePaymentIntentId) {
            $booking->setStripePaymentIntentId($stripePaymentIntentId);
            $booking->setPaymentStatus('PAID');
        } else {
            // For agent bookings without payment intent, keep payment status as PENDING
            // User will complete payment after agent confirms
            if ($booking->getPaymentStatus() === 'PENDING') {
                // Keep it as PENDING - payment will be processed later
            }
        }

        $this->em->flush();

        // Log booking confirmation
        $this->logActivity($booking->getUser(), 'confirm_booking', $booking, [
            'paymentIntentId' => $stripePaymentIntentId,
        ]);
        $this->em->flush(); // Flush the activity log

        // Send confirmation email
        if ($this->emailService) {
            try {
                $this->emailService->sendBookingConfirmationEmail($booking);
            } catch (\Exception $e) {
                // Log error but don't fail booking confirmation
                error_log('Failed to send booking confirmation email: ' . $e->getMessage());
            }
        }

        // Create commission for agent bookings when confirmed
        if ($booking->getBookingType() === 'AGENT' && $booking->getAgent()) {
            try {
                // Check if commission already exists
                $existingCommission = $this->commissionRepository->createQueryBuilder('c')
                    ->where('c.booking = :booking')
                    ->andWhere('c.agent = :agent')
                    ->setParameter('booking', $booking)
                    ->setParameter('agent', $booking->getAgent())
                    ->getQuery()
                    ->getOneOrNullResult();

                if (!$existingCommission) {
                    $totalPrice = (float)$booking->getTotalPrice();
                    $commissionPercentage = 10.0; // Default 10% commission
                    $commissionAmount = ($totalPrice * $commissionPercentage) / 100;

                    $commission = new Commission();
                    $commission->setAgent($booking->getAgent());
                    $commission->setBooking($booking);
                    $commission->setAmount(number_format($commissionAmount, 2, '.', ''));
                    $commission->setPercentage(number_format($commissionPercentage, 2, '.', ''));
                    $commission->setStatus('PENDING'); // Will be paid later

                    $this->em->persist($commission);
                    $this->em->flush();
                }
            } catch (\Exception $e) {
                error_log('Failed to create commission: ' . $e->getMessage());
            }
        }

        // Send notification
        if ($this->notificationService) {
            try {
                $destination = $booking->getDestination();
                $destinationName = $destination ? $destination->getName() : 'Unknown Destination';
                
                // For agent bookings, include message about payment
                if ($booking->getBookingType() === 'AGENT' && !$stripePaymentIntentId) {
                    $this->notificationService->createNotification(
                        $booking->getUser(),
                        'booking_confirmed',
                        'Booking Confirmed by Agent',
                        "Your booking {$booking->getBookingReference()} for {$destinationName} has been confirmed by your agent. You can now complete the payment.",
                        'booking',
                        $booking->getId(),
                        "/bookings?booking={$booking->getId()}",
                        ['bookingReference' => $booking->getBookingReference(), 'requiresPayment' => true]
                    );
                } else {
                    $this->notificationService->notifyBookingConfirmed(
                        $booking->getUser(),
                        $booking->getId(),
                        $booking->getBookingReference(),
                        $destinationName
                    );
                }
            } catch (\Exception $e) {
                error_log('Failed to send booking confirmation notification: ' . $e->getMessage());
            }
        }

        return true;
    }

    /**
     * Cancel booking
     */
    public function cancelBooking(Booking $booking, ?string $reason = null): bool
    {
        if ($booking->isCancelled()) {
            return false;
        }

        $booking->setStatus('CANCELLED');
        $booking->setCancellationReason($reason);
        // cancelledAt is automatically set by setStatus('CANCELLED')
        
        // Always update payment status when cancelling
        $currentPaymentStatus = $booking->getPaymentStatus();
        if ($booking->isPaid()) {
            // If payment was made, mark for refund (actual refund processed in controller)
            $booking->setPaymentStatus('REFUNDED');
        } else {
            // If payment was pending or any other status, mark as failed/declined
            // This ensures payment is always marked as declined when booking is cancelled
            $booking->setPaymentStatus('FAILED');
        }

        $this->em->flush();

        // Log booking cancellation
        $this->logActivity($booking->getUser(), 'cancel_booking', $booking, [
            'reason' => $reason,
        ]);
        $this->em->flush(); // Flush the activity log

        // Send notification
        if ($this->notificationService) {
            try {
                $this->notificationService->notifyBookingCancelled(
                    $booking->getUser(),
                    $booking->getId(),
                    $booking->getBookingReference(),
                    $booking->getDestination()->getName(),
                    $reason
                );
            } catch (\Exception $e) {
                error_log('Failed to send booking cancellation notification: ' . $e->getMessage());
            }
        }

        return true;
    }

    /**
     * Update booking details
     */
    public function updateBooking(Booking $booking, array $data): bool
    {
        // Update check-in date
        if (isset($data['checkInDate']) && !empty($data['checkInDate'])) {
            $checkInDate = is_string($data['checkInDate']) 
                ? new \DateTime($data['checkInDate']) 
                : $data['checkInDate'];
            $booking->setCheckInDate($checkInDate);
        }

        // Update check-out date
        if (isset($data['checkOutDate'])) {
            if (!empty($data['checkOutDate'])) {
                $checkOutDate = is_string($data['checkOutDate']) 
                    ? new \DateTime($data['checkOutDate']) 
                    : $data['checkOutDate'];
                $booking->setCheckOutDate($checkOutDate);
            } else {
                $booking->setCheckOutDate(null);
            }
        }

        // Update number of guests
        if (isset($data['numberOfGuests'])) {
            $booking->setNumberOfGuests((int)$data['numberOfGuests']);
        }

        // Update contact information
        if (isset($data['contactEmail'])) {
            $booking->setContactEmail($data['contactEmail']);
        }

        if (isset($data['contactPhone'])) {
            $booking->setContactPhone($data['contactPhone'] ?? null);
        }

        // Update special requests
        if (isset($data['specialRequests'])) {
            $booking->setSpecialRequests($data['specialRequests'] ?? null);
        }

        // Recalculate price if dates or guests changed
        if (isset($data['checkInDate']) || isset($data['checkOutDate']) || isset($data['numberOfGuests'])) {
            $bookingData = [
                'checkInDate' => $booking->getCheckInDate()?->format('Y-m-d'),
                'checkOutDate' => $booking->getCheckOutDate()?->format('Y-m-d'),
                'numberOfGuests' => $booking->getNumberOfGuests(),
            ];
            $newPrice = $this->calculatePrice($booking->getDestination(), $bookingData);
            $booking->setTotalPrice((string)$newPrice);
        }

        $booking->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        // Log booking update
        $this->logActivity($booking->getUser(), 'update_booking', $booking, [
            'updatedFields' => array_keys($data),
        ]);
        $this->em->flush(); // Flush the activity log

        return true;
    }

    /**
     * Complete booking (mark trip as completed)
     */
    public function completeBooking(Booking $booking): bool
    {
        if ($booking->getStatus() === 'COMPLETED') {
            return false;
        }

        if ($booking->getStatus() !== 'CONFIRMED') {
            return false; // Can only complete confirmed bookings
        }

        $booking->setStatus('COMPLETED');
        $booking->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        // Log booking completion
        $this->logActivity($booking->getUser(), 'complete_booking', $booking);
        $this->em->flush(); // Flush the activity log

        return true;
    }

    /**
     * Finalize booking (mark as finalized with optional notes)
     */
    public function finalizeBooking(Booking $booking, ?string $notes = null): bool
    {
        if ($booking->getStatus() === 'COMPLETED') {
            return false; // Already finalized
        }

        // Can finalize confirmed or pending bookings
        if ($booking->getStatus() === 'CANCELLED') {
            return false;
        }

        $booking->setStatus('COMPLETED');
        if ($notes) {
            // Store finalization notes in special requests or create a new field
            $currentNotes = $booking->getSpecialRequests() ?? '';
            $booking->setSpecialRequests($currentNotes . "\n\n[Finalized]: " . $notes);
        }
        $booking->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        // Log booking finalization
        $this->logActivity($booking->getUser(), 'finalize_booking', $booking, [
            'notes' => $notes,
        ]);
        $this->em->flush(); // Flush the activity log

        return true;
    }
}

