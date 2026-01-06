<?php

namespace App\Entity;

use App\Repository\DestinationCollectionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Phase 1: Curated Collections
 * 
 * Admin-created destination lists (e.g., "Best Summer Destinations", "Hidden Gems")
 */
#[ORM\Entity(repositoryClass: DestinationCollectionRepository::class)]
#[ORM\Table(name: 'destination_collection')]
class DestinationCollection
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    /**
     * Collection slug for URLs (e.g., "best-summer-destinations")
     */
    #[ORM\Column(length: 255, unique: true)]
    private string $slug;

    /**
     * Collection type: seasonal, theme, featured, etc.
     */
    #[ORM\Column(length: 50, nullable: true)]
    private ?string $type = null;

    /**
     * Whether collection is active/visible
     */
    #[ORM\Column(name: 'is_active', type: 'boolean', options: ['default' => true])]
    private bool $isActive = true;

    /**
     * Display order (lower = higher priority)
     */
    #[ORM\Column(name: 'display_order', type: 'integer', nullable: true)]
    private ?int $displayOrder = null;

    /**
     * Cover image URL
     */
    #[ORM\Column(length: 500, nullable: true)]
    private ?string $coverImage = null;

    #[ORM\ManyToMany(targetEntity: Destination::class)]
    #[ORM\JoinTable(
        name: 'destination_collection_items',
        joinColumns: [new ORM\JoinColumn(name: 'collection_id', referencedColumnName: 'id', onDelete: 'CASCADE')],
        inverseJoinColumns: [new ORM\JoinColumn(name: 'destination_id', referencedColumnName: 'id', onDelete: 'CASCADE')]
    )]
    #[ORM\OrderBy(['displayOrder' => 'ASC'])]
    private Collection $destinations;

    /**
     * Display order for each destination in the collection
     */
    #[ORM\Column(name: 'destination_orders', type: 'json', nullable: true)]
    private ?array $destinationOrders = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->destinations = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(?string $type): static
    {
        $this->type = $type;
        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;
        return $this;
    }

    public function getDisplayOrder(): ?int
    {
        return $this->displayOrder;
    }

    public function setDisplayOrder(?int $displayOrder): static
    {
        $this->displayOrder = $displayOrder;
        return $this;
    }

    public function getCoverImage(): ?string
    {
        return $this->coverImage;
    }

    public function setCoverImage(?string $coverImage): static
    {
        $this->coverImage = $coverImage;
        return $this;
    }

    /**
     * @return Collection<int, Destination>
     */
    public function getDestinations(): Collection
    {
        return $this->destinations;
    }

    public function addDestination(Destination $destination, ?int $order = null): static
    {
        if (!$this->destinations->contains($destination)) {
            $this->destinations->add($destination);
            
            // Update destination orders
            $orders = $this->destinationOrders ?? [];
            $orders[$destination->getId()] = $order ?? (count($orders) + 1);
            $this->destinationOrders = $orders;
        }
        return $this;
    }

    public function removeDestination(Destination $destination): static
    {
        $this->destinations->removeElement($destination);
        
        // Remove from destination orders
        $orders = $this->destinationOrders ?? [];
        unset($orders[$destination->getId()]);
        $this->destinationOrders = $orders;
        
        return $this;
    }

    public function getDestinationOrders(): ?array
    {
        return $this->destinationOrders;
    }

    public function setDestinationOrders(?array $destinationOrders): static
    {
        $this->destinationOrders = $destinationOrders;
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

    /**
     * Update timestamp before updating
     */
    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}

