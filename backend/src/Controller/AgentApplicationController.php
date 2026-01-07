<?php

namespace App\Controller;

use App\Entity\AgentApplication;
use App\Entity\User;
use App\Repository\AgentApplicationRepository;
use App\Repository\UserRepository;
use App\Constants\Roles;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/agent')]
class AgentApplicationController extends AbstractController
{
    public function __construct(
        private AgentApplicationRepository $applicationRepository,
        private UserRepository $userRepository,
        private EntityManagerInterface $em
    ) {
    }

    /**
     * Submit agent application (no authentication required)
     */
    #[Route('/apply', name: 'api_agent_apply', methods: ['POST'])]
    public function apply(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if ($data === null) {
                return $this->json(['error' => 'Invalid JSON data'], 400);
            }

            if (empty($data['email'])) {
                return $this->json(['error' => 'Email is required'], 400);
            }

            $email = trim(strtolower($data['email']));

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->json(['error' => 'Invalid email format'], 400);
            }

            // Check if email already has pending application
            try {
                $existingApplication = $this->applicationRepository->findByEmail($email);
                if ($existingApplication) {
                    if ($existingApplication->isPending()) {
                        return $this->json(['error' => 'You already have a pending application'], 400);
                    }
                    if ($existingApplication->isApproved()) {
                        return $this->json(['error' => 'You are already an approved agent'], 400);
                    }
                }
            } catch (\Exception $e) {
                error_log('Error checking existing application: ' . $e->getMessage());
                return $this->json(['error' => 'Failed to check existing applications'], 500);
            }

            // Check if user with this email already exists and is an agent
            try {
                $existingUser = $this->userRepository->findOneBy(['email' => $email]);
                if ($existingUser && $existingUser->isAgent()) {
                    return $this->json(['error' => 'An agent account already exists with this email'], 400);
                }
            } catch (\Exception $e) {
                error_log('Error checking existing user: ' . $e->getMessage());
                return $this->json(['error' => 'Failed to check existing users'], 500);
            }

