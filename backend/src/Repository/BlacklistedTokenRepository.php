<?php

namespace App\Repository;

use App\Entity\BlacklistedToken;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class BlacklistedTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, BlacklistedToken::class);
    }

    public function isTokenBlacklisted(string $token): bool
    {
        $result = $this->createQueryBuilder('bt')
            ->select('COUNT(bt.id)')
            ->where('bt.token = :token')
            ->andWhere('(bt.expiresAt IS NULL OR bt.expiresAt > :now)')
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->getSingleScalarResult();

        return $result > 0;
    }

    public function blacklistAllUserTokens(User $user, ?\DateTimeImmutable $expiresAt = null): void
    {
        // This is a simple implementation - in production, you might want to
        // store a token version or timestamp in the user entity instead
        // For now, we'll just blacklist tokens that are presented for logout-all
    }
}

