<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Phase 1: Onboarding flow controller
 * 
 * Handles first-login onboarding with preference selection
 */
#[Route('/api/onboarding')]
class OnboardingController extends AbstractController
{
    /**
     * Check if user needs onboarding
     */
    #[Route('/status', name: 'api_onboarding_status', methods: ['GET'])]
    public function status(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $preferences = $user->getPreferences();
        $needsOnboarding = !$preferences || !$preferences->isOnboardingCompleted();

        return new JsonResponse([
            'needsOnboarding' => $needsOnboarding,
            'onboardingCompleted' => $preferences?->isOnboardingCompleted() ?? false,
        ]);
    }

    /**
     * Complete onboarding with preference selection
     */
    #[Route('/complete', name: 'api_onboarding_complete', methods: ['POST'])]
    public function complete(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        
        // Get or create preferences
        $preferences = $user->getPreferences();
        if (!$preferences) {
            $preferences = new \App\Entity\UserPreferences();
            $preferences->setUser($user);
            $user->setPreferences($preferences);
            $em->persist($preferences);
        }

        // Update preferences from onboarding data
        if (isset($data['travelStyles'])) {
            $preferences->setTravelStyles($data['travelStyles']);
        }
        if (isset($data['interests'])) {
            $preferences->setInterests($data['interests']);
        }
        if (isset($data['budgetRange'])) {
            $preferences->setBudgetRange($data['budgetRange']);
        }
        if (isset($data['personalityAxis'])) {
            $preferences->setPersonalityAxis($data['personalityAxis']);
        }
        if (isset($data['preferenceCategories'])) {
            $preferences->setPreferenceCategories($data['preferenceCategories']);
        }

        // Mark onboarding as completed
        $preferences->setOnboardingCompleted(true);
        
        // Recalculate profile completion
        $preferences->calculateCompletion();

        $em->flush();

        return new JsonResponse([
            'message' => 'Onboarding completed successfully',
            'onboardingCompleted' => true,
            'profileCompletion' => $preferences->getProfileCompletion(),
        ]);
    }

    /**
     * Skip onboarding (user can skip and complete later)
     */
    #[Route('/skip', name: 'api_onboarding_skip', methods: ['POST'])]
    public function skip(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user || !$user instanceof User) {
            return new JsonResponse(['error' => 'Not authenticated'], 401);
        }

        $preferences = $user->getPreferences();
        if (!$preferences) {
            $preferences = new \App\Entity\UserPreferences();
            $preferences->setUser($user);
            $user->setPreferences($preferences);
            $em->persist($preferences);
        }

        // Mark as completed even if skipped (user can update preferences later)
        $preferences->setOnboardingCompleted(true);
        $em->flush();

        return new JsonResponse([
            'message' => 'Onboarding skipped',
            'onboardingCompleted' => true,
        ]);
    }
}

