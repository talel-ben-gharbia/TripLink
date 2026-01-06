<?php

namespace App\Repository;

use App\Entity\LoginAttempt;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class LoginAttemptRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LoginAttempt::class);
    }

    public function countRecentAttempts(string $email, string $ipAddress, int $minutes = 15): int
    {
        $since = new \DateTimeImmutable("-{$minutes} minutes");

        return $this->createQueryBuilder('la')
            ->select('COUNT(la.id)')
            ->where('la.email = :email OR la.ipAddress = :ipAddress')
            ->andWhere('la.attemptedAt > :since')
            ->andWhere('la.success = false')
            ->setParameter('email', $email)
            ->setParameter('ipAddress', $ipAddress)
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }
}

