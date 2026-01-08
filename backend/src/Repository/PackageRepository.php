<?php

namespace App\Repository;

use App\Entity\Package;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PackageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Package::class);
    }

    public function findByAgent(User $agent): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.agent = :agent')
            ->setParameter('agent', $agent)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByClient(User $client): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.client = :client')
            ->setParameter('client', $client)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}




