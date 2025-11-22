<?php

namespace App\Repository;

use App\Entity\WishlistItem;
use App\Entity\User;
use App\Entity\Destination;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class WishlistItemRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WishlistItem::class);
    }

    public function isWishlisted(User $user, Destination $destination): bool
    {
        return (bool) $this->createQueryBuilder('w')
            ->andWhere('w.user = :u')
            ->andWhere('w.destination = :d')
            ->setParameter('u', $user)
            ->setParameter('d', $destination)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function countByDestination(Destination $destination): int
    {
        return (int) $this->createQueryBuilder('w')
            ->select('COUNT(w.id)')
            ->andWhere('w.destination = :d')
            ->setParameter('d', $destination)
            ->getQuery()
            ->getSingleScalarResult();
    }
}