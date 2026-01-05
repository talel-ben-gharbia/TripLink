<?php

namespace App\Repository;

use App\Entity\DestinationReview;
use App\Entity\Destination;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class DestinationReviewRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DestinationReview::class);
    }

    /**
     * Find all reviews for a destination (public only, or user's own)
     */
    public function findByDestination(int $destinationId, int $limit = 50, int $offset = 0): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.user', 'u')
            ->addSelect('u')
            ->where('r.destination = :dest')
            ->setParameter('dest', $destinationId)
            ->orderBy('r.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find public reviews for a destination (for homepage)
     */
    public function findPublicByDestination(int $destinationId, int $limit = 50, int $offset = 0): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.user', 'u')
            ->addSelect('u')
            ->where('r.destination = :dest')
            ->andWhere('r.isPublic = :isPublic')
            ->setParameter('dest', $destinationId)
            ->setParameter('isPublic', true)
            ->orderBy('r.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find review by user and destination
     */
    public function findByUserAndDestination(User $user, Destination $destination): ?DestinationReview
    {
        return $this->createQueryBuilder('r')
            ->where('r.user = :user')
            ->andWhere('r.destination = :dest')
            ->setParameter('user', $user)
            ->setParameter('dest', $destination)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Calculate average rating for a destination
     */
    public function getAverageRating(int $destinationId): ?float
    {
        $result = $this->createQueryBuilder('r')
            ->select('AVG(r.rating) as avgRating')
            ->where('r.destination = :dest')
            ->setParameter('dest', $destinationId)
            ->getQuery()
            ->getSingleScalarResult();

        return $result ? (float)$result : null;
    }

    /**
     * Get review count for a destination
     */
    public function getReviewCount(int $destinationId): int
    {
        return $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.destination = :dest')
            ->setParameter('dest', $destinationId)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Find all reviews by a user
     */
    public function findByUser(User $user, int $limit = 50, int $offset = 0): array
    {
        return $this->createQueryBuilder('r')
            ->addSelect('d') // Select destination
            ->leftJoin('r.destination', 'd')
            ->where('r.user = :user')
            ->setParameter('user', $user)
            ->orderBy('r.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getResult();
    }

    /**
     * Get review count by user
     */
    public function countByUser(User $user): int
    {
        return $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getSingleScalarResult();
    }
}

