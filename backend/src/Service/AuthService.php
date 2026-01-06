<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\UserProfile;
use App\Entity\UserActivity;
use App\Entity\UserPreferences;
use App\Entity\LoginAttempt;
use App\Entity\AuthSession;
use App\Repository\LoginAttemptRepository;
use App\Repository\UserRepository;
use App\Constants\Roles;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

/**
 * Service for authentication operations
 */
class AuthService
{
    public function __construct(
        private UserRepository $userRepository,
        private LoginAttemptRepository $loginAttemptRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private EntityManagerInterface $em,
        private ValidationService $validationService,
        private EmailService $emailService
    ) {}

    /**
     * Register a new user
     *
     * @param array $data User registration data
     * @param mixed $file Profile image file (optional)
     * @param string $profilesDirectory Directory for profile images
     * @return array ['success' => bool, 'user' => User|null, 'errors' => string[]]
     */
    public function registerUser(array $data, $file = null, string $profilesDirectory = ''): array
    {
        $errors = [];

        // Validate required fields
        if (empty($data['email'])) {
            $errors[] = 'Email is required';
        }
        if (empty($data['password'])) {
            $errors[] = 'Password is required';
        }
        if (empty($data['firstName'])) {
            $errors[] = 'First name is required';
        }
        if (empty($data['lastName'])) {
            $errors[] = 'Last name is required';
        }
        if (empty($data['phone'])) {
            $errors[] = 'Phone is required';
        }

        if (!empty($errors)) {
            return ['success' => false, 'user' => null, 'errors' => $errors];
        }

        // Validate email
        $emailValidation = $this->validationService->validateEmail($data['email']);
        if (!$emailValidation['valid']) {
            $errors = array_merge($errors, $emailValidation['errors']);
        }

        // Check if user already exists
        $existingUser = $this->userRepository->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            $errors[] = 'Email already registered';
        }

        // Validate password
        $passwordValidation = $this->validationService->validatePassword($data['password']);
        if (!$passwordValidation['valid']) {
            $errors = array_merge($errors, $passwordValidation['errors']);
        }

        // Validate names
        $firstNameValidation = $this->validationService->validateName($data['firstName'], 'First name');
        if (!$firstNameValidation['valid']) {
            $errors = array_merge($errors, $firstNameValidation['errors']);
        }

        $lastNameValidation = $this->validationService->validateName($data['lastName'], 'Last name');
        if (!$lastNameValidation['valid']) {
            $errors = array_merge($errors, $lastNameValidation['errors']);
        }

        // Validate phone
        $phoneValidation = $this->validationService->validatePhone($data['phone']);
        if (!$phoneValidation['valid']) {
            $errors = array_merge($errors, $phoneValidation['errors']);
        }

        if (!empty($errors)) {
            return ['success' => false, 'user' => null, 'errors' => $errors];
        }

        // Create user (minimal entity)
        $user = new User();
        $user->setEmail($this->validationService->sanitizeInput($data['email']));
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        $user->setRoles([Roles::USER]); // Phase 0: Use role constants
        $user->setStatus('PENDING'); // New users start as PENDING until email verified

        // Create user profile
        $profile = new UserProfile();
        $profile->setFirstName($this->validationService->sanitizeInput($data['firstName']));
        $profile->setLastName($this->validationService->sanitizeInput($data['lastName']));
        $profile->setPhone($this->validationService->sanitizeInput($data['phone']));
        
        // Handle profile image
        if ($file && $profilesDirectory) {
            // Ensure directory exists
            if (!is_dir($profilesDirectory)) {
                mkdir($profilesDirectory, 0755, true);
            }
            
            $fileName = uniqid() . '.' . $file->guessExtension();
            $file->move($profilesDirectory, $fileName);
            $profile->setAvatar($fileName);
        }
        
        $profile->setUser($user);
        $user->setProfile($profile);

        // Create user activity
        $activity = new UserActivity();
        $activity->setUser($user);
        $user->setActivity($activity);

        // Create user preferences
        $preferences = new UserPreferences();
        $preferences->setTravelStyles($data['travelStyles'] ?? []);
        $preferences->setInterests($data['interests'] ?? []);
        $preferences->setUser($user);
        $user->setPreferences($preferences);

        $this->em->persist($user);
        $this->em->persist($profile);
        $this->em->persist($activity);
        $this->em->persist($preferences);
        $this->em->flush();

        // Send verification email
        try {
            $this->emailService->sendVerificationEmail($user);
        } catch (\Exception $e) {
            // Log the error but don't fail registration
            error_log('Email sending failed: ' . $e->getMessage());
            // Still return success - user can resend verification email later
        }

