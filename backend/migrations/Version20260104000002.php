<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Phase 1: Add onboarding completion tracking to user_preferences
 */
final class Version20260104000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 1: Add onboarding_completed field to user_preferences table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_preferences ADD COLUMN onboarding_completed TINYINT(1) NOT NULL DEFAULT 0 AFTER preference_categories');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_preferences DROP COLUMN onboarding_completed');
    }
}

