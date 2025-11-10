<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Health check controller
 */
class HealthController extends AbstractController
{
    /**
     * Health check endpoint
     *
     * @return JsonResponse
     */
    #[Route('/health', name: 'health_check', methods: ['GET', 'OPTIONS'])]
    public function health(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok',
            'message' => 'Backend is running',
            'timestamp' => date('Y-m-d H:i:s'),
            'php_version' => PHP_VERSION
        ]);
    }
}




