<?php

namespace App\Repository;

use App\Entity\TravelDocument;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TravelDocument>
 */
class TravelDocumentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TravelDocument::class);
    }

    /**
     * Find documents by user
     *
     * @return TravelDocument[]
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('d')
            ->where('d.user = :user')
            ->setParameter('user', $user)
            ->orderBy('d.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find expiring documents
     *
     * @return TravelDocument[]
     */
    public function findExpiringSoon(User $user, int $days = 90): array
    {
        $date = new \DateTime("+{$days} days");
        
        return $this->createQueryBuilder('d')
            ->where('d.user = :user')
            ->andWhere('d.expirationDate IS NOT NULL')
            ->andWhere('d.expirationDate <= :date')
            ->andWhere('d.expirationDate >= :now')
            ->setParameter('user', $user)
            ->setParameter('date', $date)
            ->setParameter('now', new \DateTime())
            ->orderBy('d.expirationDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find expired documents
     *
     * @return TravelDocument[]
     */
    public function findExpired(User $user): array
    {
        return $this->createQueryBuilder('d')
            ->where('d.user = :user')
            ->andWhere('d.expirationDate IS NOT NULL')
            ->andWhere('d.expirationDate < :now')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTime())
            ->orderBy('d.expirationDate', 'ASC')
            ->getQuery()
            ->getResult();
    }
}

