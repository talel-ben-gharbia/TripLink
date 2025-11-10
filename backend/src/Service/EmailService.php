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
        $frontendUrl = $this->params->has('app.frontend_url') ? $this->params->get('app.frontend_url') : 'http://localhost:3000';
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
}

