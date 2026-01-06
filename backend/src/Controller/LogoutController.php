<?php

namespace App\Controller;

use App\Entity\BlacklistedToken;
use App\Entity\User;
use App\Repository\BlacklistedTokenRepository;
use App\Repository\AuthSessionRepository;
use Symfony\Component\HttpFoundation\Cookie;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Controller for logout endpoints
 */
class LogoutController extends AbstractController
{
    /**
     * Logout user (blacklist current token)
     *
     * @param Request $request
     * @param BlacklistedTokenRepository $blacklistRepo
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(
        Request $request,
        BlacklistedTokenRepository $blacklistRepo,
        AuthSessionRepository $sessionRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        
        // Admin users don't need token blacklisting or session cleanup
        if ($user && $user instanceof User && !$user->isAdmin()) {
            $authHeader = $request->headers->get('Authorization');
            
            if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
                
                // Check if token is already blacklisted
                if (!$blacklistRepo->isTokenBlacklisted($token)) {
                    // Blacklist the token
                    $blacklistedToken = new BlacklistedToken();
                    $blacklistedToken->setUser($user);
                    $blacklistedToken->setToken($token);
                    $blacklistedToken->setBlacklistedAt(new \DateTimeImmutable());
                    // Token expires in 1 hour (matching JWT TTL)
                    $blacklistedToken->setExpiresAt(new \DateTimeImmutable('+1 hour'));
                    
                    $em->persist($blacklistedToken);
                    $em->flush();
                }

                // Remove the DB session row associated with this JWT
                $session = $sessionRepo->findValidSessionByToken($token);
                if ($session) {
                    $em->remove($session);
                    $em->flush();
                }
            }
        }
        
        // Build response and clear cookies if present
        $response = new JsonResponse(['message' => 'Logged out successfully'], 200);
        // Expire refreshToken and sessionId cookies client-side
        $expired = time() - 3600;
        $response->headers->setCookie(new Cookie('refreshToken', '', $expired, '/', null, true, true, false, 'None'));
        $response->headers->setCookie(new Cookie('sessionId', '', $expired, '/', null, true, true, false, 'None'));
        return $response;
    }

    /**
     * Logout from all devices (invalidate all tokens)
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/api/logout-all', name: 'api_logout_all', methods: ['POST'])]
    public function logoutAll(
        Request $request,
        AuthSessionRepository $sessionRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }
        
        // Admin users don't need session/token management
        if (!$user->isAdmin()) {
            // Increment token version to invalidate all tokens
            $user->setTokenVersion($user->getTokenVersion() + 1);
            
            $authHeader = $request->headers->get('Authorization');
            if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
                
                // Blacklist the current token
                $blacklistedToken = new BlacklistedToken();
                $blacklistedToken->setUser($user);
                $blacklistedToken->setToken($token);
                $blacklistedToken->setBlacklistedAt(new \DateTimeImmutable());
                $blacklistedToken->setExpiresAt(new \DateTimeImmutable('+1 hour'));
                
                $em->persist($blacklistedToken);
            }
            
            // Remove all auth_session rows for this user
            $sessions = $sessionRepo->findBy(['user' => $user]);
            foreach ($sessions as $s) {
                $em->remove($s);
            }
            $em->flush();
        }

        // Clear cookies client-side
        $response = new JsonResponse([
            'message' => 'Logged out of all devices successfully. Please login again to continue.'
        ], 200);
        $expired = time() - 3600;
        $response->headers->setCookie(new Cookie('refreshToken', '', $expired, '/', null, true, true, false, 'None'));
        $response->headers->setCookie(new Cookie('sessionId', '', $expired, '/', null, true, true, false, 'None'));
        return $response;
    }
}

