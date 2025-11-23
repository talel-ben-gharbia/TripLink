<?php

namespace App\Repository;

use App\Entity\Destination;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class DestinationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Destination::class);
    }

    public function search(?string $q, array $filters = [], int $limit = 20, int $offset = 0): array
    {
        $qb = $this->createQueryBuilder('d');

        if ($q) {
            $qb->andWhere('d.name LIKE :q OR d.city LIKE :q OR d.country LIKE :q')
               ->setParameter('q', '%' . $q . '%');
        }

        if (!empty($filters['category'])) {
            $qb->andWhere('d.category = :cat')->setParameter('cat', $filters['category']);
        }

        if (!empty($filters['country'])) {
            $qb->andWhere('d.country = :country')->setParameter('country', $filters['country']);
        }

        if (!empty($filters['priceMin'])) {
            $qb->andWhere('d.priceMin >= :pmin')->setParameter('pmin', (int)$filters['priceMin']);
        }

        if (!empty($filters['priceMax'])) {
            $qb->andWhere('d.priceMax <= :pmax')->setParameter('pmax', (int)$filters['priceMax']);
        }

        if (!empty($filters['sort'])) {
            switch ($filters['sort']) {
                case 'price_asc':
                    $qb->orderBy('d.priceMin', 'ASC');
                    break;
                case 'price_desc':
                    $qb->orderBy('d.priceMax', 'DESC');
                    break;
                case 'rating_desc':
                    $qb->orderBy('d.rating', 'DESC');
                    break;
                default:
                    $qb->orderBy('d.createdAt', 'DESC');
            }
        } else {
            $qb->orderBy('d.createdAt', 'DESC');
        }

        return $qb->setFirstResult($offset)->setMaxResults($limit)->getQuery()->getResult();
    }

    public function findPopular(int $limit = 10): array
    {
        $em = $this->getEntityManager();
        $qb = $em->createQueryBuilder();
        $qb->select('d, COUNT(w.id) AS HIDDEN wishlistCount')
            ->from(Destination::class, 'd')
            ->leftJoin('App\\Entity\\WishlistItem', 'w', 'WITH', 'w.destination = d')
            ->groupBy('d.id')
            ->orderBy('wishlistCount', 'DESC')
            ->setMaxResults($limit);
        return $qb->getQuery()->getResult();
    }

    public function findRecommendedForUser(User $user, int $limit = 10): array
    {
        $prefs = $user->getPreferences();
        $qb = $this->createQueryBuilder('d');
        if ($prefs) {
            $styles = array_map('strtolower', $prefs->getTravelStyles() ?? []);
            $interests = array_map('strtolower', $prefs->getInterests() ?? []);
            $cats = [];
            foreach (array_merge($styles, $interests) as $t) {
                if (str_contains($t, 'beach')) $cats[] = 'beach';
                if (str_contains($t, 'adventure')) $cats[] = 'adventure';
                if (str_contains($t, 'culture') || str_contains($t, 'cultural')) $cats[] = 'cultural';
                if (str_contains($t, 'mountain')) $cats[] = 'mountain';
                if (str_contains($t, 'city')) $cats[] = 'city';
            }
            $cats = array_unique($cats);
            if (!empty($cats)) {
                $qb->andWhere('d.category IN (:cats)')->setParameter('cats', $cats);
            }
        }
        $qb->orderBy('d.rating', 'DESC');
        return $qb->setMaxResults($limit)->getQuery()->getResult();
    }
}
