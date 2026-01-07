<?php

namespace App\Service;

use App\Entity\Destination;
use App\Entity\User;

/**
 * Service to determine booking routing (Direct vs Agent)
 */
class RoutingService
{
    /**
     * Determine if booking should be routed to agent or direct
     * 
     * @param Destination $destination
     * @param array $bookingData Contains: checkInDate, checkOutDate, numberOfGuests, specialRequests
     * @return array ['type' => 'DIRECT'|'AGENT', 'reason' => string, 'complexityScore' => int]
     */
    public function determineBookingType(Destination $destination, array $bookingData): array
    {
        $complexityScore = 0;
        $reasons = [];

        // Factor 1: Number of guests (more guests = more complex)
        $guests = $bookingData['numberOfGuests'] ?? 1;
        if ($guests > 4) {
            $complexityScore += 20;
            $reasons[] = "Large group ({$guests} guests)";
        } elseif ($guests > 2) {
            $complexityScore += 10;
        }

        // Factor 2: Trip duration (longer trips = more complex)
        if (isset($bookingData['checkInDate']) && !empty($bookingData['checkInDate'])) {
            $checkIn = new \DateTime($bookingData['checkInDate']);
            if (isset($bookingData['checkOutDate']) && !empty($bookingData['checkOutDate'])) {
                $checkOut = new \DateTime($bookingData['checkOutDate']);
                $days = $checkOut->diff($checkIn)->days;
            
                if ($days > 14) {
                    $complexityScore += 25;
                    $reasons[] = "Extended trip ({$days} days)";
                } elseif ($days > 7) {
                    $complexityScore += 15;
                }
            } else {
                // Single day booking - simpler
                $complexityScore += 5;
            }
        }

        // Factor 3: Special requests (indicates complexity)
        if (!empty($bookingData['specialRequests'])) {
            $complexityScore += 15;
            $reasons[] = "Special requirements";
        }

        // Factor 4: Destination price range (expensive = might need agent)
        $price = $destination->getPriceMax() ?? $destination->getPriceMin() ?? 0;
        if ($price > 5000) {
            $complexityScore += 20;
            $reasons[] = "Premium destination";
        } elseif ($price > 2000) {
            $complexityScore += 10;
        }

        // Factor 5: Multiple destinations (if implemented)
        // For now, we'll skip this

        // Threshold: Score >= 40 requires agent
        $requiresAgent = $complexityScore >= 40;

        return [
            'type' => $requiresAgent ? 'AGENT' : 'DIRECT',
            'reason' => $requiresAgent 
                ? 'Complex booking requires agent assistance: ' . implode(', ', $reasons)
                : 'Simple booking can be completed directly',
            'complexityScore' => $complexityScore,
            'factors' => $reasons
        ];
    }

    /**
     * Check if user manually wants agent assistance
     */
    public function shouldUseAgent(?bool $userPreference): bool
    {
        return $userPreference === true;
    }
}

