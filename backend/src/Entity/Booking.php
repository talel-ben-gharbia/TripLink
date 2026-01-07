<?php

namespace App\Entity;

use App\Repository\BookingRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\Table(name: 'booking')]
class Booking
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\ManyToOne(targetEntity: Destination::class)]
    #[ORM\JoinColumn(name: 'destination_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private Destination $destination;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'agent_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?User $agent = null;

    #[ORM\Column(name: 'booking_type', type: Types::STRING, length: 20)]
    private string $bookingType = 'DIRECT'; // DIRECT or AGENT

    #[ORM\Column(name: 'check_in_date', type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $checkInDate = null;

    #[ORM\Column(name: 'check_out_date', type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $checkOutDate = null;

    #[ORM\Column(name: 'number_of_guests', type: Types::INTEGER)]
    private int $numberOfGuests = 1;

    #[ORM\Column(name: 'total_price', type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $totalPrice = null;

    #[ORM\Column(name: 'status', type: Types::STRING, length: 20, options: ['default' => 'PENDING'])]
    private string $status = 'PENDING'; // PENDING, CONFIRMED, CANCELLED, COMPLETED

    #[ORM\Column(name: 'payment_status', type: Types::STRING, length: 20, options: ['default' => 'PENDING'])]
    private string $paymentStatus = 'PENDING'; // PENDING, PAID, REFUNDED, FAILED

    #[ORM\Column(name: 'stripe_payment_intent_id', type: Types::STRING, length: 255, nullable: true)]
    private ?string $stripePaymentIntentId = null;

    #[ORM\Column(name: 'booking_reference', type: Types::STRING, length: 50, unique: true)]
    private ?string $bookingReference = null;

    #[ORM\Column(name: 'special_requests', type: Types::TEXT, nullable: true)]
    private ?string $specialRequests = null;

    #[ORM\Column(name: 'contact_email', type: Types::STRING, length: 255)]
    private ?string $contactEmail = null;

    #[ORM\Column(name: 'contact_phone', type: Types::STRING, length: 50, nullable: true)]
    private ?string $contactPhone = null;

    #[ORM\Column(name: 'created_at', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(name: 'confirmed_at', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $confirmedAt = null;

    #[ORM\Column(name: 'cancelled_at', type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $cancelledAt = null;

    #[ORM\Column(name: 'cancellation_reason', type: Types::TEXT, nullable: true)]
    private ?string $cancellationReason = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->bookingReference = $this->generateBookingReference();
    }

    private function generateBookingReference(): string
    {
        return 'TL' . strtoupper(substr(uniqid(), -8)) . rand(1000, 9999);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getDestination(): Destination
    {
        return $this->destination;
    }

    public function setDestination(Destination $destination): static
    {
        $this->destination = $destination;
        return $this;
    }

    public function getAgent(): ?User
    {
        return $this->agent;
    }

    public function setAgent(?User $agent): static
    {
        $this->agent = $agent;
        return $this;
    }

    public function getBookingType(): string
    {
        return $this->bookingType;
    }

    public function setBookingType(string $bookingType): static
    {
        $this->bookingType = $bookingType;
        return $this;
    }

    public function getCheckInDate(): ?\DateTimeInterface
    {
        return $this->checkInDate;
    }

    public function setCheckInDate(\DateTimeInterface $checkInDate): static
    {
        $this->checkInDate = $checkInDate;
        return $this;
    }

    public function getCheckOutDate(): ?\DateTimeInterface
    {
        return $this->checkOutDate;
    }

    public function setCheckOutDate(?\DateTimeInterface $checkOutDate): static
    {
        $this->checkOutDate = $checkOutDate;
        return $this;
    }

    public function getNumberOfGuests(): int
    {
        return $this->numberOfGuests;
    }

    public function setNumberOfGuests(int $numberOfGuests): static
    {
        $this->numberOfGuests = $numberOfGuests;
        return $this;
    }

    public function getTotalPrice(): ?string
    {
        return $this->totalPrice;
    }

    public function setTotalPrice(string $totalPrice): static
    {
        $this->totalPrice = $totalPrice;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        if ($status === 'CONFIRMED' && !$this->confirmedAt) {
            $this->confirmedAt = new \DateTimeImmutable();
        }
        if ($status === 'CANCELLED' && !$this->cancelledAt) {
            $this->cancelledAt = new \DateTimeImmutable();
        }
        $this->updatedAt = new \DateTimeImmutable();
        return $this;
    }

    public function getPaymentStatus(): string
    {
        return $this->paymentStatus;
    }

    public function setPaymentStatus(string $paymentStatus): static
    {
        $this->paymentStatus = $paymentStatus;
        $this->updatedAt = new \DateTimeImmutable();
        return $this;
    }

    public function getStripePaymentIntentId(): ?string
    {
        return $this->stripePaymentIntentId;
    }

    public function setStripePaymentIntentId(?string $stripePaymentIntentId): static
    {
        $this->stripePaymentIntentId = $stripePaymentIntentId;
        return $this;
    }

    public function getBookingReference(): ?string
    {
        return $this->bookingReference;
    }

    public function setBookingReference(string $bookingReference): static
    {
        $this->bookingReference = $bookingReference;
        return $this;
    }

    public function getSpecialRequests(): ?string
    {
        return $this->specialRequests;
    }

    public function setSpecialRequests(?string $specialRequests): static
    {
        $this->specialRequests = $specialRequests;
        return $this;
    }

    public function getContactEmail(): ?string
    {
        return $this->contactEmail;
    }

    public function setContactEmail(string $contactEmail): static
    {
        $this->contactEmail = $contactEmail;
        return $this;
    }

    public function getContactPhone(): ?string
    {
        return $this->contactPhone;
    }

    public function setContactPhone(?string $contactPhone): static
    {
        $this->contactPhone = $contactPhone;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getConfirmedAt(): ?\DateTimeImmutable
    {
        return $this->confirmedAt;
    }

    public function getCancelledAt(): ?\DateTimeImmutable
    {
        return $this->cancelledAt;
    }

    public function getCancellationReason(): ?string
    {
        return $this->cancellationReason;
    }

    public function setCancellationReason(?string $cancellationReason): static
    {
        $this->cancellationReason = $cancellationReason;
        return $this;
    }

    public function isPending(): bool
    {
        return $this->status === 'PENDING';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'CONFIRMED';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'CANCELLED';
    }

    public function isPaid(): bool
    {
        return $this->paymentStatus === 'PAID';
    }
}

