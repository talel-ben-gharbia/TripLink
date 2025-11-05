<?php
namespace App\Security;

use SymfonyCasts\Bundle\VerifyEmail\VerifyEmailHelperInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class EmailVerifier
{
    public function __construct(
        private VerifyEmailHelperInterface $verifyEmailHelper,
        private MailerInterface $mailer,
        private EntityManagerInterface $em
    ) {}
    public function sendEmailConfirmation(string $routeName, User $user): void
    {
        $signature = $this->verifyEmailHelper->generateSignature(
            $routeName,
            $user->getId(),
            $user->getEmail()
        );

        $verifyLink = $signature->getSignedUrl(); 

        $email = (new Email())
            ->from("anything@your-inbox.mailtrap.io")
            ->to($user->getEmail())
            ->subject("Verify your email")
            ->html("
                <p>Hello {$user->getFirstName()},</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href='{$verifyLink}'>Verify Email</a>
            ");

        $this->mailer->send($email);
    }

    public function handleEmailConfirmation(Request $request, User $user): void
{
    $url = $request->getUri(); 
    $this->verifyEmailHelper->validateEmailConfirmation(
        $url,
        $user->getId(),
        $user->getEmail()
    );

    $user->setIsVerified(true);
    $this->em->persist($user);
    $this->em->flush();
}
}
