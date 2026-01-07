<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserProfile;
use App\Entity\UserActivity;
use App\Repository\UserRepository;
use App\Repository\LoginAttemptRepository;
use App\Repository\UserActivityRepository;
use App\Repository\BookingRepository;
use App\Repository\AgentApplicationRepository;
use App\Service\EmailService;
use App\Constants\Roles;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private LoginAttemptRepository $loginAttemptRepository,
        private UserActivityRepository $userActivityRepository,
        private EntityManagerInterface $entityManager,
        private \App\Repository\AuthSessionRepository $authSessionRepository,
        private BookingRepository $bookingRepository,
        private AgentApplicationRepository $agentApplicationRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private EmailService $emailService
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

        // Get agent statistics
        $agents = array_filter($allUsers, fn($u) => $u->isAgent());
        $totalAgents = count($agents);
        $activeAgents = count(array_filter($agents, fn($u) => $u->getStatus() === 'ACTIVE'));

        // Get booking statistics
        $allBookings = $this->bookingRepository->findAll();
        $totalBookings = count($allBookings);
        $pendingBookings = count(array_filter($allBookings, fn($b) => $b->getStatus() === 'PENDING'));
        $confirmedBookings = count(array_filter($allBookings, fn($b) => $b->getStatus() === 'CONFIRMED'));
        $cancelledBookings = count(array_filter($allBookings, fn($b) => $b->getStatus() === 'CANCELLED'));
        $completedBookings = count(array_filter($allBookings, fn($b) => $b->getStatus() === 'COMPLETED'));
        
        // Calculate revenue from confirmed/completed bookings
        $paidBookings = array_filter($allBookings, fn($b) => $b->getPaymentStatus() === 'PAID');
        $totalRevenue = array_sum(array_map(fn($b) => (float)$b->getTotalPrice(), $paidBookings));
        
        // Payment statistics
        $paidCount = count($paidBookings);
        $pendingPayments = count(array_filter($allBookings, fn($b) => $b->getPaymentStatus() === 'PENDING'));
        $refundedCount = count(array_filter($allBookings, fn($b) => $b->getPaymentStatus() === 'REFUNDED'));

        // Get recent login attempts
        $recentAttempts = $this->loginAttemptRepository->findBy(
            [],
            ['attemptedAt' => 'DESC'],
            10
        );

        // Agent applications
        $allApplications = $this->agentApplicationRepository->findAll();
        $pendingApplications = count(array_filter($allApplications, fn($a) => $a->getStatus() === 'PENDING'));

        return $this->json([
            'users' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'suspendedUsers' => $suspendedUsers,
                'pendingUsers' => $pendingUsers,
                'verifiedUsers' => $verifiedUsers,
                'unverifiedUsers' => $totalUsers - $verifiedUsers,
            ],
            'agents' => [
                'totalAgents' => $totalAgents,
                'activeAgents' => $activeAgents,
            ],
            'bookings' => [
                'totalBookings' => $totalBookings,
                'pendingBookings' => $pendingBookings,
                'confirmedBookings' => $confirmedBookings,
                'cancelledBookings' => $cancelledBookings,
                'completedBookings' => $completedBookings,
            ],
            'payments' => [
                'totalRevenue' => $totalRevenue,
                'paidCount' => $paidCount,
                'pendingPayments' => $pendingPayments,
                'refundedCount' => $refundedCount,
            ],
            'applications' => [
                'pendingApplications' => $pendingApplications,
            ],
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

    /**
     * Get all bookings
     */
    #[Route('/bookings', name: 'admin_bookings_list', methods: ['GET'])]
    public function listBookings(): JsonResponse
    {
        $bookings = $this->bookingRepository->findAll();
        
        $data = [];
        foreach ($bookings as $booking) {
            $destination = $booking->getDestination();
            $user = $booking->getUser();
            $profile = $user->getProfile();
            
            $data[] = [
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
                ],
                'bookingType' => $booking->getBookingType(),
                'checkInDate' => $booking->getCheckInDate()?->format('Y-m-d'),
                'checkOutDate' => $booking->getCheckOutDate()?->format('Y-m-d'),
                'numberOfGuests' => $booking->getNumberOfGuests(),
                'totalPrice' => $booking->getTotalPrice(),
                'status' => $booking->getStatus(),
                'paymentStatus' => $booking->getPaymentStatus(),
                'agent' => $booking->getAgent() ? [
                    'id' => $booking->getAgent()->getId(),
                    'email' => $booking->getAgent()->getEmail(),
                ] : null,
                'createdAt' => $booking->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }
        
        return $this->json(['bookings' => $data]);
    }

    /**
     * Get booking statistics
     */
    #[Route('/bookings/stats', name: 'admin_bookings_stats', methods: ['GET'])]
    public function bookingStats(): JsonResponse
    {
        $totalBookings = $this->bookingRepository->countByStatus('CONFIRMED') + 
                        $this->bookingRepository->countByStatus('PENDING') +
                        $this->bookingRepository->countByStatus('CANCELLED');
        $pendingBookings = $this->bookingRepository->countByStatus('PENDING');
        $confirmedBookings = $this->bookingRepository->countByStatus('CONFIRMED');
        $cancelledBookings = $this->bookingRepository->countByStatus('CANCELLED');
        
        return $this->json([
            'totalBookings' => $totalBookings,
            'pendingBookings' => $pendingBookings,
            'confirmedBookings' => $confirmedBookings,
            'cancelledBookings' => $cancelledBookings,
        ]);
    }

    /**
     * Get all agent applications
     */
    #[Route('/agent-applications', name: 'admin_agent_applications_list', methods: ['GET'])]
    public function listAgentApplications(): JsonResponse
    {
        try {
            $applications = $this->agentApplicationRepository->findAll();
            
            $data = [];
            foreach ($applications as $application) {
                try {
                    $user = $application->getUser();
                    
                    $appData = [
                        'id' => $application->getId(),
                        'email' => $application->getEmail() ?? 'N/A',
                        'firstName' => $application->getFirstName() ?? null,
                        'lastName' => $application->getLastName() ?? null,
                        'phone' => $application->getPhone() ?? null,
                        'companyName' => $application->getCompanyName() ?? null,
                        'licenseNumber' => $application->getLicenseNumber() ?? null,
                        'yearsExperience' => $application->getYearsExperience() ?? null,
                        'specializations' => $application->getSpecializations() ?? [],
                        'motivation' => $application->getMotivation() ?? null,
                        'status' => $application->getStatus() ?? 'PENDING',
                        'adminNotes' => $application->getAdminNotes() ?? null,
                        'reviewedBy' => null,
                        'createdAt' => $application->getCreatedAt() ? $application->getCreatedAt()->format('Y-m-d H:i:s') : null,
                        'reviewedAt' => $application->getReviewedAt() ? $application->getReviewedAt()->format('Y-m-d H:i:s') : null,
                    ];
                    
                    // If reviewed by exists, add reviewer info
                    $reviewedBy = $application->getReviewedBy();
                    if ($reviewedBy) {
                        $appData['reviewedBy'] = [
                            'id' => $reviewedBy->getId(),
                            'email' => $reviewedBy->getEmail(),
                        ];
                    }
                    
                    // If user exists, add user info
                    if ($user) {
                        $profile = $user->getProfile();
                        $appData['user'] = [
                            'id' => $user->getId(),
                            'email' => $user->getEmail(),
                            'firstName' => $profile?->getFirstName(),
                            'lastName' => $profile?->getLastName(),
                        ];
                    }
                    
                    $data[] = $appData;
                } catch (\Exception $e) {
                    // Log error but continue processing other applications
                    error_log('Error serializing agent application ' . $application->getId() . ': ' . $e->getMessage());
                    continue;
                }
            }
            
            return $this->json(['applications' => $data]);
        } catch (\Exception $e) {
            error_log('Error loading agent applications: ' . $e->getMessage());
            return $this->json(['error' => 'Failed to load agent applications', 'applications' => []], 500);
        }
    }

    /**
     * Approve agent application and create user account with temporary password
     */
    #[Route('/agent-applications/{id}/approve', name: 'admin_agent_application_approve', methods: ['POST'])]
    public function approveAgentApplication(int $id, Request $request): JsonResponse
    {
        try {
            $application = $this->agentApplicationRepository->find($id);
            
            if (!$application) {
                return $this->json(['error' => 'Application not found'], 404);
            }

            if ($application->getStatus() !== 'PENDING') {
                return $this->json(['error' => 'Application already reviewed'], 400);
            }

            $email = $application->getEmail();
            
            if (empty($email)) {
                return $this->json(['error' => 'Application email is missing'], 400);
            }
            
            // Check if user already exists
            $user = $this->userRepository->findOneBy(['email' => $email]);
            
            if (!$user) {
                // Create new user account for agent
                $user = new User();
                $user->setEmail($email);
                
                // Generate temporary password (12 characters for better security)
                $temporaryPassword = bin2hex(random_bytes(6)); // 12 character random password
                
                try {
                    $user->setPassword($this->passwordHasher->hashPassword($user, $temporaryPassword));
                } catch (\Exception $e) {
                    error_log('Error hashing password: ' . $e->getMessage());
                    return $this->json([
                        'error' => 'Failed to create user account',
                        'details' => $e->getMessage()
                    ], 500);
                }
                
                // Set agent role and require password change
                $user->setRoles([Roles::USER, Roles::AGENT]);
                $user->setMustChangePassword(true);
                $user->setStatus('ACTIVE');
                $user->setIsVerified(true); // Agents are auto-verified
                
                // Create profile - ensure all required fields are set
                $profile = new UserProfile();
                $firstName = $application->getFirstName();
                $lastName = $application->getLastName();
                $phone = $application->getPhone();
                
                // Provide defaults for required fields - use non-null values
                $profile->setFirstName(!empty($firstName) ? $firstName : 'Agent');
                $profile->setLastName(!empty($lastName) ? $lastName : 'User');
                // Phone can be nullable
                $profile->setPhone(!empty($phone) ? $phone : null);
                
                // Set user relationship BEFORE persisting
                $profile->setUser($user);
                $user->setProfile($profile);
                
                // Create activity
                $activity = new UserActivity();
                $activity->setUser($user);
                $user->setActivity($activity);
                
                // Persist in correct order: user first, then related entities
                try {
                    $this->entityManager->persist($user);
                    $this->entityManager->persist($profile);
                    $this->entityManager->persist($activity);
                } catch (\Exception $e) {
                    error_log('Error persisting user entities: ' . $e->getMessage());
                    error_log('Stack trace: ' . $e->getTraceAsString());
                    return $this->json([
                        'error' => 'Failed to create user account',
                        'details' => $e->getMessage()
                    ], 500);
                }
            } else {
                // User exists, just add agent role and require password change
                $roles = $user->getRoles();
                if (!in_array(Roles::AGENT, $roles, true)) {
                    $roles[] = Roles::AGENT;
                    $user->setRoles($roles);
                }
                $user->setMustChangePassword(true);
                
                // Generate new temporary password
                $temporaryPassword = bin2hex(random_bytes(6));
                try {
                    $user->setPassword($this->passwordHasher->hashPassword($user, $temporaryPassword));
                } catch (\Exception $e) {
                    error_log('Error hashing password: ' . $e->getMessage());
                    return $this->json([
                        'error' => 'Failed to update user password',
                        'details' => $e->getMessage()
                    ], 500);
                }
            }
            
            // Link application to user
            $application->setUser($user);
            
            $adminUser = $this->getUser();
            if ($adminUser instanceof User) {
                $application->setReviewedBy($adminUser);
            }
            
            $data = json_decode($request->getContent(), true);
            if (isset($data['adminNotes'])) {
                $application->setAdminNotes($data['adminNotes']);
            }
            
            // Set status last - this will automatically set reviewedAt if not already set
            $application->setStatus('APPROVED');

            try {
                $this->entityManager->flush();
                
                // Ensure user has an ID (should be set after flush)
                if (!$user->getId()) {
                    error_log('Warning: User ID not available after flush');
                    $this->entityManager->refresh($user);
                }
            } catch (\Doctrine\DBAL\Exception\UniqueConstraintViolationException $e) {
                error_log('Unique constraint violation: ' . $e->getMessage());
                return $this->json([
                    'error' => 'A user with this email already exists',
                    'details' => $e->getMessage()
                ], 409);
            } catch (\Doctrine\DBAL\Exception\NotNullConstraintViolationException $e) {
                error_log('Not null constraint violation: ' . $e->getMessage());
                return $this->json([
                    'error' => 'Required field is missing',
                    'details' => $e->getMessage()
                ], 400);
            } catch (\Exception $e) {
                error_log('Error flushing application update: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
                error_log('User email: ' . $user->getEmail());
                error_log('Application ID: ' . $application->getId());
                return $this->json([
                    'error' => 'Failed to save changes',
                    'details' => $e->getMessage(),
                    'type' => get_class($e)
                ], 500);
            }

            // Send approval email with temporary password
            try {
                $this->emailService->sendAgentApprovalEmail($user, $temporaryPassword);
            } catch (\Exception $e) {
                error_log('Failed to send agent approval email: ' . $e->getMessage());
                // Continue even if email fails, but log it
            }

            return $this->json([
                'message' => 'Agent application approved successfully. Email sent with login credentials.',
                'application' => [
                    'id' => $application->getId(),
                    'status' => $application->getStatus(),
                    'user' => [
                        'id' => $user->getId(),
                        'email' => $user->getEmail(),
                        'isAgent' => true,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            error_log('Unexpected error in approveAgentApplication: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return $this->json([
                'error' => 'An unexpected error occurred',
                'details' => $e->getMessage(),
                'type' => get_class($e)
            ], 500);
        }
    }

    /**
     * Reject agent application
     */
    #[Route('/agent-applications/{id}/reject', name: 'admin_agent_application_reject', methods: ['POST'])]
    public function rejectAgentApplication(int $id, Request $request): JsonResponse
    {
        try {
            $application = $this->agentApplicationRepository->find($id);
            
            if (!$application) {
                return $this->json(['error' => 'Application not found'], 404);
            }

            if ($application->getStatus() !== 'PENDING') {
                return $this->json(['error' => 'Application already reviewed'], 400);
            }

            $data = json_decode($request->getContent(), true);
            $reason = $data['reason'] ?? null;
            
            $adminUser = $this->getUser();
            if ($adminUser instanceof User) {
                $application->setReviewedBy($adminUser);
            }
            
            if ($reason) {
                $application->setAdminNotes($reason);
            }
            
            // Set status last - this will automatically set reviewedAt if not already set
            $application->setStatus('REJECTED');

            try {
                $this->entityManager->flush();
            } catch (\Exception $e) {
                error_log('Error rejecting application: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
                return $this->json([
                    'error' => 'Failed to reject application',
                    'details' => $e->getMessage(),
                    'type' => get_class($e)
                ], 500);
            }

            return $this->json([
                'message' => 'Agent application rejected',
                'application' => [
                    'id' => $application->getId(),
                    'status' => $application->getStatus(),
                ],
            ]);
        } catch (\Exception $e) {
            error_log('Unexpected error in rejectAgentApplication: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return $this->json([
                'error' => 'An unexpected error occurred',
                'details' => $e->getMessage(),
                'type' => get_class($e)
            ], 500);
        }
    }

    /**
     * Get all agents
     */
    #[Route('/agents', name: 'admin_agents_list', methods: ['GET'])]
    public function listAgents(): JsonResponse
    {
        $allUsers = $this->userRepository->findAll();
        $agents = array_filter($allUsers, fn($u) => $u->isAgent());
        
        $data = [];
        foreach ($agents as $agent) {
            $profile = $agent->getProfile();
            $application = $this->agentApplicationRepository->findOneBy(['user' => $agent]);
            
            $data[] = [
                'id' => $agent->getId(),
                'email' => $agent->getEmail(),
                'firstName' => $profile?->getFirstName(),
                'lastName' => $profile?->getLastName(),
                'phone' => $profile?->getPhone(),
                'status' => $agent->getStatus(),
                'isVerified' => $agent->isVerified(),
                'application' => $application ? [
                    'id' => $application->getId(),
                    'companyName' => $application->getCompanyName(),
                    'licenseNumber' => $application->getLicenseNumber(),
                    'yearsExperience' => $application->getYearsExperience(),
                    'specializations' => $application->getSpecializations(),
                    'applicationStatus' => $application->getStatus(),
                ] : null,
                'createdAt' => $agent->getCreatedAt()?->format('Y-m-d H:i:s'),
            ];
        }
        
        return $this->json(['agents' => $data]);
    }

    /**
     * Remove agent status from user
     */
    #[Route('/agents/{id}/remove', name: 'admin_agent_remove', methods: ['POST'])]
    public function removeAgent(int $id): JsonResponse
    {
        $agent = $this->userRepository->find($id);
        
        if (!$agent) {
            return $this->json(['error' => 'User not found'], 404);
        }

        if (!$agent->isAgent()) {
            return $this->json(['error' => 'User is not an agent'], 400);
        }

        $roles = $agent->getRoles();
        $roles = array_filter($roles, fn($r) => $r !== 'ROLE_AGENT');
        $agent->setRoles(array_values($roles));
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Agent status removed successfully',
            'user' => $this->serializeUser($agent),
        ]);
    }
}
