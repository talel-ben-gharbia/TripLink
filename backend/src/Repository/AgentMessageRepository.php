<?php

namespace App\Repository;

use App\Entity\AgentMessage;
use App\Entity\User;
use App\Entity\Booking;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AgentMessage>
 */
class AgentMessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AgentMessage::class);
    }

    /**
     * Find messages between agent and client
     *
     * @return AgentMessage[]
     */
    public function findConversation(User $agent, User $client, ?int $limit = null): array
    {
        $qb = $this->createQueryBuilder('m')
            ->where('m.agent = :agent')
            ->andWhere('m.client = :client')
            ->setParameter('agent', $agent)
            ->setParameter('client', $client)
            ->orderBy('m.createdAt', 'DESC');

        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Find unread messages for agent
     */
    public function findUnreadForAgent(User $agent): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.agent = :agent')
            ->andWhere('m.read = :read')
            ->andWhere('m.direction = :direction')
            ->setParameter('agent', $agent)
            ->setParameter('read', false)
            ->setParameter('direction', 'FROM_CLIENT')
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find unread messages for client
     */
    public function findUnreadForClient(User $client): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.client = :client')
            ->andWhere('m.read = :read')
            ->andWhere('m.direction = :direction')
            ->setParameter('client', $client)
            ->setParameter('read', false)
            ->setParameter('direction', 'TO_CLIENT')
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Count unread messages for agent
     */
    public function countUnreadForAgent(User $agent): int
    {
        return $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.agent = :agent')
            ->andWhere('m.read = :read')
            ->andWhere('m.direction = :direction')
            ->setParameter('agent', $agent)
            ->setParameter('read', false)
            ->setParameter('direction', 'FROM_CLIENT')
            ->getQuery()
            ->getSingleScalarResult();
    }
}


