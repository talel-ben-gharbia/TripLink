<?php

namespace App\Service;

use App\Entity\Booking;
use App\Entity\User;
use App\Repository\BookingRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Service for automation features
 */
class AutomationService
{
    public function __construct(
        private EntityManagerInterface $em,
        private BookingRepository $bookingRepository,
        private UserRepository $userRepository,
        private ?NotificationService $notificationService = null
    ) {
    }

    /**
     * Auto-assign agent to booking
     * Assigns to agent with least pending bookings
     */
    public function autoAssignAgent(Booking $booking): ?User
    {
        if ($booking->getBookingType() !== 'AGENT') {
            return null;
        }

        if ($booking->getAgent() !== null) {
            return $booking->getAgent(); // Already assigned
        }

        try {
            // Get all active agents
            $agents = $this->userRepository->createQueryBuilder('u')
                ->where('u.roles LIKE :role')
                ->andWhere('u.status = :status')
                ->setParameter('role', '%ROLE_AGENT%')
                ->setParameter('status', 'ACTIVE')
                ->getQuery()
                ->getResult();

            if (empty($agents)) {
                // No agents available - booking will be created without assignment
                // Agent can be assigned manually later
                return null;
            }
        } catch (\Exception $e) {
            error_log('Error fetching agents for auto-assignment: ' . $e->getMessage());
            return null;
        }

        try {
            // Find agent with least pending bookings
            $agentBookings = [];
            foreach ($agents as $agent) {
                try {
                    $pendingCount = $this->bookingRepository->createQueryBuilder('b')
                        ->select('COUNT(b.id)')
                        ->where('b.agent = :agent')
                        ->andWhere('b.status = :status')
                        ->andWhere('b.bookingType = :type')
                        ->setParameter('agent', $agent)
                        ->setParameter('status', 'PENDING')
                        ->setParameter('type', 'AGENT')
                        ->getQuery()
                        ->getSingleScalarResult();

                    $agentBookings[$agent->getId()] = $pendingCount;
                } catch (\Exception $e) {
                    // If query fails for one agent, set count to 0 and continue
                    error_log('Error counting bookings for agent ' . $agent->getId() . ': ' . $e->getMessage());
                    $agentBookings[$agent->getId()] = 0;
                }
            }

            // Sort by pending bookings count (ascending)
            asort($agentBookings);
            $selectedAgentId = array_key_first($agentBookings);
            $selectedAgent = null;

            foreach ($agents as $agent) {
                if ($agent->getId() === $selectedAgentId) {
                    $selectedAgent = $agent;
                    break;
                }
            }

            if ($selectedAgent) {
                $booking->setAgent($selectedAgent);
                $this->em->flush();

                // Notify agent
                if ($this->notificationService) {
                    try {
                        $destination = $booking->getDestination();
                        $customerName = $booking->getUser()->getProfile()?->getFirstName() . ' ' . 
                                       $booking->getUser()->getProfile()?->getLastName();
                        
                        $this->notificationService->notifyAgentAssigned(
                            $selectedAgent,
                            $booking->getId(),
                            $booking->getBookingReference(),
                            $destination ? $destination->getName() : 'Unknown Destination',
                            $customerName
                        );
                    } catch (\Exception $e) {
                        // Log notification error but don't fail assignment
                        error_log('Failed to notify agent of assignment: ' . $e->getMessage());
                    }
                }
            }
        } catch (\Exception $e) {
            error_log('Error in agent assignment logic: ' . $e->getMessage());
            // Return null - booking will be created without agent, can be assigned later
            return null;
        }

        return $selectedAgent;
    }

    /**
     * Auto-update payment status when payment is received
     */
    public function autoUpdatePaymentStatus(Booking $booking, string $paymentStatus): void
    {
        $oldStatus = $booking->getPaymentStatus();
        $booking->setPaymentStatus($paymentStatus);
        $this->em->flush();

        // Notify user of payment status change
        if ($this->notificationService && $oldStatus !== $paymentStatus) {
            $destination = $booking->getDestination();
            $destinationName = $destination ? $destination->getName() : 'Unknown Destination';

            if ($paymentStatus === 'PAID') {
                $this->notificationService->notifyPaymentReceived(
                    $booking->getUser(),
                    $booking->getId(),
                    $booking->getBookingReference(),
                    (float)$booking->getTotalPrice()
                );
            } elseif ($paymentStatus === 'FAILED') {
                $this->notificationService->createNotification(
                    $booking->getUser(),
                    'payment_failed',
                    'Payment Failed',
                    "Payment for booking {$booking->getBookingReference()} for {$destinationName} has failed. Please try again.",
                    'booking',
                    $booking->getId(),
                    "/bookings?booking={$booking->getId()}",
                    ['bookingReference' => $booking->getBookingReference()]
                );
            }
        }
    }

    /**
     * Send reminders for upcoming trips (within 7 days)
     */
    public function sendUpcomingTripReminders(): int
    {
        $reminderDate = new \DateTime('+7 days');
        $today = new \DateTime();

        $upcomingBookings = $this->bookingRepository->createQueryBuilder('b')
            ->where('b.status = :status')
            ->andWhere('b.checkInDate >= :today')
            ->andWhere('b.checkInDate <= :reminderDate')
            ->setParameter('status', 'CONFIRMED')
            ->setParameter('today', $today->format('Y-m-d'))
            ->setParameter('reminderDate', $reminderDate->format('Y-m-d'))
            ->getQuery()
            ->getResult();

        $sentCount = 0;
        foreach ($upcomingBookings as $booking) {
            if ($this->notificationService) {
                $destination = $booking->getDestination();
                $destinationName = $destination ? $destination->getName() : 'Unknown Destination';
                $checkInDate = $booking->getCheckInDate();
                $daysUntil = $checkInDate ? $today->diff($checkInDate)->days : 0;

                $this->notificationService->createNotification(
                    $booking->getUser(),
                    'trip_reminder',
                    'Upcoming Trip Reminder',
                    "Your trip to {$destinationName} is in {$daysUntil} days! Check-in: " . 
                    ($checkInDate ? $checkInDate->format('Y-m-d') : 'TBD'),
                    'booking',
                    $booking->getId(),
                    "/bookings?booking={$booking->getId()}",
                    [
                        'bookingReference' => $booking->getBookingReference(),
                        'daysUntil' => $daysUntil,
                        'checkInDate' => $checkInDate ? $checkInDate->format('Y-m-d') : null
                    ]
                );
                $sentCount++;
            }
        }

        return $sentCount;
    }

    /**
     * Auto-assign agent to pending bookings (batch process)
     */
    public function autoAssignPendingBookings(): int
    {
        $pendingBookings = $this->bookingRepository->createQueryBuilder('b')
            ->where('b.bookingType = :type')
            ->andWhere('b.status = :status')
            ->andWhere('b.agent IS NULL')
            ->setParameter('type', 'AGENT')
            ->setParameter('status', 'PENDING')
            ->getQuery()
            ->getResult();

        $assignedCount = 0;
        foreach ($pendingBookings as $booking) {
            $agent = $this->autoAssignAgent($booking);
            if ($agent) {
                $assignedCount++;
            }
        }

        return $assignedCount;
    }
}

