<?php

namespace App\Controller;

use App\Entity\User;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request, 
        UserPasswordHasherInterface $passwordHasher, 
        EntityManagerInterface $em,
        EmailVerifier $emailVerifier
    ): JsonResponse {
        
        $email = $request->get("email");
        $password = $request->get("password");
        $firstName = $request->get("firstName");
        $lastName = $request->get("lastName");
        $phone = $request->get("phone");
        $travelStyles = json_decode($request->get("travelStyles"), true) ?? [];
        $interests = json_decode($request->get("interests"), true) ?? [];
        $file = $request->files->get("profileImage");

        if (!$email || !$password) {
            return new JsonResponse(["message" => "Missing fields"], 400);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $user->setFirstName($firstName);
        $user->setLastName($lastName);
        $user->setPhone($phone);
        $user->setTravelStyles($travelStyles);
        $user->setInterests($interests);
        $user->setRoles(["ROLE_USER"]);

        if ($file) {
            $fileName = uniqid().'.'.$file->guessExtension();
            $file->move($this->getParameter('profiles_directory'), $fileName);
            $user->setProfileImage($fileName);
        }

        $em->persist($user);
        $em->flush();

        // ✅ Send email pointing to Symfony backend route
        $emailVerifier->sendEmailConfirmation('app_verify_email', $user);

        return new JsonResponse(["message" => "User registered successfully"], 201);
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
    Request $request,
    UserPasswordHasherInterface $passwordHasher,
    EntityManagerInterface $em,
    JWTTokenManagerInterface $jwtManager
    ): JsonResponse {
    $data = json_decode($request->getContent(), true);

    if (!$data || !isset($data['email'], $data['password'])) {
        return new JsonResponse(['error' => 'Email and password are required'], 400);
    }

    $email = $data['email'];
    $password = $data['password'];

    $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);
    if (!$user) {
        return new JsonResponse(['error' => 'User not found'], 404);
    }

    if (!$passwordHasher->isPasswordValid($user, $password)) {
        return new JsonResponse(['error' => 'Invalid credentials'], 401);
    }

    if (!method_exists($user, 'isVerified') || !$user->isVerified()) {
        return new JsonResponse(['error' => 'Email not verified'], 403);
    }

    try {
        $token = $jwtManager->create($user);
    } catch (\Exception $e) {
        return new JsonResponse(['error' => 'Could not generate token'], 500);
    }

    return new JsonResponse([
        'token' => $token,
        'user' => [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'roles' => $user->getRoles(),
        ]
    ]);
}

}
