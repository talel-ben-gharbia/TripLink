<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\LoginAttemptRepository;
use App\Repository\UserActivityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private LoginAttemptRepository $loginAttemptRepository,
        private UserActivityRepository $userActivityRepository,
        private EntityManagerInterface $entityManager,
        private \App\Repository\AuthSessionRepository $authSessionRepository
    ) {
    }

    #[Route('/users', name: 'admin_users_list', methods: ['GET'])]
    public function listUsers(): JsonResponse
    {
        $users = $this->userRepository->findAll();
        $data = [];

        foreach ($users as $user) {
            // Skip admin users from the list
            if (!$user->isAdmin()) {
                $data[] = $this->serializeUser($user);
            }
        }

        return $this->json($data);
    }

    #[Route('/users/{id}', name: 'admin_user_details', methods: ['GET'])]
    public function userDetails(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        // Get login attempts for this user
        $loginAttempts = $this->loginAttemptRepository->findBy(
            ['email' => $user->getEmail()],
            ['attemptedAt' => 'DESC'],
            20 // Last 20 attempts
        );

        $attemptData = [];
        foreach ($loginAttempts as $attempt) {
            $attemptData[] = [
                'id' => $attempt->getId(),
                'ipAddress' => $attempt->getIpAddress(),
                'attemptedAt' => $attempt->getAttemptedAt()->format('c'),
                'success' => $attempt->isSuccess(),
            ];
        }

        $userData = $this->serializeUser($user, true);
        $userData['loginAttemptHistory'] = $attemptData;
        $userData['totalLoginAttempts'] = count($loginAttempts);
        $userData['successfulLogins'] = count(array_filter($attemptData, fn($a) => $a['success']));
        $userData['failedLogins'] = count(array_filter($attemptData, fn($a) => !$a['success']));

        return $this->json($userData);
    }

    #[Route('/users/{id}/suspend', name: 'admin_user_suspend', methods: ['POST'])]
    public function suspendUser(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        if ($user->isAdmin()) {
            return $this->json(['error' => 'Cannot suspend admin users'], 403);
        }

        $user->setStatus('SUSPENDED');
        
        // Invalidate all user sessions when suspending
        $sessions = $this->authSessionRepository->findBy(['user' => $user]);
        foreach ($sessions as $session) {
            $this->entityManager->remove($session);
        }
        
        // Increment token version to invalidate all tokens
        $user->setTokenVersion($user->getTokenVersion() + 1);
        
        $this->entityManager->flush();

        return $this->json([
            'message' => 'User suspended successfully. All sessions invalidated.',
            'user' => $this->serializeUser($user)
        ]);
    }

    #[Route('/users/{id}/activate', name: 'admin_user_activate', methods: ['POST'])]
    public function activateUser(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $user->setStatus('ACTIVE');
        $this->entityManager->flush();

        return $this->json([
            'message' => 'User activated successfully.',
            'user' => $this->serializeUser($user)
        ]);
    }

    #[Route('/users/{id}', name: 'admin_user_delete', methods: ['DELETE'])]
    public function deleteUser(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        if ($user->isAdmin()) {
            return $this->json(['error' => 'Cannot delete admin users'], 403);
        }

        $email = $user->getEmail();
        
        // Clean up sessions before deleting user (cascade should handle this, but be explicit)
        $sessions = $this->authSessionRepository->findBy(['user' => $user]);
        foreach ($sessions as $session) {
            $this->entityManager->remove($session);
        }
        
        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return $this->json([
            'message' => "User {$email} deleted successfully."
        ]);
    }

    #[Route('/users/{id}', name: 'admin_user_update', methods: ['PUT', 'PATCH'])]
    public function updateUser(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);
        
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        if ($user->isAdmin()) {
            return $this->json(['error' => 'Cannot modify admin users'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['status'])) {
            try {
                $user->setStatus($data['status']);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['error' => $e->getMessage()], 400);
            }
        }

        if (isset($data['isVerified'])) {
            $user->setIsVerified((bool)$data['isVerified']);
        }

        $this->entityManager->flush();

        return $this->json([
            'message' => 'User updated successfully.',
            'user' => $this->serializeUser($user, true)
        ]);
    }

    #[Route('/stats', name: 'admin_stats', methods: ['GET'])]
    public function getStats(): JsonResponse
    {
        $allUsers = $this->userRepository->findAll();
        $regularUsers = array_filter($allUsers, fn($u) => !$u->isAdmin());
        
        $totalUsers = count($regularUsers);
        $activeUsers = count(array_filter($regularUsers, fn($u) => $u->getStatus() === 'ACTIVE'));
        $suspendedUsers = count(array_filter($regularUsers, fn($u) => $u->getStatus() === 'SUSPENDED'));
        $pendingUsers = count(array_filter($regularUsers, fn($u) => $u->getStatus() === 'PENDING'));
        $verifiedUsers = count(array_filter($regularUsers, fn($u) => $u->isVerified()));

        // Get recent login attempts
        $recentAttempts = $this->loginAttemptRepository->findBy(
            [],
            ['attemptedAt' => 'DESC'],
            10
        );

        return $this->json([
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'suspendedUsers' => $suspendedUsers,
            'pendingUsers' => $pendingUsers,
            'verifiedUsers' => $verifiedUsers,
            'unverifiedUsers' => $totalUsers - $verifiedUsers,
            'recentActivity' => count($recentAttempts),
        ]);
    }

    private function serializeUser(User $user, bool $includeDetails = false): array
    {
        $profile = $user->getProfile();
        $activity = $user->getActivity();
        
        $data = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'status' => $user->getStatus(),
            'isVerified' => $user->isVerified(),
            'firstName' => $profile?->getFirstName(),
            'lastName' => $profile?->getLastName(),
            'phone' => $profile?->getPhone(),
            'createdAt' => $activity?->getCreatedAt()?->format('c'),
            'lastLogin' => $activity?->getLastLogin()?->format('c'),
            'updatedAt' => $activity?->getUpdatedAt()?->format('c'),
        ];

        if ($includeDetails) {
            $data['loginAttempts'] = $user->getLoginAttempts();
            $data['lastLoginAttempt'] = $user->getLastLoginAttempt()?->format('c');
            $data['tokenVersion'] = $user->getTokenVersion();
            
            // Add preferences if available
            $preferences = $user->getPreferences();
            if ($preferences) {
                $data['preferences'] = [
                    'travelStyles' => $preferences->getTravelStyles(),
                    'interests' => $preferences->getInterests(),
                    'budgetRange' => $preferences->getBudgetRange(),
                    'profileCompletion' => $preferences->getProfileCompletion(),
                ];
            }
        }

        return $data;
    }
}
