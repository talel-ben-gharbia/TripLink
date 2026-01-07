<?php

namespace App\Repository;

use App\Entity\TravelPackage;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TravelPackage>
 */
class TravelPackageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TravelPackage::class);
    }

    /**
     * Find packages by agent
     *
     * @return TravelPackage[]
     */
    public function findByAgent(User $agent): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.agent = :agent')
            ->setParameter('agent', $agent)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find packages by client
     *
     * @return TravelPackage[]
     */
    public function findByClient(User $client): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.client = :client')
            ->setParameter('client', $client)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find packages by status
     *
     * @return TravelPackage[]
     */
    public function findByStatus(string $status): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.status = :status')
            ->setParameter('status', $status)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}


