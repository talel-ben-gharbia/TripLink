<?php

namespace App\Controller;

use App\Repository\NotificationRepository;
use App\Service\NotificationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/notifications')]
#[IsGranted('ROLE_USER')]
class NotificationController extends AbstractController
{
    public function __construct(
        private NotificationService $notificationService,
        private NotificationRepository $notificationRepository
    ) {
    }

    /**
     * Get user's notifications
     */
    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $limit = (int)($request->query->get('limit') ?? 50);
        $offset = (int)($request->query->get('offset') ?? 0);
        $unreadOnly = $request->query->get('unread_only') === 'true';

        if ($unreadOnly) {
            $notifications = $this->notificationRepository->findUnreadByUser($user, $limit);
        } else {
            $notifications = $this->notificationService->getNotifications($user, $limit, $offset);
        }

        $unreadCount = $this->notificationService->getUnreadCount($user);

        return $this->json([
            'notifications' => array_map([$this, 'serializeNotification'], $notifications),
            'unreadCount' => $unreadCount,
            'total' => count($notifications)
        ]);
    }

    /**
     * Get unread count
     */
    #[Route('/unread-count', name: 'api_notifications_unread_count', methods: ['GET'])]
    public function unreadCount(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $count = $this->notificationService->getUnreadCount($user);

        return $this->json(['count' => $count]);
    }

    /**
     * Mark notifications as read
     */
    #[Route('/mark-read', name: 'api_notifications_mark_read', methods: ['POST'])]
    public function markAsRead(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $notificationIds = $data['notificationIds'] ?? [];

        if (empty($notificationIds)) {
            return $this->json(['error' => 'No notification IDs provided'], 400);
        }

        $this->notificationService->markAsRead($user, $notificationIds);

        return $this->json(['message' => 'Notifications marked as read']);
    }

    /**
     * Mark all notifications as read
     */
    #[Route('/mark-all-read', name: 'api_notifications_mark_all_read', methods: ['POST'])]
    public function markAllAsRead(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $this->notificationService->markAllAsRead($user);

        return $this->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Serialize notification for JSON response
     */
    private function serializeNotification(\App\Entity\Notification $notification): array
    {
        return [
            'id' => $notification->getId(),
            'type' => $notification->getType(),
            'title' => $notification->getTitle(),
            'message' => $notification->getMessage(),
            'read' => $notification->isRead(),
            'entityType' => $notification->getEntityType(),
            'entityId' => $notification->getEntityId(),
            'actionUrl' => $notification->getActionUrl(),
            'metadata' => $notification->getMetadata(),
            'createdAt' => $notification->getCreatedAt()->format('c'),
        ];
    }
}




