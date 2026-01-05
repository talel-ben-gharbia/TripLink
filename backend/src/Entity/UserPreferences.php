<?php

namespace App\Entity;

use App\Repository\UserPreferencesRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserPreferencesRepository::class)]
#[ORM\Table(name: 'user_preferences')]
class UserPreferences
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: User::class, inversedBy: 'preferences')]
    #[ORM\JoinColumn(nullable: false, name: 'user_id')]
    private ?User $user = null;

    #[ORM\Column(name: 'travel_styles', type: 'json', nullable: true)]
    private ?array $travelStyles = null;

    #[ORM\Column(name: 'interests', type: 'json', nullable: true)]
    private ?array $interests = null;

    #[ORM\Column(name: 'budget_range', length: 50, nullable: true)]
    private ?string $budgetRange = null;

    #[ORM\Column(name: 'profile_completion', type: 'integer', options: ['default' => 0])]
    private int $profileCompletion = 0;

    #[ORM\Column(name: 'personality_axis', type: 'json', nullable: true)]
    private ?array $personalityAxis = null;

    #[ORM\Column(name: 'preference_categories', type: 'json', nullable: true)]
    private ?array $preferenceCategories = null;

    /**
     * Phase 1: Onboarding completion status
     */
    #[ORM\Column(name: 'onboarding_completed', type: 'boolean', options: ['default' => false])]
    private bool $onboardingCompleted = false;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getTravelStyles(): ?array
    {
        return $this->travelStyles;
    }

    public function setTravelStyles(?array $travelStyles): static
    {
        $this->travelStyles = $travelStyles;
        return $this;
    }

    public function getInterests(): ?array
    {
        return $this->interests;
    }

    public function setInterests(?array $interests): static
    {
        $this->interests = $interests;
        return $this;
    }

    public function getBudgetRange(): ?string
    {
        return $this->budgetRange;
    }

    public function setBudgetRange(?string $budgetRange): static
    {
        $this->budgetRange = $budgetRange;
        return $this;
    }

    public function getProfileCompletion(): int
    {
        return $this->profileCompletion;
    }

    public function setProfileCompletion(int $profileCompletion): static
    {
        $this->profileCompletion = $profileCompletion;
        return $this;
    }

    public function getPersonalityAxis(): ?array
    {
        return $this->personalityAxis;
    }

    public function setPersonalityAxis(?array $personalityAxis): static
    {
        $this->personalityAxis = $personalityAxis;
        return $this;
    }

    public function getPreferenceCategories(): ?array
    {
        return $this->preferenceCategories;
    }

    public function setPreferenceCategories(?array $preferenceCategories): static
    {
        $this->preferenceCategories = $preferenceCategories;
        return $this;
    }

    public function calculateCompletion(): int
    {
        $completion = 0;
        $totalFields = 6;

        if ($this->travelStyles && count($this->travelStyles) > 0) $completion++;
        if ($this->interests && count($this->interests) > 0) $completion++;
        if ($this->budgetRange) $completion++;
        if ($this->personalityAxis) $completion++;
        if ($this->preferenceCategories) $completion++;
        if ($this->user && $this->user->getProfile() && $this->user->getProfile()->getAvatar()) $completion++;

        $this->profileCompletion = (int)(($completion / $totalFields) * 100);
        return $this->profileCompletion;
    }

    // Phase 1: Onboarding methods

    public function isOnboardingCompleted(): bool
    {
        return $this->onboardingCompleted;
    }

    public function setOnboardingCompleted(bool $onboardingCompleted): static
    {
        $this->onboardingCompleted = $onboardingCompleted;
        return $this;
    }
}

