<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(name: 'is_verified', type: 'boolean')]
    private bool $isVerified = false;

    #[ORM\Column(name: 'status', type: Types::STRING, length: 20, options: ['default' => 'PENDING'])]
    private string $status = 'PENDING';

    #[ORM\Column(name: 'token_version', type: 'integer', nullable: false, options: ['default' => 1])]
    private int $tokenVersion = 1;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $loginAttempts = 0;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $lastLoginAttempt = null;

    // Relationships
    #[ORM\OneToOne(targetEntity: UserProfile::class, mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?UserProfile $profile = null;

    #[ORM\OneToOne(targetEntity: UserActivity::class, mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?UserActivity $activity = null;

    #[ORM\OneToOne(targetEntity: UserPreferences::class, mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?UserPreferences $preferences = null;

    #[ORM\OneToMany(targetEntity: AuthSession::class, mappedBy: 'user', cascade: ['remove'])]
    private Collection $sessions;

    #[ORM\OneToMany(targetEntity: EmailVerification::class, mappedBy: 'user', cascade: ['remove'])]
    private Collection $emailVerifications;

    public function __construct()
    {
        $this->sessions = new ArrayCollection();
        $this->emailVerifications = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function addRole(string $role): static
    {
        if (!in_array($role, $this->roles, true)) {
            $this->roles[] = $role;
        }

        return $this;
    }

    public function isAdmin(): bool
    {
        return in_array('ROLE_ADMIN', $this->getRoles(), true);
    }

    /**
     * Check if user has agent role
     * 
     * Phase 0: Foundation - Helper method for future agent system
     * Agents must apply and be approved (see docs/PHASE_0_AGENT_FOUNDATIONS.md)
     */
    public function isAgent(): bool
    {
        return in_array('ROLE_AGENT', $this->getRoles(), true);
    }

    /**
     * Check if user has both agent and admin roles
     */
    public function isAgentOrAdmin(): bool
    {
        return $this->isAgent() || $this->isAdmin();
    }

    public function getLoginAttempts(): int
    {
        return $this->loginAttempts;
    }

    public function setLoginAttempts(int $loginAttempts): static
    {
        $this->loginAttempts = $loginAttempts;
        return $this;
    }

    public function incrementLoginAttempts(): void
    {
        $this->loginAttempts++;
    }

    public function resetLoginAttempts(): void
    {
        $this->loginAttempts = 0;
    }

    public function getLastLoginAttempt(): ?\DateTimeInterface
    {
        return $this->lastLoginAttempt;
    }

    public function setLastLoginAttempt(?\DateTimeInterface $lastLoginAttempt): static
    {
        $this->lastLoginAttempt = $lastLoginAttempt;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    // Profile relationship methods
    public function getProfile(): ?UserProfile
    {
        return $this->profile;
    }

    public function setProfile(?UserProfile $profile): static
    {
        $this->profile = $profile;
        if ($profile && $profile->getUser() !== $this) {
            $profile->setUser($this);
        }
        return $this;
    }

    // Activity relationship methods
    public function getActivity(): ?UserActivity
    {
        return $this->activity;
    }

    public function setActivity(?UserActivity $activity): static
    {
        $this->activity = $activity;
        if ($activity && $activity->getUser() !== $this) {
            $activity->setUser($this);
        }
        return $this;
    }

    // Preferences relationship methods
    public function getPreferences(): ?UserPreferences
    {
        return $this->preferences;
    }

    public function setPreferences(?UserPreferences $preferences): static
    {
        $this->preferences = $preferences;
        if ($preferences && $preferences->getUser() !== $this) {
            $preferences->setUser($this);
        }
        return $this;
    }

    // Convenience methods for backward compatibility
    public function getFirstName(): ?string
    {
        return $this->profile?->getFirstName();
    }

    public function getLastName(): ?string
    {
        return $this->profile?->getLastName();
    }

    public function getPhone(): ?string
    {
        return $this->profile?->getPhone();
    }

    public function getProfileImage(): ?string
    {
        return $this->profile?->getAvatar();
    }

    public function getTravelStyles(): ?array
    {
        return $this->preferences?->getTravelStyles();
    }

    public function getInterests(): ?array
    {
        return $this->preferences?->getInterests();
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->activity?->getCreatedAt();
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->activity?->getUpdatedAt();
    }

    public function getLastLogin(): ?\DateTimeImmutable
    {
        return $this->activity?->getLastLogin();
    }

    public function __serialize(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'password' => $this->password,
        ];
    }

    public function __unserialize(array $data): void
    {
        $this->id = $data['id'];
        $this->email = $data['email'];
        $this->password = $data['password'];
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $verified): static
    {
        $this->isVerified = $verified;
        return $this;
    }


    public function getTokenVersion(): int
    {
        return $this->tokenVersion;
    }

    public function setTokenVersion(int $tokenVersion): static
    {
        $this->tokenVersion = $tokenVersion;
        return $this;
    }


    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $allowedStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'];
        if (!in_array($status, $allowedStatuses)) {
            throw new \InvalidArgumentException("Invalid status: {$status}");
        }
        $this->status = $status;
        return $this;
    }
}
