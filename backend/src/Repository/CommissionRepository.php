<?php

namespace App\Repository;

use App\Entity\Commission;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Commission>
 */
class CommissionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Commission::class);
    }

    /**
     * Find commissions by agent
     *
     * @return Commission[]
     */
    public function findByAgent(User $agent): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.agent = :agent')
            ->setParameter('agent', $agent)
            ->orderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Calculate total commission for agent
     */
    public function getTotalCommission(User $agent): float
    {
        $result = $this->createQueryBuilder('c')
            ->select('SUM(c.amount)')
            ->where('c.agent = :agent')
            ->andWhere('c.status = :status')
            ->setParameter('agent', $agent)
            ->setParameter('status', 'PAID')
            ->getQuery()
            ->getSingleScalarResult();

        return (float)($result ?? 0);
    }

    /**
     * Calculate pending commission for agent
     */
    public function getPendingCommission(User $agent): float
    {
        $result = $this->createQueryBuilder('c')
            ->select('SUM(c.amount)')
            ->where('c.agent = :agent')
            ->andWhere('c.status = :status')
            ->setParameter('agent', $agent)
            ->setParameter('status', 'PENDING')
            ->getQuery()
            ->getSingleScalarResult();

        return (float)($result ?? 0);
    }

    /**
     * Count commissions by status
     */
    public function countByStatus(User $agent, string $status): int
    {
        return $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where('c.agent = :agent')
            ->andWhere('c.status = :status')
            ->setParameter('agent', $agent)
            ->setParameter('status', $status)
            ->getQuery()
            ->getSingleScalarResult();
    }
}


