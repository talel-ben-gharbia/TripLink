<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Entity\User;
use App\Repository\BookingRepository;
use App\Service\BookingService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/payments')]
class PaymentController extends AbstractController
{
    public function __construct(
        private BookingRepository $bookingRepository,
        private BookingService $bookingService,
        private EntityManagerInterface $em
    ) {
    }

    /**
     * Create Stripe Checkout Session (redirects to Stripe)
     */
    #[Route('/create-checkout', name: 'api_payment_create_checkout', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createCheckoutSession(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);
        
        if (empty($data['bookingId'])) {
            return $this->json(['error' => 'Booking ID is required'], 400);
        }

        $booking = $this->bookingRepository->find($data['bookingId']);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        // Allow payment for DIRECT bookings or AGENT bookings that are CONFIRMED
        if ($booking->getBookingType() === 'AGENT' && $booking->getStatus() !== 'CONFIRMED') {
            return $this->json(['error' => 'This booking requires agent confirmation before payment. Please wait for your agent to confirm the booking.'], 400);
        }

        if ($booking->isPaid()) {
            return $this->json(['error' => 'Booking already paid'], 400);
        }

        try {
            $stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'] ?? null;
            
            if (!$stripeSecretKey || !class_exists(\Stripe\Stripe::class)) {
                return $this->json([
                    'error' => 'Stripe not configured',
                    'message' => 'Please configure STRIPE_SECRET_KEY in your .env file'
                ], 500);
            }

            \Stripe\Stripe::setApiKey($stripeSecretKey);

            $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';
            $amount = (int)((float)$booking->getTotalPrice() * 100); // Convert to cents

            // Ensure minimum amount is at least 50 cents (Stripe minimum)
            if ($amount < 50) {
                $amount = 50;
            }

            $checkoutSession = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => $booking->getDestination()->getName(),
                            'description' => 'Trip Booking - ' . $booking->getBookingReference(),
                        ],
                        'unit_amount' => $amount,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $frontendUrl . '/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=' . $booking->getId(),
                'cancel_url' => $frontendUrl . '/booking-cancel?booking_id=' . $booking->getId(),
                'metadata' => [
                    'booking_id' => $booking->getId(),
                    'booking_reference' => $booking->getBookingReference(),
                    'user_id' => $user->getId(),
                ],
                'customer_email' => $user->getEmail(),
                'payment_intent_data' => [
                    'description' => 'Trip Booking - ' . $booking->getBookingReference(),
                ],
            ]);

            $booking->setStripePaymentIntentId($checkoutSession->id);
            $this->em->flush();

            return $this->json([
                'checkoutUrl' => $checkoutSession->url,
                'sessionId' => $checkoutSession->id,
            ]);

        } catch (\Stripe\Exception\ApiErrorException $e) {
            error_log('Stripe API error: ' . $e->getMessage());
            return $this->json([
                'error' => 'Checkout session creation failed',
                'message' => $e->getMessage(),
                'type' => $e->getStripeCode() ?? 'unknown'
            ], 500);
        } catch (\Exception $e) {
            error_log('Stripe Checkout error: ' . $e->getMessage());
            return $this->json([
                'error' => 'Checkout session creation failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create Stripe payment intent (for Elements integration - alternative method)
     */
    #[Route('/create-intent', name: 'api_payment_create_intent', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);
        
        if (empty($data['bookingId'])) {
            return $this->json(['error' => 'Booking ID is required'], 400);
        }

        $booking = $this->bookingRepository->find($data['bookingId']);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        // Allow payment for DIRECT bookings or AGENT bookings that are CONFIRMED
        if ($booking->getBookingType() === 'AGENT' && $booking->getStatus() !== 'CONFIRMED') {
            return $this->json(['error' => 'This booking requires agent confirmation before payment. Please wait for your agent to confirm the booking.'], 400);
        }

        if ($booking->isPaid()) {
            return $this->json(['error' => 'Booking already paid'], 400);
        }

        try {
            $stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'] ?? null;
            
            if (!$stripeSecretKey || !class_exists(\Stripe\Stripe::class)) {
                return $this->json([
                    'error' => 'Stripe not configured',
                    'message' => 'Please configure STRIPE_SECRET_KEY in your .env file'
                ], 500);
            }

            \Stripe\Stripe::setApiKey($stripeSecretKey);

            $amount = (int)((float)$booking->getTotalPrice() * 100); // Convert to cents

            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => $amount,
                'currency' => 'usd',
                'metadata' => [
                    'booking_id' => $booking->getId(),
                    'booking_reference' => $booking->getBookingReference(),
                    'user_id' => $user->getId(),
                ],
            ]);

            $booking->setStripePaymentIntentId($paymentIntent->id);
            $this->em->flush();

            return $this->json([
                'clientSecret' => $paymentIntent->client_secret,
                'paymentIntentId' => $paymentIntent->id,
                'amount' => $amount,
                'currency' => 'usd'
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Payment intent creation failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify Stripe Checkout Session and complete booking
     */
    #[Route('/verify-checkout', name: 'api_payment_verify_checkout', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function verifyCheckoutSession(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);
        
        if (empty($data['sessionId']) || empty($data['bookingId'])) {
            return $this->json(['error' => 'Session ID and Booking ID are required'], 400);
        }

        $booking = $this->bookingRepository->find($data['bookingId']);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        try {
            $stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'] ?? null;
            if (!$stripeSecretKey) {
                return $this->json(['error' => 'Stripe not configured'], 500);
            }

            \Stripe\Stripe::setApiKey($stripeSecretKey);

            // Retrieve session with payment intent expanded
            $session = \Stripe\Checkout\Session::retrieve($data['sessionId'], [
                'expand' => ['payment_intent']
            ]);

            // Check payment status - accept 'paid' status
            if ($session->payment_status === 'paid') {
                // Extract payment intent ID from the session
                $paymentIntentId = null;
                
                // The payment_intent field can be a string ID or an expanded object
                if ($session->payment_intent) {
                    if (is_string($session->payment_intent)) {
                        $paymentIntentId = $session->payment_intent;
                    } else if (is_object($session->payment_intent) && isset($session->payment_intent->id)) {
                        $paymentIntentId = $session->payment_intent->id;
                    }
                }
                
                // Store the session ID as well for reference (we'll use payment intent ID if available)
                $stripeReference = $paymentIntentId ?: $session->id;
                
                  $this->bookingService->confirmBooking($booking, $stripeReference);
                  
                  // Mark commission as paid if agent booking
                  if ($booking->getBookingType() === 'AGENT' && $booking->getAgent()) {
                      $this->bookingService->markCommissionAsPaid($booking);
                  }
                  
                  return $this->json([
                    'message' => 'Payment confirmed and booking completed',
                    'booking' => [
                        'id' => $booking->getId(),
                        'bookingReference' => $booking->getBookingReference(),
                        'status' => $booking->getStatus(),
                        'paymentStatus' => $booking->getPaymentStatus(),
                    ]
                ]);
            } else {
                return $this->json([
                    'error' => 'Payment not completed',
                    'paymentStatus' => $session->payment_status,
                    'sessionStatus' => $session->status
                ], 400);
            }

        } catch (\Exception $e) {
            error_log('Stripe checkout verification error: ' . $e->getMessage());
            return $this->json([
                'error' => 'Payment verification failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm payment and complete booking (for Payment Intent method)
     */
    #[Route('/confirm', name: 'api_payment_confirm', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function confirmPayment(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Not authenticated'], 401);
        }

        $data = json_decode($request->getContent(), true);
        
        if (empty($data['bookingId']) || empty($data['paymentIntentId'])) {
            return $this->json(['error' => 'Booking ID and Payment Intent ID are required'], 400);
        }

        $booking = $this->bookingRepository->find($data['bookingId']);
        
        if (!$booking) {
            return $this->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        try {
            $stripeSecretKey = $_ENV['STRIPE_SECRET_KEY'] ?? null;
            if (!$stripeSecretKey) {
                return $this->json(['error' => 'Stripe not configured'], 500);
            }

            \Stripe\Stripe::setApiKey($stripeSecretKey);

            $paymentIntent = \Stripe\PaymentIntent::retrieve($data['paymentIntentId']);

            if ($paymentIntent->status === 'succeeded') {
                $this->bookingService->confirmBooking($booking, $paymentIntent->id);
                
                return $this->json([
                    'message' => 'Payment confirmed and booking completed',
                    'booking' => [
                        'id' => $booking->getId(),
                        'bookingReference' => $booking->getBookingReference(),
                        'status' => $booking->getStatus(),
                        'paymentStatus' => $booking->getPaymentStatus(),
                    ]
                ]);
            } else {
                return $this->json([
                    'error' => 'Payment not completed',
                    'status' => $paymentIntent->status
                ], 400);
            }

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Payment confirmation failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

