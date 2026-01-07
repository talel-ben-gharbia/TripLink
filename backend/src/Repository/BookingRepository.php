<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('b')
            ->where('b.user = :user')
            ->setParameter('user', $user)
            ->orderBy('b.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByAgent(User $agent): array
    {
        return $this->createQueryBuilder('b')
            ->where('b.agent = :agent')
            ->setParameter('agent', $agent)
            ->orderBy('b.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByBookingReference(string $reference): ?Booking
    {
        return $this->createQueryBuilder('b')
            ->where('b.bookingReference = :reference')
            ->setParameter('reference', $reference)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findPendingAgentBookings(): array
    {
        return $this->createQueryBuilder('b')
            ->where('b.bookingType = :type')
            ->andWhere('b.status = :status')
            ->andWhere('b.agent IS NULL')
            ->setParameter('type', 'AGENT')
            ->setParameter('status', 'PENDING')
            ->orderBy('b.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function countByStatus(string $status): int
    {
        return $this->createQueryBuilder('b')
            ->select('COUNT(b.id)')
            ->where('b.status = :status')
            ->setParameter('status', $status)
            ->getQuery()
            ->getSingleScalarResult();
    }
}

