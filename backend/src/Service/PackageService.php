<?php

namespace App\Service;

use App\Entity\Package;
use App\Entity\User;
use App\Repository\DestinationRepository;
use Doctrine\ORM\EntityManagerInterface;

class PackageService
{
    public function __construct(
        private EntityManagerInterface $em,
        private DestinationRepository $destinationRepository
    ) {
    }

    /**
     * Calculate total price for a package
     */
    public function calculatePackagePrice(array $destinationIds, ?\DateTimeInterface $startDate = null, ?\DateTimeInterface $endDate = null, int $numberOfGuests = 1): float
    {
        $totalPrice = 0.0;
        $days = 1;

        if ($startDate && $endDate) {
            $days = max(1, $startDate->diff($endDate)->days);
        }

        foreach ($destinationIds as $destinationId) {
            $destination = $this->destinationRepository->find($destinationId);
            if ($destination) {
                $basePrice = (float)($destination->getPriceMax() ?? $destination->getPriceMin() ?? 0);
                $totalPrice += $basePrice * $days * $numberOfGuests;
            }
        }

        return round($totalPrice, 2);
    }

    /**
     * Create a package
     */
    public function createPackage(User $agent, array $data): Package
    {
        $package = new Package();
        $package->setAgent($agent);
        $package->setName($data['name'] ?? 'Custom Package');
        $package->setDescription($data['description'] ?? null);
        $package->setDestinations($data['destinations'] ?? []);
        $package->setActivities($data['activities'] ?? null);
        $package->setNumberOfGuests($data['numberOfGuests'] ?? 1);

        if (isset($data['startDate']) && !empty($data['startDate'])) {
            $package->setStartDate(new \DateTime($data['startDate']));
        }
        if (isset($data['endDate']) && !empty($data['endDate'])) {
            $package->setEndDate(new \DateTime($data['endDate']));
        }

        if (isset($data['clientId'])) {
            $client = $this->em->getRepository(\App\Entity\User::class)->find($data['clientId']);
            if ($client) {
                $package->setClient($client);
            }
        }

        // Calculate price
        $totalPrice = $this->calculatePackagePrice(
            $package->getDestinations(),
            $package->getStartDate(),
            $package->getEndDate(),
            $package->getNumberOfGuests()
        );
        $package->setTotalPrice((string)$totalPrice);

        $package->setStatus($data['status'] ?? 'DRAFT');

        $this->em->persist($package);
        $this->em->flush();

        return $package;
    }

    /**
     * Update package
     */
    public function updatePackage(Package $package, array $data): Package
    {
        if (isset($data['name'])) {
            $package->setName($data['name']);
        }
        if (isset($data['description'])) {
            $package->setDescription($data['description']);
        }
        if (isset($data['destinations'])) {
            $package->setDestinations($data['destinations']);
        }
        if (isset($data['activities'])) {
            $package->setActivities($data['activities']);
        }
        if (isset($data['numberOfGuests'])) {
            $package->setNumberOfGuests((int)$data['numberOfGuests']);
        }
        if (isset($data['startDate'])) {
            $package->setStartDate($data['startDate'] ? new \DateTime($data['startDate']) : null);
        }
        if (isset($data['endDate'])) {
            $package->setEndDate($data['endDate'] ? new \DateTime($data['endDate']) : null);
        }
        if (isset($data['status'])) {
            $package->setStatus($data['status']);
        }

        // Recalculate price
        $totalPrice = $this->calculatePackagePrice(
            $package->getDestinations(),
            $package->getStartDate(),
            $package->getEndDate(),
            $package->getNumberOfGuests()
        );
        $package->setTotalPrice((string)$totalPrice);

        $package->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $package;
    }
}