        return ['success' => true, 'user' => $user, 'errors' => []];
    }

    /**
     * Authenticate user with email and password
     *
     * @param string $email User email
     * @param string $password User password
     * @param string $ipAddress Client IP address
     * @return array ['success' => bool, 'user' => User|null, 'token' => string|null, 'errors' => string[]]
     */
    public function authenticateUser(string $email, string $password, string $ipAddress): array
    {
        // Rate limiting check
        if (!$this->rateLimitCheck($email, $ipAddress)) {
            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'errors' => ['Too many failed login attempts. Please try again in 15 minutes.']
            ];
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);

        // Record login attempt
        $loginAttempt = new LoginAttempt();
        $loginAttempt->setEmail($email);
        $loginAttempt->setIpAddress($ipAddress);
        $loginAttempt->setAttemptedAt(new \DateTimeImmutable());

        if (!$user) {
            $loginAttempt->setSuccess(false);
            $this->em->persist($loginAttempt);
            $this->em->flush();
            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'errors' => ['Invalid credentials']
            ];
        }

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            $user->incrementLoginAttempts();
            $loginAttempt->setSuccess(false);
            $this->em->persist($loginAttempt);
            $this->em->flush();
            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'errors' => ['Invalid credentials']
            ];
        }

        // Check if user email is verified
        if (!$user->isVerified()) {
            $loginAttempt->setSuccess(false);
            $this->em->persist($loginAttempt);
            $this->em->flush();
            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'errors' => ['Email not verified. Please check your email for verification link.']
            ];
        }

        // Check if user is active
        if ($user->getStatus() !== 'ACTIVE' && $user->getStatus() !== 'PENDING') {
            $loginAttempt->setSuccess(false);
            $this->em->persist($loginAttempt);
            $this->em->flush();
            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'errors' => ['Account is ' . strtolower($user->getStatus()) . '. Please contact support.']
            ];
        }

        // Successful login
        $loginAttempt->setSuccess(true);
        $this->em->persist($loginAttempt);

        $user->resetLoginAttempts();
        
        // Update last login and status (skip for admin users without activity)
        $activity = $user->getActivity();
        if ($activity) {
            $activity->recordLogin();
        } elseif (!$user->isAdmin()) {
            // Create activity record for non-admin users if missing
            $activity = new UserActivity();
            $activity->setUser($user);
            $activity->recordLogin();
            $user->setActivity($activity);
            $this->em->persist($activity);
        }
        // Admin users without activity records are allowed
        
        if ($user->getStatus() === 'PENDING') {
            $user->setStatus('ACTIVE');
        }

        $this->em->flush();

        // Generate JWT token (short-lived access token)
        try {
            $token = $this->jwtManager->create($user);
            // Generate a separate long-lived refresh token (simple random string)
            $refreshToken = bin2hex(random_bytes(32));

            // Create an auth_session row for tracking and cleanup (skip for admin users)
            $sessionId = null;
            if (!$user->isAdmin()) {
                $session = new AuthSession();
                $session->setSessionId(bin2hex(random_bytes(32)));
                $session->setUser($user);
                $session->setJwtToken($token);
                $session->setRefreshToken($refreshToken);
                $session->setCreatedAt(new \DateTimeImmutable());
                $session->setExpiresAt(new \DateTimeImmutable('+1 hour'));
                $session->setIpAddress($ipAddress);
                $this->em->persist($session);
                $sessionId = $session->getSessionId();
            }
            
            // Bump tokenVersion to invalidate older tokens when needed
            $user->setTokenVersion($user->getTokenVersion() + 1);
            $this->em->persist($user);
            $this->em->flush();
            return [
                'success' => true,
                'user' => $user,
                'token' => $token,
                'sessionId' => $sessionId,
                'refreshToken' => $refreshToken,
                'errors' => []
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'errors' => ['Could not generate token: ' . $e->getMessage()]
            ];
        }
    }

    /**
     * Refresh JWT token for user
     *
     * @param User $user User to refresh token for
     * @return string New JWT token
     */
    public function refreshToken(User $user): string
    {
        return $this->jwtManager->create($user);
    }

    /**
     * Check rate limiting for login attempts
     *
     * @param string $email User email
     * @param string $ipAddress Client IP address
     * @param int $timeWindow Minutes to check
     * @param int $maxAttempts Maximum attempts allowed
     * @return bool True if allowed, false if rate limited
     */
    public function rateLimitCheck(string $email, string $ipAddress, int $timeWindow = 15, int $maxAttempts = 5): bool
    {
        $failedAttempts = $this->loginAttemptRepository->countRecentAttempts($email, $ipAddress, $timeWindow);
        return $failedAttempts < $maxAttempts;
    }
}

