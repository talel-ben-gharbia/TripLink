<?php

namespace App\Controller;

use App\Entity\ResetPasswordRequest;
use App\Repository\ResetPasswordRequestRepository;
use App\Service\EmailService;
use App\Service\ValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Controller for password reset endpoints
 */
class PasswordResetController extends AbstractController
{
    /**
     * Request password reset
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @param EmailService $emailService
     * @return JsonResponse
     */
    #[Route('/api/forgot-password', name: 'api_forgot_password', methods: ['POST'])]
    public function forgotPassword(
        Request $request,
        EntityManagerInterface $em,
        EmailService $emailService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'])) {
            return new JsonResponse(['error' => 'Email is required'], 400);
        }

        $user = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => $data['email']]);

        if (!$user) {
            // Don't reveal if email exists for security
            return new JsonResponse([
                'message' => 'If the email exists, a password reset link has been sent.'
            ], 200);
        }

        // Generate token
        $token = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable('+1 hour');

        // Invalidate old requests
        $oldRequests = $em->getRepository(ResetPasswordRequest::class)
            ->createQueryBuilder('r')
            ->where('r.user = :user')
            ->andWhere('r.used = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();

        foreach ($oldRequests as $oldRequest) {
            $oldRequest->setUsed(true);
        }

        // Create new request
        $resetRequest = new ResetPasswordRequest();
        $resetRequest->setUser($user);
        $resetRequest->setToken($token);
        $resetRequest->setExpiresAt($expiresAt);
        $resetRequest->setUsed(false);

        $em->persist($resetRequest);
        $em->flush();

        // Send password reset email
        $emailService->sendPasswordResetEmail($user, $token);

        return new JsonResponse([
            'message' => 'If the email exists, a password reset link has been sent.'
        ], 200);
    }

    /**
     * Reset password with token
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @param ResetPasswordRequestRepository $resetRepo
     * @param UserPasswordHasherInterface $passwordHasher
     * @param ValidationService $validationService
     * @param EmailService $emailService
     * @return JsonResponse
     */
    #[Route('/api/reset-password', name: 'app_reset_password', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        EntityManagerInterface $em,
        ResetPasswordRequestRepository $resetRepo,
        UserPasswordHasherInterface $passwordHasher,
        ValidationService $validationService,
        EmailService $emailService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['token']) || !isset($data['password'])) {
            return new JsonResponse(['error' => 'Token and password are required'], 400);
        }

        $resetRequest = $resetRepo->findValidToken($data['token']);

        if (!$resetRequest) {
            return new JsonResponse(['error' => 'Invalid or expired token'], 400);
        }

        $user = $resetRequest->getUser();

        // Validate password
        $passwordValidation = $validationService->validatePassword($data['password']);
        if (!$passwordValidation['valid']) {
            return new JsonResponse([
                'error' => 'Password validation failed',
                'errors' => $passwordValidation['errors']
            ], 400);
        }

        // Update password
        $user->setPassword($passwordHasher->hashPassword($user, $data['password']));

        // Bump token version to invalidate all existing tokens
        $user->setTokenVersion($user->getTokenVersion() + 1);

        // Mark request as used
        $resetRequest->setUsed(true);

        $em->flush();

        // Send confirmation email
        $emailService->sendPasswordChangedEmail($user);

        return new JsonResponse(['message' => 'Password reset successfully'], 200);
    }
}
