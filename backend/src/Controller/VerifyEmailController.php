<?php

namespace App\Controller;

use App\Security\EmailVerifier;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

/**
 * Controller for email verification
 */
class VerifyEmailController extends AbstractController
{
    /**
     * Verify user email
     *
     * @param Request $request
     * @param EmailVerifier $emailVerifier
     * @param EntityManagerInterface $em
     * @param ParameterBagInterface $params
     * @return RedirectResponse
     */
    #[Route('/verify/email', name: 'app_verify_email')]
    public function verifyUserEmail(
        Request $request,
        EmailVerifier $emailVerifier,
        EntityManagerInterface $em,
        ParameterBagInterface $params
    ): RedirectResponse {
        $frontendUrl = ($params->has('app.frontend_url') && !empty($params->get('app.frontend_url'))) 
            ? $params->get('app.frontend_url') 
            : ($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000');
        $id = $request->query->get('id');

        if (!$id) {
            return new RedirectResponse(
                $frontendUrl . '/email-verification?status=error&message=' . urlencode('Missing user ID')
            );
        }

        $user = $em->getRepository(User::class)->find($id);

        if (!$user) {
            return new RedirectResponse(
                $frontendUrl . '/email-verification?status=error&message=' . urlencode('User not found')
            );
        }

        try {
            $emailVerifier->handleEmailConfirmation($request, $user);

            // Update user status to ACTIVE after verification
            if ($user->getStatus() === 'PENDING') {
                $user->setStatus('ACTIVE');
                $em->flush();
            }

            return new RedirectResponse($frontendUrl . '/email-verification?status=success');
        } catch (\SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface $e) {
            return new RedirectResponse(
                $frontendUrl . '/email-verification?status=error&message=' . urlencode($e->getReason())
            );
        } catch (\Exception $e) {
            return new RedirectResponse(
                $frontendUrl . '/email-verification?status=error&message=' . urlencode($e->getMessage())
            );
        }
    }

    /**
     * Resend verification email
     *
     * @param Request $request
     * @param EmailVerifier $emailVerifier
     * @param EntityManagerInterface $em
     * @param ParameterBagInterface $params
     * @return JsonResponse
     */
    #[Route('/api/resend-verification', name: 'api_resend_verification', methods: ['POST'])]
    public function resendVerificationEmail(
        Request $request,
        EmailVerifier $emailVerifier,
        EntityManagerInterface $em,
        ParameterBagInterface $params
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);
        } catch (\Exception $e) {
            $data = [];
        }
        $email = $data['email'] ?? null;

        if (!$email) {
            return new JsonResponse(['error' => 'Email is required'], 400);
        }

        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            // Don't reveal if email exists for security
            return new JsonResponse([
                'message' => 'If the email exists, a verification link has been sent.'
            ], 200);
        }

        if ($user->isVerified()) {
            return new JsonResponse([
                'message' => 'Email is already verified.'
            ], 200);
        }

        try {
            $emailVerifier->sendEmailConfirmation('app_verify_email', $user);
            return new JsonResponse([
                'message' => 'Verification email sent successfully. Please check your inbox.'
            ], 200);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to send verification email. Please try again later.'
            ], 500);
        }
    }
}
