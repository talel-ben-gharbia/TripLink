<?php

namespace App\Controller;

use App\Security\EmailVerifier;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class VerifyEmailController extends AbstractController
{
    #[Route('/verify/email', name: 'app_verify_email')]
    public function verify(Request $request, EmailVerifier $emailVerifier, EntityManagerInterface $em): JsonResponse
    {
        $userId = $request->query->get('id');

        if (!$userId) {
            return new JsonResponse(['error' => 'Missing user id'], 400);
        }

        $user = $em->getRepository(User::class)->find($userId);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        try {
            $emailVerifier->handleEmailConfirmation($request, $user);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 400);
        }

        return new JsonResponse(['message' => 'Email verified successfully!']);
    }
}
