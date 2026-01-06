<?php

namespace App\Repository;

use App\Entity\AuthSession;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class AuthSessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AuthSession::class);
    }

    public function findValidSessionByToken(string $token): ?AuthSession
    {
        return $this->createQueryBuilder('s')
            ->where('s.jwtToken = :token')
            ->andWhere('s.expiresAt > :now')
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findBySessionId(string $sessionId): ?AuthSession
    {
        return $this->findOneBy(['sessionId' => $sessionId]);
    }
}

