<?php

namespace App\Entity;

use App\Repository\BlacklistedTokenRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BlacklistedTokenRepository::class)]
#[ORM\Table(name: 'blacklisted_token')]
#[ORM\Index(columns: ['user_id', 'token'])]
class BlacklistedToken
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\Column(length: 500)]
    private ?string $token = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $blacklistedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $expiresAt = null;

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

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): static
    {
        $this->token = $token;
        return $this;
    }

    public function getBlacklistedAt(): ?\DateTimeImmutable
    {
        return $this->blacklistedAt;
    }

    public function setBlacklistedAt(\DateTimeImmutable $blacklistedAt): static
    {
        $this->blacklistedAt = $blacklistedAt;
        return $this;
    }

    public function getExpiresAt(): ?\DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(?\DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;
        return $this;
    }
}

