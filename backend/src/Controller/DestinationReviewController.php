<?php

namespace App\Controller;

use App\Entity\Destination;
use App\Entity\DestinationReview;
use App\Entity\ActivityLog;
use App\Repository\DestinationRepository;
use App\Repository\DestinationReviewRepository;
use App\Repository\ActivityLogRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/destinations/{destinationId}/reviews')]
class DestinationReviewController extends AbstractController
{
    #[Route('', name: 'destination_reviews_list', methods: ['GET'])]
    public function list(int $destinationId, DestinationReviewRepository $repo): JsonResponse
    {
        $user = $this->getUser();
        $currentUserId = ($user && $user instanceof \App\Entity\User) ? $user->getId() : null;
        
        $reviews = $repo->findByDestination($destinationId);
        $data = array_map(function (DestinationReview $review) use ($currentUserId) {
            // Only show public reviews, or user's own reviews
            if (!$review->isPublic() && $review->getUser()->getId() !== $currentUserId) {
                return null;
            }
            
            $user = $review->getUser();
            $profile = $user->getProfile();
            return [
                'id' => $review->getId(),
                'rating' => $review->getRating(),
                'comment' => $review->getComment(),
                'isPublic' => $review->isPublic(),
                'createdAt' => $review->getCreatedAt()->format('c'),
                'updatedAt' => $review->getUpdatedAt()?->format('c'),
                'user' => [
                    'id' => $user->getId(),
                    'firstName' => $profile?->getFirstName() ?? '',
                    'lastName' => $profile?->getLastName() ?? '',
                    'email' => $user->getEmail(),
                    'avatar' => $profile?->getAvatar(),
                ],
            ];
        }, $reviews);

        // Filter out null values (private reviews from other users)
        $data = array_filter($data, fn($item) => $item !== null);

        return $this->json(array_values($data));
    }

    #[Route('', name: 'destination_reviews_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(
        int $destinationId,
        Request $request,
        DestinationRepository $destRepo,
        DestinationReviewRepository $reviewRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user || !$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }
        
        $destination = $destRepo->find($destinationId);
        if (!$destination) {
            return $this->json(['error' => 'Destination not found'], 404);
        }

        // Check if user already reviewed this destination
        $existingReview = $reviewRepo->findByUserAndDestination($user, $destination);
        if ($existingReview) {
            return $this->json(['error' => 'You have already reviewed this destination'], 400);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $rating = isset($data['rating']) ? (int)$data['rating'] : null;
        $comment = $data['comment'] ?? null;
        $isPublic = isset($data['isPublic']) ? (bool)$data['isPublic'] : true;

        if (!$rating || $rating < 1 || $rating > 5) {
            return $this->json(['error' => 'Rating must be between 1 and 5'], 400);
        }

        $review = new DestinationReview();
        $review->setUser($user);
        $review->setDestination($destination);
        $review->setRating($rating);
        $review->setComment($comment);
        $review->setIsPublic($isPublic);

        $em->persist($review);
        
        // Log activity
        $activityLog = new ActivityLog();
        $activityLog->setUser($user);
        $activityLog->setActionType('create_review');
        $activityLog->setEntityType('review');
        $activityLog->setEntityId($review->getId());
        $activityLog->setMetadata([
            'destinationId' => $destination->getId(),
            'destinationName' => $destination->getName(),
            'rating' => $rating,
            'isPublic' => $isPublic,
        ]);
        $em->persist($activityLog);
        
        $em->flush();

        // Update destination average rating
        $avgRating = $reviewRepo->getAverageRating($destinationId);
        $destination->setRating($avgRating);
        $em->flush();

        return $this->json([
            'id' => $review->getId(),
            'rating' => $review->getRating(),
            'comment' => $review->getComment(),
            'isPublic' => $review->isPublic(),
            'createdAt' => $review->getCreatedAt()->format('c'),
        ], 201);
    }

    #[Route('/{id}', name: 'destination_reviews_update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function update(
        int $destinationId,
        int $id,
        Request $request,
        DestinationReviewRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user || !$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }
        
        $review = $repo->find($id);

        if (!$review) {
            return $this->json(['error' => 'Review not found'], 404);
        }

        if ($review->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'You can only edit your own reviews'], 403);
        }

        if ($review->getDestination()->getId() !== $destinationId) {
            return $this->json(['error' => 'Review does not belong to this destination'], 400);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        
        if (isset($data['rating'])) {
            $rating = (int)$data['rating'];
            if ($rating < 1 || $rating > 5) {
                return $this->json(['error' => 'Rating must be between 1 and 5'], 400);
            }
            $review->setRating($rating);
        }

        if (isset($data['comment'])) {
            $review->setComment($data['comment']);
        }

        if (isset($data['isPublic'])) {
            $review->setIsPublic((bool)$data['isPublic']);
        }

        $review->setUpdatedAt(new \DateTimeImmutable());
        
        // Log activity
        $activityLog = new ActivityLog();
        $activityLog->setUser($user);
        $activityLog->setActionType('update_review');
        $activityLog->setEntityType('review');
        $activityLog->setEntityId($review->getId());
        $activityLog->setMetadata([
            'destinationId' => $review->getDestination()->getId(),
            'destinationName' => $review->getDestination()->getName(),
            'rating' => $review->getRating(),
            'isPublic' => $review->isPublic(),
        ]);
        $em->persist($activityLog);
        
        $em->flush();

        // Update destination average rating
        $avgRating = $repo->getAverageRating($destinationId);
        $review->getDestination()->setRating($avgRating);
        $em->flush();

        return $this->json([
            'id' => $review->getId(),
            'rating' => $review->getRating(),
            'comment' => $review->getComment(),
            'isPublic' => $review->isPublic(),
            'updatedAt' => $review->getUpdatedAt()->format('c'),
        ]);
    }

    #[Route('/{id}', name: 'destination_reviews_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function delete(
        int $destinationId,
        int $id,
        DestinationReviewRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user || !$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }
        
        $review = $repo->find($id);

        if (!$review) {
            return $this->json(['error' => 'Review not found'], 404);
        }

        if ($review->getUser()->getId() !== $user->getId() && !in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->json(['error' => 'You can only delete your own reviews'], 403);
        }

        if ($review->getDestination()->getId() !== $destinationId) {
            return $this->json(['error' => 'Review does not belong to this destination'], 400);
        }

        $destination = $review->getDestination();
        
        // Log activity
        $activityLog = new ActivityLog();
        $activityLog->setUser($user);
        $activityLog->setActionType('delete_review');
        $activityLog->setEntityType('review');
        $activityLog->setMetadata([
            'destinationId' => $destination->getId(),
            'destinationName' => $destination->getName(),
        ]);
        $em->persist($activityLog);
        
        $em->remove($review);
        $em->flush();

        // Update destination average rating
        $avgRating = $repo->getAverageRating($destinationId);
        $destination->setRating($avgRating);
        $em->flush();

        return $this->json(['status' => 'deleted']);
    }

    #[Route('/stats', name: 'destination_reviews_stats', methods: ['GET'])]
    public function stats(int $destinationId, DestinationReviewRepository $repo): JsonResponse
    {
        $avgRating = $repo->getAverageRating($destinationId);
        $reviewCount = $repo->getReviewCount($destinationId);

        return $this->json([
            'averageRating' => $avgRating,
            'reviewCount' => $reviewCount,
        ]);
    }
}

