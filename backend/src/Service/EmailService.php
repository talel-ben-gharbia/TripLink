<?php

namespace App\Service;

use App\Entity\User;
use App\Security\EmailVerifier;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

/**
 * Service for sending emails
 */
class EmailService
{
    public function __construct(
        private MailerInterface $mailer,
        private EmailVerifier $emailVerifier,
        private UrlGeneratorInterface $urlGenerator,
        private ParameterBagInterface $params
    ) {}

    /**
     * Send email verification link
     *
     * @param User $user User to send verification email to
     * @return void
     */
    public function sendVerificationEmail(User $user): void
    {
        $this->emailVerifier->sendEmailConfirmation('app_verify_email', $user);
    }

    /**
     * Send password reset email
     *
     * @param User $user User requesting password reset
     * @param string $token Reset token
     * @return void
     */
    public function sendPasswordResetEmail(User $user, string $token): void
    {
        $frontendUrl = $this->params->has('app.frontend_url') && !empty($this->params->get('app.frontend_url')) 
            ? $this->params->get('app.frontend_url') 
            : ($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $token;
        $fromEmail = $this->params->has('app.mailer_from') ? $this->params->get('app.mailer_from') : 'noreply@triplink.com';
        $fromName = $this->params->has('app.mailer_from_name') ? $this->params->get('app.mailer_from_name') : 'TripLink';

        $firstName = $user->getProfile()?->getFirstName() ?? 'User';
        $email = (new Email())
            ->from($fromEmail)
            ->to($user->getEmail())
            ->subject('Reset Your Password')
            ->html("
                <h1>Password Reset Request</h1>
                <p>Hello {$firstName},</p>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href='{$resetUrl}'>Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            ");

        $this->mailer->send($email);
    }

    /**
     * Send welcome email after registration
     *
     * @param User $user Newly registered user
     * @return void
     */
    public function sendWelcomeEmail(User $user): void
    {
        $fromEmail = $this->params->has('app.mailer_from') ? $this->params->get('app.mailer_from') : 'noreply@triplink.com';
        $fromName = $this->params->has('app.mailer_from_name') ? $this->params->get('app.mailer_from_name') : 'TripLink';

        $firstName = $user->getProfile()?->getFirstName() ?? 'User';
        $email = (new Email())
            ->from($fromEmail)
            ->to($user->getEmail())
            ->subject('Welcome to TripLink!')
            ->html("
                <h1>Welcome to TripLink, {$firstName}!</h1>
                <p>Thank you for joining our community of travelers.</p>
                <p>Please verify your email address to get started.</p>
                <p>Happy travels!</p>
            ");

        $this->mailer->send($email);
    }

    /**
     * Send account deletion confirmation email
     *
     * @param User $user User whose account was deleted
     * @return void
     */
    public function sendAccountDeletionEmail(User $user): void
    {
        $fromEmail = $this->params->has('app.mailer_from') ? $this->params->get('app.mailer_from') : 'noreply@triplink.com';
        $fromName = $this->params->has('app.mailer_from_name') ? $this->params->get('app.mailer_from_name') : 'TripLink';

        $firstName = $user->getProfile()?->getFirstName() ?? 'User';
        $email = (new Email())
            ->from($fromEmail)
            ->to($user->getEmail())
            ->subject('Your TripLink Account Has Been Deleted')
            ->html("
                <h1>Account Deletion Confirmation</h1>
                <p>Hello {$firstName},</p>
                <p>Your TripLink account has been successfully deleted.</p>
                <p>All your personal data has been anonymized in accordance with our privacy policy.</p>
                <p>We're sorry to see you go. If you change your mind, you can always create a new account.</p>
            ");

        $this->mailer->send($email);
    }

    /**
     * Send password changed confirmation email
     *
     * @param User $user User whose password was changed
     * @return void
     */
    public function sendPasswordChangedEmail(User $user): void
    {
        $fromEmail = $this->params->has('app.mailer_from') ? $this->params->get('app.mailer_from') : 'noreply@triplink.com';
        $fromName = $this->params->has('app.mailer_from_name') ? $this->params->get('app.mailer_from_name') : 'TripLink';

        $firstName = $user->getProfile()?->getFirstName() ?? 'User';
        $email = (new Email())
            ->from($fromEmail)
            ->to($user->getEmail())
            ->subject('Password Changed Successfully')
            ->html("
                <h1>Password Changed</h1>
                <p>Hello {$firstName},</p>
                <p>Your password has been successfully changed.</p>
                <p>If you didn't make this change, please contact support immediately.</p>
            ");

        $this->mailer->send($email);
    }

    /**
     * Send agent approval email with temporary password
     *
     * @param User $user Newly approved agent
     * @param string $temporaryPassword Temporary password for first login
     * @return void
     */
    public function sendAgentApprovalEmail(User $user, string $temporaryPassword): void
    {
        $fromEmail = $this->params->has('app.mailer_from') ? $this->params->get('app.mailer_from') : 'noreply@triplink.com';
        $fromName = $this->params->has('app.mailer_from_name') ? $this->params->get('app.mailer_from_name') : 'TripLink';
        $frontendUrl = $this->params->has('app.frontend_url') && !empty($this->params->get('app.frontend_url')) 
            ? $this->params->get('app.frontend_url') 
            : ($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000');

        $firstName = $user->getProfile()?->getFirstName() ?? 'Agent';
        $loginUrl = $frontendUrl . '/login';

        $email = (new Email())
            ->from($fromEmail)
            ->to($user->getEmail())
            ->subject('Your Agent Application Has Been Approved!')
            ->html("
                <h1>Congratulations, {$firstName}!</h1>
                <p>Your agent application has been approved. You can now log in to your agent account.</p>
                <h2>Your Login Credentials:</h2>
                <p><strong>Email:</strong> {$user->getEmail()}</p>
                <p><strong>Temporary Password:</strong> {$temporaryPassword}</p>
                <p><a href='{$loginUrl}'>Login to Your Account</a></p>
                <p><strong>Important:</strong> You must change your password immediately after your first login for security reasons.</p>
                <p>Welcome to the TripLink agent team!</p>
            ");

        $this->mailer->send($email);
    }

    /**
     * Send booking confirmation email with detailed information
     *
     * @param \App\Entity\Booking $booking Confirmed booking
     * @return void
     */
    public function sendBookingConfirmationEmail(\App\Entity\Booking $booking): void
    {
        $fromEmail = $this->params->has('app.mailer_from') ? $this->params->get('app.mailer_from') : 'noreply@triplink.com';
        $fromName = $this->params->has('app.mailer_from_name') ? $this->params->get('app.mailer_from_name') : 'TripLink';
        $frontendUrl = $this->params->has('app.frontend_url') && !empty($this->params->get('app.frontend_url')) 
            ? $this->params->get('app.frontend_url') 
            : ($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000');

        $user = $booking->getUser();
        $destination = $booking->getDestination();
        $firstName = $user->getProfile()?->getFirstName() ?? 'Traveler';
        $bookingUrl = $frontendUrl . '/bookings';
        $viewBookingUrl = $frontendUrl . '/bookings?booking=' . $booking->getId();

        // Calculate trip duration
        $duration = 'N/A';
        if ($booking->getCheckInDate() && $booking->getCheckOutDate()) {
            $checkIn = $booking->getCheckInDate();
            $checkOut = $booking->getCheckOutDate();
            $diff = $checkIn->diff($checkOut);
            $duration = $diff->days . ' day' . ($diff->days !== 1 ? 's' : '');
        } elseif ($booking->getCheckInDate()) {
            $duration = 'Single day';
        }

        // Format dates
        $checkInFormatted = $booking->getCheckInDate() ? $booking->getCheckInDate()->format('F j, Y') : 'N/A';
        $checkOutFormatted = $booking->getCheckOutDate() ? $booking->getCheckOutDate()->format('F j, Y') : 'N/A';

        // Generate QR code data (simple text-based for now, can be enhanced with library)
        $qrData = $booking->getBookingReference();

        $email = (new Email())
            ->from($fromEmail)
            ->to($booking->getContactEmail())
            ->subject('Booking Confirmation - ' . $booking->getBookingReference())
            ->html("
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='UTF-8'>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .detail-label { font-weight: bold; color: #666; }
                        .detail-value { color: #333; }
                        .qr-code { text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
                        .qr-code-placeholder { font-family: monospace; font-size: 12px; padding: 20px; background: #f0f0f0; border-radius: 4px; }
                        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .highlight { color: #667eea; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>✓ Booking Confirmed!</h1>
                            <p>Your trip is all set</p>
                        </div>
                        <div class='content'>
                            <p>Hello {$firstName},</p>
                            <p>We're excited to confirm your booking! Your reservation has been successfully processed.</p>
                            
                            <div class='booking-details'>
                                <h2>Booking Details</h2>
                                <div class='detail-row'>
                                    <span class='detail-label'>Booking Reference:</span>
                                    <span class='detail-value highlight'>{$booking->getBookingReference()}</span>
                                </div>
                                <div class='detail-row'>
                                    <span class='detail-label'>Destination:</span>
                                    <span class='detail-value'>{$destination->getName()}</span>
                                </div>
                                <div class='detail-row'>
                                    <span class='detail-label'>Location:</span>
                                    <span class='detail-value'>{$destination->getCity()}, {$destination->getCountry()}</span>
                                </div>
                                <div class='detail-row'>
                                    <span class='detail-label'>Check-in:</span>
                                    <span class='detail-value'>{$checkInFormatted}</span>
                                </div>
                                " . ($booking->getCheckOutDate() ? "
                                <div class='detail-row'>
                                    <span class='detail-label'>Check-out:</span>
                                    <span class='detail-value'>{$checkOutFormatted}</span>
                                </div>
                                " : "") . "
                                <div class='detail-row'>
                                    <span class='detail-label'>Duration:</span>
                                    <span class='detail-value'>{$duration}</span>
                                </div>
                                <div class='detail-row'>
                                    <span class='detail-label'>Guests:</span>
                                    <span class='detail-value'>{$booking->getNumberOfGuests()}</span>
                                </div>
                                <div class='detail-row'>
                                    <span class='detail-label'>Total Price:</span>
                                    <span class='detail-value highlight'>$" . number_format((float)$booking->getTotalPrice(), 2) . "</span>
                                </div>
                                <div class='detail-row'>
                                    <span class='detail-label'>Status:</span>
                                    <span class='detail-value'>{$booking->getStatus()}</span>
                                </div>
                                <div class='detail-row'>
                                    <span class='detail-label'>Payment Status:</span>
                                    <span class='detail-value'>{$booking->getPaymentStatus()}</span>
                                </div>
                            </div>

                            <div class='qr-code'>
                                <h3>Check-in QR Code</h3>
                                <div class='qr-code-placeholder'>
                                    {$qrData}
                                </div>
                                <p style='font-size: 11px; color: #666; margin-top: 10px;'>Present this code at check-in</p>
                            </div>

                            " . ($booking->getSpecialRequests() ? "
                            <div class='booking-details'>
                                <h3>Special Requests</h3>
                                <p>{$booking->getSpecialRequests()}</p>
                            </div>
                            " : "") . "

                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{$viewBookingUrl}' class='button'>View Booking Details</a>
                            </div>

                            <div class='booking-details'>
                                <h3>Important Information</h3>
                                <ul>
                                    <li>Please arrive on time for your check-in</li>
                                    <li>Keep this confirmation email for your records</li>
                                    <li>Contact us if you need to make any changes</li>
                                    <li>Emergency contact: support@triplink.com</li>
                                </ul>
                            </div>

                            <p>We hope you have an amazing trip!</p>
                            <p>Best regards,<br>The TripLink Team</p>
                        </div>
                        <div class='footer'>
                            <p>This is an automated confirmation email. Please do not reply.</p>
                            <p><a href='{$frontendUrl}'>Visit TripLink</a> | <a href='{$bookingUrl}'>Manage Bookings</a></p>
                        </div>
                    </div>
                </body>
                </html>
            ");

        $this->mailer->send($email);
    }
}

