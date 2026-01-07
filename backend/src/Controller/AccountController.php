<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\EmailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Controller for account management endpoints
 */
class AccountController extends AbstractController
{
    /**
     * Delete user account (anonymize data for GDPR compliance)
     *
     * @param Request $request
     * @param UserPasswordHasherInterface $passwordHasher
     * @param EntityManagerInterface $em
     * @param EmailService $emailService
     * @return JsonResponse
     */
    #[Route('/api/account/delete', name: 'api_account_delete', methods: ['POST'])]
    public function deleteAccount(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
        EmailService $emailService
    ): JsonResponse {
        $user = $this->getUser();
        
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['password'])) {
            return new JsonResponse(['error' => 'Password confirmation is required'], 400);
        }

        // Verify password
        if (!$passwordHasher->isPasswordValid($user, $data['password'])) {
            return new JsonResponse(['error' => 'Invalid password'], 401);
        }

        // Send account deletion email before anonymizing data
        $emailService->sendAccountDeletionEmail($user);

        // Anonymize user data (GDPR compliance)
        $user->setEmail('deleted_' . $user->getId() . '_' . time() . '@deleted.local');
        $user->setRoles([]);
        $user->setStatus('DELETED');
        
        // Anonymize profile
        $profile = $user->getProfile();
        if ($profile) {
            $profile->setFirstName('Deleted');
            $profile->setLastName('User');
            $profile->setPhone('');
            $profile->setAvatar(null);
        }
        
        // Anonymize preferences
        $preferences = $user->getPreferences();
        if ($preferences) {
            $preferences->setTravelStyles([]);
            $preferences->setInterests([]);
            $preferences->setPersonalityAxis(null);
            $preferences->setPreferenceCategories(null);
        }
        
        // Invalidate password
        $user->setPassword('$2y$13$' . bin2hex(random_bytes(32))); // Random hash that won't match anything

        $em->flush();

        return new JsonResponse([
            'message' => 'Account deleted successfully. All your data has been anonymized.'
        ], 200);
    }

    /**
     * Change password (authenticated user)
     *
     * @param Request $request
     * @param UserPasswordHasherInterface $passwordHasher
     * @param EntityManagerInterface $em
     * @param EmailService $emailService
     * @param \App\Service\ValidationService $validationService
     * @return JsonResponse
     */
    #[Route('/api/account/change-password', name: 'api_account_change_password', methods: ['POST'])]
    public function changePassword(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
        EmailService $emailService,
        \App\Service\ValidationService $validationService
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['currentPassword'], $data['newPassword'])) {
            return new JsonResponse(['error' => 'Current and new password are required'], 400);
        }

        // Verify current password
        if (!$passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
            return new JsonResponse(['error' => 'Invalid current password'], 401);
        }

        // Validate new password
        $passwordValidation = $validationService->validatePassword($data['newPassword']);
        if (!$passwordValidation['valid']) {
            return new JsonResponse([
                'error' => 'Password validation failed',
                'errors' => $passwordValidation['errors']
            ], 400);
        }

        // Update password
        $user->setPassword($passwordHasher->hashPassword($user, $data['newPassword']));
        // Invalidate old tokens
        $user->setTokenVersion($user->getTokenVersion() + 1);

        $em->flush();

        // Notify user
        $emailService->sendPasswordChangedEmail($user);

        return new JsonResponse(['message' => 'Password changed successfully'], 200);
    }

    /**
     * Force password change (for agents who must change password on first login)
     *
     * @param Request $request
     * @param UserPasswordHasherInterface $passwordHasher
     * @param EntityManagerInterface $em
     * @param EmailService $emailService
     * @param \App\Service\ValidationService $validationService
     * @return JsonResponse
     */
    #[Route('/api/account/force-change-password', name: 'api_account_force_change_password', methods: ['POST'])]
    public function forceChangePassword(
        Request $request,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
        EmailService $emailService,
        \App\Service\ValidationService $validationService
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        if (!$user->mustChangePassword()) {
            return new JsonResponse(['error' => 'Password change is not required'], 400);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['newPassword'])) {
            return new JsonResponse(['error' => 'New password is required'], 400);
        }

        // Validate new password
        $passwordValidation = $validationService->validatePassword($data['newPassword']);
        if (!$passwordValidation['valid']) {
            return new JsonResponse([
                'error' => 'Password validation failed',
                'errors' => $passwordValidation['errors']
            ], 400);
        }

        // Update password and clear mustChangePassword flag
        $user->setPassword($passwordHasher->hashPassword($user, $data['newPassword']));
        $user->setMustChangePassword(false);
        // Invalidate old tokens
        $user->setTokenVersion($user->getTokenVersion() + 1);

        $em->flush();

        // Notify user
        $emailService->sendPasswordChangedEmail($user);

        return new JsonResponse(['message' => 'Password changed successfully'], 200);
    }
}

