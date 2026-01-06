<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration: Add timestamps and status to User entity
 */
final class Version20251108000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add created_at, updated_at, last_login, and status columns to user table';
    }

    public function up(Schema $schema): void
    {
        // Note: created_at, updated_at, last_login, and status are now in the first migration
        // This migration is kept for backward compatibility but does nothing for fresh databases
        // If you have existing data, you would need to add these columns manually
    }

    public function down(Schema $schema): void
    {
        // Note: These columns are now in the first migration
        // This migration is kept for backward compatibility
    }
}

