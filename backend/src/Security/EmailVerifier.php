<?php
namespace App\Security;

use SymfonyCasts\Bundle\VerifyEmail\VerifyEmailHelperInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class EmailVerifier
{
    public function __construct(
        private VerifyEmailHelperInterface $verifyEmailHelper,
        private MailerInterface $mailer,
        private EntityManagerInterface $em,
        private UrlGeneratorInterface $urlGenerator,
        private ParameterBagInterface $params
    ) {}

    public function sendEmailConfirmation(string $routeName, User $user): void
    {
        $signatureComponents = $this->verifyEmailHelper->generateSignature(
            $routeName,
            (string) $user->getId(),
            $user->getEmail(),
            ['id' => $user->getId()]
        );

        // Get signed URL - SymfonyCasts should return absolute URL
        $verifyLink = $signatureComponents->getSignedUrl();
        
        // Ensure the URL is absolute (fallback if getSignedUrl returns relative)
        if (strpos($verifyLink, 'http') !== 0) {
            // Use urlGenerator to create absolute URL
            $baseUrl = $this->urlGenerator->getContext()->getScheme() . '://' . 
                      $this->urlGenerator->getContext()->getHost();
            if ($this->urlGenerator->getContext()->getHttpPort() != 80) {
                $baseUrl .= ':' . $this->urlGenerator->getContext()->getHttpPort();
            }
            $verifyLink = $baseUrl . $verifyLink;
        }
        
        $fromEmail = $this->params->has('app.mailer_from') ? $this->params->get('app.mailer_from') : 'noreply@triplink.com';
        $fromName = $this->params->has('app.mailer_from_name') ? $this->params->get('app.mailer_from_name') : 'TripLink';

        $firstName = $user->getProfile()?->getFirstName() ?? 'User';
        $email = (new Email())
            ->from($fromEmail)
            ->to($user->getEmail())
            ->subject("Verify your email")
            ->html("
                <p>Hello {$firstName},</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href='{$verifyLink}'>Verify Email</a>
                <p>This link will expire in 1 hour.</p>
            ");

        $this->mailer->send($email);
    }

    public function handleEmailConfirmation(Request $request, User $user): void
    {
        // Get the full URL with query parameters
        $url = $request->getSchemeAndHttpHost() . $request->getRequestUri();
        
        $this->verifyEmailHelper->validateEmailConfirmation(
            $url,
            (string) $user->getId(),
            $user->getEmail()
        );

        $user->setIsVerified(true);
        // Status will be updated to ACTIVE in VerifyEmailController
        $this->em->persist($user);
        $this->em->flush();
    }
}