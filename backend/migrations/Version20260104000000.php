<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Phase 1: Core Travel Product
 * 
 * Adds featured/pinned destinations and display order for editorial control
 */
final class Version20260104000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 1: Add featured, pinned, and display_order fields to destination table for editorial control';
    }

    public function up(Schema $schema): void
    {
        // Add featured flag (for homepage highlights)
        $this->addSql('ALTER TABLE destination ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER rating');
        
        // Add pinned flag (for manual ordering)
        $this->addSql('ALTER TABLE destination ADD COLUMN is_pinned TINYINT(1) NOT NULL DEFAULT 0 AFTER is_featured');
        
        // Add display order (for manual ordering within featured/pinned)
        $this->addSql('ALTER TABLE destination ADD COLUMN display_order INT DEFAULT NULL AFTER is_pinned');
        
        // Add index for featured destinations query
        $this->addSql('CREATE INDEX IDX_destination_featured ON destination (is_featured, display_order)');
        
        // Add index for pinned destinations query
        $this->addSql('CREATE INDEX IDX_destination_pinned ON destination (is_pinned, display_order)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IDX_destination_pinned ON destination');
        $this->addSql('DROP INDEX IDX_destination_featured ON destination');
        $this->addSql('ALTER TABLE destination DROP COLUMN display_order');
        $this->addSql('ALTER TABLE destination DROP COLUMN is_pinned');
        $this->addSql('ALTER TABLE destination DROP COLUMN is_featured');
    }
}

