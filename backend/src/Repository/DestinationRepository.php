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

    /**
     * Phase 1: Enhanced search with multi-tag filtering and improved sorting
     */
    public function search(?string $q, array $filters = [], int $limit = 20, int $offset = 0): array
    {
        $qb = $this->createQueryBuilder('d');

        if ($q) {
            $qb->andWhere('d.name LIKE :q OR d.city LIKE :q OR d.country LIKE :q')
               ->setParameter('q', '%' . $q . '%');
        }

        // Category filter
        if (!empty($filters['category'])) {
            $qb->andWhere('d.category = :cat')->setParameter('cat', $filters['category']);
        }

        // Phase 1: Multi-tag filtering (tags must contain any of the specified tags)
        if (!empty($filters['tags']) && is_array($filters['tags'])) {
            $tagConditions = [];
            foreach ($filters['tags'] as $index => $tag) {
                $paramName = 'tag' . $index;
                $tagConditions[] = "JSON_CONTAINS(d.tags, :{$paramName})";
                $qb->setParameter($paramName, json_encode($tag));
            }
            if (!empty($tagConditions)) {
                $qb->andWhere('(' . implode(' OR ', $tagConditions) . ')');
            }
        }

        // Country filter
        if (!empty($filters['country'])) {
            $qb->andWhere('d.country = :country')->setParameter('country', $filters['country']);
        }

        // Price range filters
        if (!empty($filters['priceMin'])) {
            $qb->andWhere('(d.priceMin >= :pmin OR d.priceMax >= :pmin)')
               ->setParameter('pmin', (int)$filters['priceMin']);
        }

        if (!empty($filters['priceMax'])) {
            $qb->andWhere('(d.priceMin <= :pmax OR d.priceMax <= :pmax)')
               ->setParameter('pmax', (int)$filters['priceMax']);
        }

        // Phase 1: Enhanced sorting options
        if (!empty($filters['sort'])) {
            switch ($filters['sort']) {
                case 'popularity':
                case 'popularity_desc':
                    // For popularity, we'll use a subquery approach or order by rating as fallback
                    // Full popularity requires wishlist join which complicates filters
                    // Using rating as proxy for popularity (can be enhanced later)
                    $qb->orderBy('d.rating', 'DESC')
                       ->addOrderBy('d.createdAt', 'DESC');
                    break;
                case 'rating':
                case 'rating_desc':
                    $qb->orderBy('d.rating', 'DESC')
                       ->addOrderBy('d.name', 'ASC');
                    break;
                case 'newest':
                    $qb->orderBy('d.createdAt', 'DESC');
                    break;
                case 'alphabetical':
                case 'name_asc':
                    $qb->orderBy('d.name', 'ASC');
                    break;
                case 'name_desc':
                    $qb->orderBy('d.name', 'DESC');
                    break;
                case 'price_asc':
                    $qb->orderBy('d.priceMin', 'ASC')
                       ->addOrderBy('d.priceMax', 'ASC');
                    break;
                case 'price_desc':
                    $qb->orderBy('d.priceMax', 'DESC')
                       ->addOrderBy('d.priceMin', 'DESC');
                    break;
                default:
                    // Default: pinned first, then featured, then by display_order, then by creation date
                    $qb->orderBy('d.isPinned', 'DESC')
                       ->addOrderBy('d.isFeatured', 'DESC')
                       ->addOrderBy('d.displayOrder', 'ASC')
                       ->addOrderBy('d.createdAt', 'DESC');
            }
        } else {
            // Default sorting: pinned/featured first, then by display order, then creation date
            $qb->orderBy('d.isPinned', 'DESC')
               ->addOrderBy('d.isFeatured', 'DESC')
               ->addOrderBy('d.displayOrder', 'ASC')
               ->addOrderBy('d.createdAt', 'DESC');
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

    /**
     * Phase 1: Find featured destinations (for homepage)
     */
    public function findFeatured(int $limit = 12): array
    {
        return $this->createQueryBuilder('d')
            ->where('d.isFeatured = :featured')
            ->setParameter('featured', true)
            ->orderBy('d.displayOrder', 'ASC')
            ->addOrderBy('d.rating', 'DESC')
            ->addOrderBy('d.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Phase 1: Find pinned destinations (for manual ordering)
     */
    public function findPinned(int $limit = 10): array
    {
        return $this->createQueryBuilder('d')
            ->where('d.isPinned = :pinned')
            ->setParameter('pinned', true)
            ->orderBy('d.displayOrder', 'ASC')
            ->addOrderBy('d.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Phase 1: Autocomplete search suggestions
     * 
     * Returns destination names, cities, and countries matching query
     */
    public function autocomplete(string $query, int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('d');
        $qb->select('DISTINCT d.name, d.city, d.country, d.category')
            ->where('d.name LIKE :q OR d.city LIKE :q OR d.country LIKE :q')
            ->setParameter('q', '%' . $query . '%')
            ->orderBy('d.name', 'ASC')
            ->setMaxResults($limit);

        $results = $qb->getQuery()->getResult();
        
        // Format for autocomplete suggestions
        $suggestions = [];
        $seen = [];
        foreach ($results as $result) {
            // Add name suggestion
            if (!in_array($result['name'], $seen, true)) {
                $suggestions[] = [
                    'text' => $result['name'],
                    'type' => 'destination',
                    'category' => $result['category'],
                    'country' => $result['country'],
                ];
                $seen[] = $result['name'];
            }
            
            // Add city suggestion
            if ($result['city'] && !in_array($result['city'], $seen, true)) {
                $suggestions[] = [
                    'text' => $result['city'],
                    'type' => 'city',
                    'country' => $result['country'],
                ];
                $seen[] = $result['city'];
            }
            
            // Add country suggestion
            if (!in_array($result['country'], $seen, true)) {
                $suggestions[] = [
                    'text' => $result['country'],
                    'type' => 'country',
                ];
                $seen[] = $result['country'];
            }
        }

        return array_slice($suggestions, 0, $limit);
    }

    /**
     * Phase 1: Get all unique tags for tag-based suggestions
     */
    public function getAllTags(): array
    {
        $destinations = $this->createQueryBuilder('d')
            ->select('d.tags')
            ->where('d.tags IS NOT NULL')
            ->getQuery()
            ->getResult();

        $allTags = [];
        foreach ($destinations as $dest) {
            $tags = $dest['tags'] ?? [];
            if (is_array($tags)) {
                $allTags = array_merge($allTags, $tags);
            }
        }

        return array_values(array_unique($allTags));
    }

    /**
     * Phase 1: Get all unique categories
     */
    public function getAllCategories(): array
    {
        $results = $this->createQueryBuilder('d')
            ->select('DISTINCT d.category')
            ->orderBy('d.category', 'ASC')
            ->getQuery()
            ->getResult();

        return array_column($results, 'category');
    }
}
