<?php

namespace App\Repository;

use App\Entity\Client;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ClientRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Client::class);
    }

    public function findByAgent(User $agent): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.agent = :agent')
            ->setParameter('agent', $agent)
            ->orderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByAgentAndUser(User $agent, User $user): ?Client
    {
        return $this->createQueryBuilder('c')
            ->where('c.agent = :agent')
            ->andWhere('c.user = :user')
            ->setParameter('agent', $agent)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }
}


