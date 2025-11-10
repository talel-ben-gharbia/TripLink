<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Controller for user profile endpoints
 */
class ProfileController extends AbstractController
{
    /**
     * Get current user's profile
     *
     * @return JsonResponse
     */
    #[Route('/api/profile', name: 'api_profile_get', methods: ['GET'])]
    public function getProfile(): JsonResponse
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
                'phone' => $profile?->getPhone(),
                'profileImage' => $profile?->getAvatar(),
                'travelStyles' => $preferences?->getTravelStyles(),
                'interests' => $preferences?->getInterests(),
                'personalityAxis' => $preferences?->getPersonalityAxis(),
                'preferenceCategories' => $preferences?->getPreferenceCategories(),
            ]
        ]);
    }

    /**
     * Update user profile
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/api/profile', name: 'api_profile_update', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $preferences = $user->getPreferences();
        $profile = $user->getProfile();

        if (!$preferences) {
            $preferences = new \App\Entity\UserPreferences();
            $preferences->setUser($user);
            $user->setPreferences($preferences);
            $em->persist($preferences);
        }

        if (isset($data['personalityAxis'])) {
            $preferences->setPersonalityAxis($data['personalityAxis']);
        }

        if (isset($data['preferenceCategories'])) {
            $preferences->setPreferenceCategories($data['preferenceCategories']);
        }

        if (isset($data['travelStyles'])) {
            $preferences->setTravelStyles($data['travelStyles']);
        }

        if (isset($data['interests'])) {
            $preferences->setInterests($data['interests']);
        }

        if (isset($data['firstName']) && $profile) {
            $profile->setFirstName($data['firstName']);
        }

        if (isset($data['lastName']) && $profile) {
            $profile->setLastName($data['lastName']);
        }

        if (isset($data['phone']) && $profile) {
            $profile->setPhone($data['phone']);
        }

        $em->flush();

        return new JsonResponse([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $profile?->getFirstName(),
                'lastName' => $profile?->getLastName(),
                'phone' => $profile?->getPhone(),
                'profileImage' => $profile?->getAvatar(),
                'travelStyles' => $preferences->getTravelStyles(),
                'interests' => $preferences->getInterests(),
                'personalityAxis' => $preferences->getPersonalityAxis(),
                'preferenceCategories' => $preferences->getPreferenceCategories(),
            ]
        ]);
    }

    /**
     * Upload or update profile avatar
     *
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/api/profile/avatar', name: 'api_profile_avatar', methods: ['POST'])]
    public function uploadAvatar(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user || !$user instanceof \App\Entity\User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $file = $request->files->get('avatar');
        if (!$file) {
            return new JsonResponse(['error' => 'No avatar file provided'], 400);
        }

        // Basic validation
        $allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMime, true)) {
            return new JsonResponse(['error' => 'Invalid file type'], 400);
        }
        if ($file->getSize() > 5 * 1024 * 1024) { // 5MB
            return new JsonResponse(['error' => 'File too large'], 400);
        }

        $uploadDir = $this->getParameter('profiles_directory');
        $safeName = uniqid('avatar_', true) . '.' . $file->guessExtension();
        try {
            $file->move($uploadDir, $safeName);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Failed to save file'], 500);
        }

        $profile = $user->getProfile();
        if (!$profile) {
            $profile = new \App\Entity\UserProfile();
            $profile->setUser($user);
            $user->setProfile($profile);
            $em->persist($profile);
        }

        // Assuming frontend can resolve this path; adjust if a CDN/base URL is used
        $profile->setAvatar($safeName);
        $em->flush();

        return new JsonResponse([
            'message' => 'Avatar updated successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $profile?->getFirstName(),
                'lastName' => $profile?->getLastName(),
                'phone' => $profile?->getPhone(),
                'profileImage' => $profile?->getAvatar(),
            ]
        ], 200);
    }
}