            try {
                $application = new AgentApplication();
                $application->setEmail($email);
                $application->setFirstName(!empty($data['firstName']) ? trim($data['firstName']) : null);
                $application->setLastName(!empty($data['lastName']) ? trim($data['lastName']) : null);
                $application->setPhone(!empty($data['phone']) ? trim($data['phone']) : null);
                $application->setCompanyName(!empty($data['companyName']) ? trim($data['companyName']) : null);
                $application->setLicenseNumber(!empty($data['licenseNumber']) ? trim($data['licenseNumber']) : null);
                
                // Validate and set years of experience
                if (isset($data['yearsExperience']) && $data['yearsExperience'] !== '' && $data['yearsExperience'] !== null) {
                    $years = filter_var($data['yearsExperience'], FILTER_VALIDATE_INT, [
                        'options' => ['min_range' => 0, 'max_range' => 50]
                    ]);
                    if ($years === false) {
                        return $this->json(['error' => 'Years of experience must be a number between 0 and 50'], 400);
                    }
                    $application->setYearsExperience($years);
                } else {
                    $application->setYearsExperience(null);
                }
                
                // Validate and set specializations
                if (!empty($data['specializations']) && is_array($data['specializations'])) {
                    $application->setSpecializations(array_filter($data['specializations'])); // Remove empty values
                } else {
                    $application->setSpecializations(null);
                }
                
                $application->setMotivation(!empty($data['motivation']) ? trim($data['motivation']) : null);
                $application->setStatus('PENDING');

                // If user exists, link the application
                if ($existingUser) {
                    $application->setUser($existingUser);
                }

                $this->em->persist($application);
                $this->em->flush();

                return $this->json([
                    'message' => 'Application submitted successfully. It will be reviewed by an administrator.',
                    'application' => $this->serializeApplication($application)
                ], 201);
            } catch (\Exception $e) {
                error_log('Error creating agent application: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
                return $this->json(['error' => 'Failed to submit application. Please try again.'], 500);
            }
        } catch (\Exception $e) {
            error_log('Unexpected error in agent application: ' . $e->getMessage());
            return $this->json(['error' => 'An unexpected error occurred. Please try again.'], 500);
        }
    }

    /**
     * Get user's application status
     */
    #[Route('/application', name: 'api_agent_application_status', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getApplicationStatus(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        // Try to find by user ID first, then by email
        $application = $this->applicationRepository->findByUserOrEmail(
            $user->getId(),
            $user->getEmail()
        );

        if (!$application) {
            return $this->json(['hasApplication' => false]);
        }

        return $this->json([
            'hasApplication' => true,
            'application' => $this->serializeApplication($application)
        ]);
    }

    /**
     * List all pending applications (Admin only)
     */
    #[Route('/applications', name: 'api_agent_applications_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listApplications(): JsonResponse
    {
        $applications = $this->applicationRepository->findPending();

        return $this->json([
            'applications' => array_map([$this, 'serializeApplication'], $applications)
        ]);
    }

    /**
     * Approve agent application (Admin only)
     */
    #[Route('/applications/{id}/approve', name: 'api_agent_application_approve', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function approveApplication(int $id, Request $request): JsonResponse
    {
        $admin = $this->getUser();
        if (!$admin instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $application = $this->applicationRepository->find($id);
        
        if (!$application) {
            return $this->json(['error' => 'Application not found'], 404);
        }

        if (!$application->isPending()) {
            return $this->json(['error' => 'Application is not pending'], 400);
        }

        $data = json_decode($request->getContent(), true);
        $adminNotes = $data['adminNotes'] ?? null;

        // Approve application
        $application->setStatus('APPROVED');
        $application->setReviewedBy($admin);
        $application->setAdminNotes($adminNotes);

        // Grant agent role to user (if user exists)
        $user = $application->getUser();
        if ($user) {
            $roles = $user->getRoles();
            if (!in_array(Roles::AGENT, $roles, true)) {
                $roles[] = Roles::AGENT;
                $user->setRoles($roles);
            }
        } else {
            // This endpoint should not be used for new applications
            // Admin should use /api/admin/agent-applications/{id}/approve instead
            return $this->json(['error' => 'Application does not have a user account. Please use admin approval endpoint.'], 400);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Application approved successfully',
            'application' => $this->serializeApplication($application)
        ]);
    }

    /**
     * Reject agent application (Admin only)
     */
    #[Route('/applications/{id}/reject', name: 'api_agent_application_reject', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function rejectApplication(int $id, Request $request): JsonResponse
    {
        $admin = $this->getUser();
        if (!$admin instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $application = $this->applicationRepository->find($id);
        
        if (!$application) {
            return $this->json(['error' => 'Application not found'], 404);
        }

        if (!$application->isPending()) {
            return $this->json(['error' => 'Application is not pending'], 400);
        }

        $data = json_decode($request->getContent(), true);
        $adminNotes = $data['adminNotes'] ?? null;
        $reason = $data['reason'] ?? 'Application rejected';

        // Reject application
        $application->setStatus('REJECTED');
        $application->setReviewedBy($admin);
        $application->setAdminNotes($adminNotes ?: $reason);

        $this->em->flush();

        return $this->json([
            'message' => 'Application rejected',
            'application' => $this->serializeApplication($application)
        ]);
    }

    private function serializeApplication(AgentApplication $application): array
    {
        $user = $application->getUser();
        
        $data = [
            'id' => $application->getId(),
            'email' => $application->getEmail(),
            'firstName' => $application->getFirstName(),
            'lastName' => $application->getLastName(),
            'phone' => $application->getPhone(),
            'companyName' => $application->getCompanyName(),
            'licenseNumber' => $application->getLicenseNumber(),
            'yearsExperience' => $application->getYearsExperience(),
            'specializations' => $application->getSpecializations(),
            'motivation' => $application->getMotivation(),
            'status' => $application->getStatus(),
            'adminNotes' => $application->getAdminNotes(),
            'reviewedBy' => $application->getReviewedBy() ? [
                'id' => $application->getReviewedBy()->getId(),
                'email' => $application->getReviewedBy()->getEmail(),
            ] : null,
            'createdAt' => $application->getCreatedAt()->format('Y-m-d H:i:s'),
            'reviewedAt' => $application->getReviewedAt()?->format('Y-m-d H:i:s'),
        ];
        
        // If user exists, add user info
        if ($user) {
            $profile = $user->getProfile();
            $data['user'] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $profile?->getFirstName(),
                'lastName' => $profile?->getLastName(),
            ];
        }
        
        return $data;
    }
}

