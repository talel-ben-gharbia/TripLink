<?php

namespace App\Security;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTDecodedEvent;

class JWTEventSubscriber implements EventSubscriberInterface
{
    public function __construct(private UserRepository $userRepository) {}

    public static function getSubscribedEvents(): array
    {
        return [
            JWTCreatedEvent::class => 'onJWTCreated',
            JWTDecodedEvent::class => 'onJWTDecoded',
        ];
    }

    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        $user = $event->getUser();
        if (!$user instanceof User) {
            return;
        }

        $payload = $event->getData();
        $payload['token_version'] = $user->getTokenVersion();
        $event->setData($payload);
    }

    public function onJWTDecoded(JWTDecodedEvent $event): void
    {
        $payload = $event->getPayload();

        if (!isset($payload['username']) || !isset($payload['token_version'])) {
            $event->markAsInvalid();
            return;
        }

        $user = $this->userRepository->findOneBy(['email' => $payload['username']]);
        if (!$user instanceof User) {
            $event->markAsInvalid();
            return;
        }

        if ((int) $payload['token_version'] !== (int) $user->getTokenVersion()) {
            $event->markAsInvalid();
        }
    }
}


