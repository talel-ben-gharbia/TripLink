<?php

namespace App\Controller;

use App\Entity\TravelDocument;
use App\Entity\User;
use App\Repository\TravelDocumentRepository;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/documents')]
#[IsGranted('ROLE_USER')]
class TravelDocumentController extends AbstractController
{
    public function __construct(
        private TravelDocumentRepository $documentRepository,
        private EntityManagerInterface $em,
        private ?NotificationService $notificationService = null
    ) {
    }

    /**
     * Get user's travel documents
     */
    #[Route('', name: 'api_documents_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $documents = $this->documentRepository->findByUser($user);
        $expiring = $this->documentRepository->findExpiringSoon($user, 90);
        $expired = $this->documentRepository->findExpired($user);

        return $this->json([
            'documents' => array_map([$this, 'serializeDocument'], $documents),
            'alerts' => [
                'expiring' => array_map([$this, 'serializeDocument'], $expiring),
                'expired' => array_map([$this, 'serializeDocument'], $expired),
            ]
        ]);
    }

    /**
     * Upload a travel document
     */
    #[Route('', name: 'api_documents_upload', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user instanceof User) {
                return $this->json(['error' => 'Not authenticated'], 401);
            }

            $file = $request->files->get('file');
            if (!$file) {
                return $this->json(['error' => 'No file uploaded'], 400);
            }

            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!in_array($file->getMimeType(), $allowedTypes)) {
                return $this->json(['error' => 'Invalid file type. Only JPEG, PNG, and PDF are allowed.'], 400);
            }

            // Validate file size (max 10MB)
            if ($file->getSize() > 10 * 1024 * 1024) {
                return $this->json(['error' => 'File size exceeds 10MB limit'], 400);
            }

            $data = json_decode($request->get('data', '{}'), true) ?: [];
            $documentType = $data['documentType'] ?? 'PASSPORT';
            $expirationDate = !empty($data['expirationDate']) ? new \DateTime($data['expirationDate']) : null;
            $issueDate = !empty($data['issueDate']) ? new \DateTime($data['issueDate']) : null;

            // Create uploads directory if it doesn't exist
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/documents';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Generate unique filename
            $extension = $file->guessExtension() ?: $file->getClientOriginalExtension();
            $fileName = uniqid('doc_') . '_' . time() . '.' . $extension;
            $filePath = $uploadDir . '/' . $fileName;

            // Move uploaded file
            $file->move($uploadDir, $fileName);

            // Create document entity
            $document = new TravelDocument();
            $document->setUser($user);
            $document->setDocumentType($documentType);
            $document->setFilePath('/uploads/documents/' . $fileName);
            $document->setFileName($file->getClientOriginalName());
            $document->setFileSize($file->getSize());
            $document->setMimeType($file->getMimeType());
            $document->setExpirationDate($expirationDate);
            $document->setIssueDate($issueDate);
            $document->setCountry($data['country'] ?? null);
            $document->setDocumentNumber($data['documentNumber'] ?? null);

            // TODO: OCR extraction would go here
            // For now, we'll just store the file

            $this->em->persist($document);
            $this->em->flush();

            // Check if document is expiring soon and send notification
            if ($document->isExpiringSoon(90) && $this->notificationService) {
                $this->notificationService->createNotification(
                    $user,
                    'document_expiring',
                    'Document Expiring Soon',
                    "Your {$documentType} is expiring on " . ($document->getExpirationDate()?->format('Y-m-d') ?? 'soon'),
                    'document',
                    $document->getId(),
                    "/documents",
                    ['documentType' => $documentType, 'expirationDate' => $document->getExpirationDate()?->format('Y-m-d')]
                );
            }

            return $this->json([
                'message' => 'Document uploaded successfully',
                'document' => $this->serializeDocument($document)
            ], 201);
        } catch (\Exception $e) {
            error_log('Error uploading document: ' . $e->getMessage());
            return $this->json([
                'error' => 'Failed to upload document',
                'message' => 'An error occurred while uploading your document. Please try again.'
            ], 500);
        }
    }

    /**
     * Delete a travel document
     */
    #[Route('/{id}', name: 'api_documents_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user instanceof User) {
                return $this->json(['error' => 'Not authenticated'], 401);
            }

            $document = $this->documentRepository->find($id);
            if (!$document) {
                return $this->json(['error' => 'Document not found'], 404);
            }

            if ($document->getUser()->getId() !== $user->getId()) {
                return $this->json(['error' => 'Access denied'], 403);
            }

            // Delete file
            $filePath = $this->getParameter('kernel.project_dir') . '/public' . $document->getFilePath();
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            $this->em->remove($document);
            $this->em->flush();

            return $this->json(['message' => 'Document deleted successfully']);
        } catch (\Exception $e) {
            error_log('Error deleting document: ' . $e->getMessage());
            return $this->json([
                'error' => 'Failed to delete document',
                'message' => 'An error occurred while deleting your document. Please try again.'
            ], 500);
        }
    }

    /**
     * Update document metadata
     */
    #[Route('/{id}', name: 'api_documents_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user instanceof User) {
                return $this->json(['error' => 'Not authenticated'], 401);
            }

            $document = $this->documentRepository->find($id);
            if (!$document) {
                return $this->json(['error' => 'Document not found'], 404);
            }

            if ($document->getUser()->getId() !== $user->getId()) {
                return $this->json(['error' => 'Access denied'], 403);
            }

            $data = json_decode($request->getContent(), true);

            if (isset($data['expirationDate'])) {
                $document->setExpirationDate(!empty($data['expirationDate']) ? new \DateTime($data['expirationDate']) : null);
            }
            if (isset($data['issueDate'])) {
                $document->setIssueDate(!empty($data['issueDate']) ? new \DateTime($data['issueDate']) : null);
            }
            if (isset($data['country'])) {
                $document->setCountry($data['country']);
            }
            if (isset($data['documentNumber'])) {
                $document->setDocumentNumber($data['documentNumber']);
            }
            if (isset($data['documentType'])) {
                $document->setDocumentType($data['documentType']);
            }

            $document->setUpdatedAt(new \DateTimeImmutable());
            $this->em->flush();

            return $this->json([
                'message' => 'Document updated successfully',
                'document' => $this->serializeDocument($document)
            ]);
        } catch (\Exception $e) {
            error_log('Error updating document: ' . $e->getMessage());
            return $this->json([
                'error' => 'Failed to update document',
                'message' => 'An error occurred while updating your document. Please try again.'
            ], 500);
        }
    }

    private function serializeDocument(TravelDocument $document): array
    {
        return [
            'id' => $document->getId(),
            'documentType' => $document->getDocumentType(),
            'fileName' => $document->getFileName(),
            'filePath' => $document->getFilePath(),
            'fileSize' => $document->getFileSize(),
            'mimeType' => $document->getMimeType(),
            'documentNumber' => $document->getDocumentNumber(),
            'expirationDate' => $document->getExpirationDate()?->format('Y-m-d'),
            'issueDate' => $document->getIssueDate()?->format('Y-m-d'),
            'country' => $document->getCountry(),
            'isVerified' => $document->isVerified(),
            'isExpiringSoon' => $document->isExpiringSoon(90),
            'isExpired' => $document->isExpired(),
            'extractedData' => $document->getExtractedData(),
            'createdAt' => $document->getCreatedAt()->format('Y-m-d H:i:s'),
            'updatedAt' => $document->getUpdatedAt()?->format('Y-m-d H:i:s'),
        ];
    }
}



