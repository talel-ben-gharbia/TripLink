<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\BlacklistedTokenRepository;
use App\Service\AuthService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

/**
 * Controller for authentication endpoints
 */
class AuthController extends AbstractController
{
    /**
     * Register a new user
     *
     * @param Request $request
     * @param AuthService $authService
     * @return JsonResponse
     */
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        AuthService $authService
    ): JsonResponse {
        try {
            $email = $request->get("email");
            $password = $request->get("password");
            $firstName = $request->get("firstName");
            $lastName = $request->get("lastName");
            $phone = $request->get("phone");
            $travelStyles = json_decode($request->get("travelStyles"), true) ?? [];
            $interests = json_decode($request->get("interests"), true) ?? [];
            $file = $request->files->get("profileImage");

            $data = [
                'email' => $email,
                'password' => $password,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'phone' => $phone,
                'travelStyles' => $travelStyles,
                'interests' => $interests,
            ];

            $result = $authService->registerUser(
                $data,
                $file,
                $this->getParameter('profiles_directory')
            );

            if (!$result['success']) {
                return new JsonResponse([
                    'error' => 'Validation failed',
                    'errors' => $result['errors']
                ], 400);
            }

            return new JsonResponse([
                'message' => 'User registered successfully. Please check your email to verify your account.'
            ], 201);
        } catch (\Exception $e) {
            error_log('Registration error: ' . $e->getMessage());
            return new JsonResponse([
                'error' => 'Registration failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user and return JWT token
     *
     * @param Request $request
     * @param AuthService $authService
     * @return JsonResponse
     */
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        AuthService $authService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'])) {
            return new JsonResponse([
                'error' => 'Email and password are required'
            ], 400);
        }

        $result = $authService->authenticateUser(
            $data['email'],
            $data['password'],
            $request->getClientIp()
        );

        if (!$result['success']) {
            $statusCode = str_contains($result['errors'][0] ?? '', 'Too many') ? 429 : 401;
            return new JsonResponse([
                'error' => $result['errors'][0] ?? 'Authentication failed',
                'errors' => $result['errors']
            ], $statusCode);
        }

        $profile = $result['user']->getProfile();
        $user = $result['user'];
        $response = new JsonResponse([
            'token' => $result['token'],
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $profile?->getFirstName(),
                'lastName' => $profile?->getLastName(),
                'roles' => $user->getRoles(),
                'isVerified' => $user->isVerified(),
                'isAdmin' => $user->isAdmin(),
                'isAgent' => $user->isAgent(),
                'mustChangePassword' => $user->mustChangePassword(),
            ]
        ]);
        // Set refresh-token cookie (7 days, HttpOnly; SameSite=None for dev across ports)
        $response->headers->setCookie(
            new \Symfony\Component\HttpFoundation\Cookie(
                'refreshToken',
                $result['refreshToken'],
                time() + 3600 * 24 * 7,
                '/',
                null,
                false,   // secure (use true in production with HTTPS)
                true,   // httponly
                false,
                'None'
            )
        );
        // Also set sessionId cookie to map client to DB session
        $response->headers->setCookie(
            new \Symfony\Component\HttpFoundation\Cookie(
                'sessionId',
                $result['sessionId'] ?? '',
                time() + 3600 * 24 * 7,
                '/',
                null,
                false,   // secure in production
                true,
                false,
                'None'
            )
        );
        return $response;
    }

    /**
     * Refresh JWT token
     *
     * @param Request $request
     * @param AuthService $authService
     * @param BlacklistedTokenRepository $blacklistRepo
     * @return JsonResponse
     */
    #[Route('/api/refresh-token', name: 'api_refresh_token', methods: ['POST'])]
    public function refreshToken(
        Request $request,
        AuthService $authService,
        BlacklistedTokenRepository $blacklistRepo,
        \App\Repository\AuthSessionRepository $sessionRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        // Read refresh token from HttpOnly cookie
        $refreshToken = $request->cookies->get('refreshToken');
        if (!$refreshToken) {
            return new JsonResponse(['error' => 'Refresh token required'], 401);
        }
        $sessionId = $request->cookies->get('sessionId');
        if (!$sessionId) {
            return new JsonResponse(['error' => 'Session ID required'], 401);
        }

        // Verify the current access token (sent in header) is not blacklisted
        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return new JsonResponse(['error' => 'Access token required'], 401);
        }
        $accessToken = $matches[1];
        if ($blacklistRepo->isTokenBlacklisted($accessToken)) {
            return new JsonResponse(['error' => 'Access token revoked'], 401);
        }

        $user = $this->getUser();
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Invalid user'], 401);
        }

        // Validate session against DB
        $session = $sessionRepo->findBySessionId($sessionId);
        if (!$session || $session->getUser()?->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Invalid session'], 401);
        }
        if ($session->getRefreshToken() !== $refreshToken || !$session->isValid()) {
            return new JsonResponse(['error' => 'Invalid or expired session'], 401);
        }

        // Issue new short-lived access token
        try {
            $newToken = $authService->refreshToken($user);
            // Update session with new token and extended expiry
            $session->setJwtToken($newToken);
            $session->setExpiresAt(new \DateTimeImmutable('+1 hour'));
            $em->persist($session);
            $em->flush();
            return new JsonResponse([
                'token' => $newToken,
                'message' => 'Token refreshed successfully'
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Could not refresh token',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint to verify backend is running
     *
     * @return JsonResponse
     */
    #[Route('/api/test', name: 'api_test', methods: ['GET'])]
    public function test(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok',
            'message' => 'Backend is running',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Get current authenticated user
     *
     * @return JsonResponse
     */
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $profile = $user->getProfile();
        $preferences = $user->getPreferences();
        
        return new JsonResponse([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $profile?->getFirstName(),
                'lastName' => $profile?->getLastName(),
                'roles' => $user->getRoles(),
                'isVerified' => $user->isVerified(),
                'status' => $user->getStatus(),
                'isAdmin' => $user->isAdmin(),
                'isAgent' => $user->isAgent(), // Phase 0: Add agent check for frontend
                // Phase 1: Onboarding status
                'needsOnboarding' => !$preferences || !$preferences->isOnboardingCompleted(),
            ]
        ]);
    }
}
