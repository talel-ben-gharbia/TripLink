<?php

namespace App\Controller;

use App\Entity\Package;
use App\Repository\PackageRepository;
use App\Service\PackageService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/agent/packages')]
#[IsGranted('ROLE_AGENT')]
class PackageController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private PackageRepository $packageRepository,
        private PackageService $packageService
    ) {
    }

    /**
     * Get agent's packages
     */
    #[Route('', name: 'api_agent_packages_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $packages = $this->packageRepository->findByAgent($agent);

        return $this->json([
            'packages' => array_map([$this, 'serializePackage'], $packages)
        ]);
    }

    /**
     * Create package
     */
    #[Route('', name: 'api_agent_packages_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $package = $this->packageService->createPackage($agent, $data);

        return $this->json([
            'message' => 'Package created successfully',
            'package' => $this->serializePackage($package)
        ], 201);
    }

    /**
     * Update package
     */
    #[Route('/{id}', name: 'api_agent_packages_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $package = $this->packageRepository->find($id);
        if (!$package || $package->getAgent()->getId() !== $agent->getId()) {
            return $this->json(['error' => 'Package not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $package = $this->packageService->updatePackage($package, $data);

        return $this->json([
            'message' => 'Package updated successfully',
            'package' => $this->serializePackage($package)
        ]);
    }

    /**
     * Delete package
     */
    #[Route('/{id}', name: 'api_agent_packages_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $agent = $this->getUser();
        if (!$agent instanceof \App\Entity\User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $package = $this->packageRepository->find($id);
        if (!$package || $package->getAgent()->getId() !== $agent->getId()) {
            return $this->json(['error' => 'Package not found'], 404);
        }

        $this->em->remove($package);
        $this->em->flush();

        return $this->json(['message' => 'Package deleted successfully']);
    }

    /**
     * Calculate package price
     */
    #[Route('/calculate-price', name: 'api_agent_packages_calculate_price', methods: ['POST'])]
    public function calculatePrice(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $destinationIds = $data['destinations'] ?? [];
        $startDate = isset($data['startDate']) && !empty($data['startDate']) ? new \DateTime($data['startDate']) : null;
        $endDate = isset($data['endDate']) && !empty($data['endDate']) ? new \DateTime($data['endDate']) : null;
        $numberOfGuests = (int)($data['numberOfGuests'] ?? 1);

        $price = $this->packageService->calculatePackagePrice($destinationIds, $startDate, $endDate, $numberOfGuests);

        return $this->json([
            'totalPrice' => $price,
            'breakdown' => [
                'destinations' => count($destinationIds),
                'days' => $startDate && $endDate ? max(1, $startDate->diff($endDate)->days) : 1,
                'guests' => $numberOfGuests
            ]
        ]);
    }

    private function serializePackage(Package $package): array
    {
        return [
            'id' => $package->getId(),
            'name' => $package->getName(),
            'description' => $package->getDescription(),
            'destinations' => $package->getDestinations(),
            'activities' => $package->getActivities(),
            'totalPrice' => $package->getTotalPrice(),
            'status' => $package->getStatus(),
            'startDate' => $package->getStartDate()?->format('Y-m-d'),
            'endDate' => $package->getEndDate()?->format('Y-m-d'),
            'numberOfGuests' => $package->getNumberOfGuests(),
            'clientId' => $package->getClient()?->getId(),
            'createdAt' => $package->getCreatedAt()->format('c'),
            'updatedAt' => $package->getUpdatedAt()?->format('c'),
        ];
    }
}


