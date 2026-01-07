<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $em,
        private NotificationRepository $notificationRepository
    ) {
    }

    /**
     * Create and send a notification
     */
    public function createNotification(
        User $user,
        string $type,
        string $title,
        string $message,
        ?string $entityType = null,
        ?int $entityId = null,
        ?string $actionUrl = null,
        ?array $metadata = null
    ): Notification {
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setType($type);
        $notification->setTitle($title);
        $notification->setMessage($message);
        $notification->setEntityType($entityType);
        $notification->setEntityId($entityId);
        $notification->setActionUrl($actionUrl);
        $notification->setMetadata($metadata);

        $this->em->persist($notification);
        $this->em->flush();

        return $notification;
    }

    /**
     * Notify user about booking confirmation
     */
    public function notifyBookingConfirmed(User $user, int $bookingId, string $bookingReference, string $destinationName): void
    {
        $this->createNotification(
            $user,
            'booking_confirmed',
            'Booking Confirmed',
            "Your booking {$bookingReference} for {$destinationName} has been confirmed!",
            'booking',
            $bookingId,
            "/bookings?booking={$bookingId}",
            ['bookingReference' => $bookingReference]
        );
    }

    /**
     * Notify user about booking cancellation
     */
    public function notifyBookingCancelled(User $user, int $bookingId, string $bookingReference, string $destinationName, ?string $reason = null): void
    {
        $message = "Your booking {$bookingReference} for {$destinationName} has been cancelled.";
        if ($reason) {
            $message .= " Reason: {$reason}";
        }

        $this->createNotification(
            $user,
            'booking_cancelled',
            'Booking Cancelled',
            $message,
            'booking',
            $bookingId,
            "/bookings?booking={$bookingId}",
            ['bookingReference' => $bookingReference, 'reason' => $reason]
        );
    }

    /**
     * Notify user about payment received
     */
    public function notifyPaymentReceived(User $user, int $bookingId, string $bookingReference, float $amount): void
    {
        $this->createNotification(
            $user,
            'payment_received',
            'Payment Received',
            "Payment of $" . number_format($amount, 2) . " has been received for booking {$bookingReference}.",
            'booking',
            $bookingId,
            "/bookings?booking={$bookingId}",
            ['bookingReference' => $bookingReference, 'amount' => $amount]
        );
    }

    /**
     * Notify agent about new booking assignment
     */
    public function notifyAgentAssigned(User $agent, int $bookingId, string $bookingReference, string $destinationName, string $customerName): void
    {
        $this->createNotification(
            $agent,
            'agent_assigned',
            'New Booking Assigned',
            "You have been assigned to booking {$bookingReference} for {$destinationName} (Customer: {$customerName}).",
            'booking',
            $bookingId,
            "/agent/dashboard?booking={$bookingId}",
            ['bookingReference' => $bookingReference, 'customerName' => $customerName]
        );
    }

    /**
     * Get unread count for user
     */
    public function getUnreadCount(User $user): int
    {
        return $this->notificationRepository->countUnreadByUser($user);
    }

    /**
     * Get notifications for user
     */
    public function getNotifications(User $user, ?int $limit = null, ?int $offset = null): array
    {
        return $this->notificationRepository->findByUser($user, $limit, $offset);
    }

    /**
     * Mark notifications as read
     */
    public function markAsRead(User $user, array $notificationIds): void
    {
        $this->notificationRepository->markAsRead($user, $notificationIds);
    }

    /**
     * Mark all notifications as read for user
     */
    public function markAllAsRead(User $user): void
    {
        $this->notificationRepository->markAllAsRead($user);
    }
}


