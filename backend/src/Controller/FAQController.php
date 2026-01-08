<?php

namespace App\Controller;

use App\Entity\FAQ;
use App\Repository\FAQRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/faq')]
class FAQController extends AbstractController
{
    public function __construct(
        private FAQRepository $faqRepository,
        private EntityManagerInterface $em
    ) {
    }

    /**
     * Get all FAQs
     */
    #[Route('', name: 'api_faq_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        try {
            $faqs = $this->faqRepository->findBy(['isActive' => true], ['displayOrder' => 'ASC']);
            
            if (empty($faqs)) {
                // Return default FAQs if none exist in database
                return $this->json([
                    'faqs' => $this->getDefaultFAQs()
                ]);
            }

            return $this->json([
                'faqs' => array_map([$this, 'serializeFAQ'], $faqs)
            ]);
        } catch (\Exception $e) {
            error_log('Error fetching FAQs: ' . $e->getMessage());
            return $this->json([
                'faqs' => $this->getDefaultFAQs()
            ]);
        }
    }

    /**
     * Create or update FAQ (Admin only)
     */
    #[Route('', name: 'api_faq_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user || !$user instanceof \App\Entity\User || !$user->isAdmin()) {
            return $this->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $data = json_decode($request->getContent(), true);
            
            $faq = new FAQ();
            $faq->setQuestion($data['question'] ?? '');
            $faq->setAnswer($data['answer'] ?? '');
            $faq->setDisplayOrder($data['displayOrder'] ?? 0);
            $faq->setIsActive(true);

            $this->em->persist($faq);
            $this->em->flush();

            return $this->json([
                'message' => 'FAQ created successfully',
                'faq' => $this->serializeFAQ($faq)
            ], 201);
        } catch (\Exception $e) {
            error_log('Error creating FAQ: ' . $e->getMessage());
            return $this->json(['error' => 'Failed to create FAQ'], 500);
        }
    }

    private function serializeFAQ(FAQ $faq): array
    {
        return [
            'id' => $faq->getId(),
            'question' => $faq->getQuestion(),
            'answer' => $faq->getAnswer(),
            'displayOrder' => $faq->getDisplayOrder(),
        ];
    }

    private function getDefaultFAQs(): array
    {
        return [
            [
                'id' => 1,
                'question' => 'How do I search for destinations?',
                'answer' => 'Use the search bar to enter a city, country, or destination name. You can also filter by category and adjust dates and budget.',
                'displayOrder' => 1
            ],
            [
                'id' => 2,
                'question' => 'How do I create an account?',
                'answer' => 'Open the account modal from the top bar and sign up with your email. After logging in, your preferences and wishlist are saved to your profile.',
                'displayOrder' => 2
            ],
            [
                'id' => 3,
                'question' => 'How do I save a destination to my wishlist?',
                'answer' => 'Click the heart icon on a destination card. You can view and manage your wishlist in your profile later.',
                'displayOrder' => 3
            ],
            [
                'id' => 4,
                'question' => 'Can I edit my profile and preferences?',
                'answer' => 'Yes. Go to your profile to update details and adjust travel preferences so recommendations better match your style.',
                'displayOrder' => 4
            ]
        ];
    }
}



