<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251107000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add personality axis, preference categories, token version, and tables for login attempts and blacklisted tokens';
    }

    public function up(Schema $schema): void
    {
        // Note: personality_axis, preference_categories, and token_version are now in the first migration
        // This migration only creates the login_attempt and blacklisted_token tables

        // Create login_attempt table
        $this->addSql('CREATE TABLE login_attempt (
            id INT AUTO_INCREMENT NOT NULL,
            email VARCHAR(180) NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            attempted_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            success TINYINT(1) NOT NULL,
            INDEX IDX_login_email_ip (email, ip_address),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Create blacklisted_token table
        $this->addSql('CREATE TABLE blacklisted_token (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            token VARCHAR(500) NOT NULL,
            blacklisted_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            expires_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_blacklist_user_token (user_id, token),
            PRIMARY KEY(id),
            CONSTRAINT FK_blacklist_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE blacklisted_token');
        $this->addSql('DROP TABLE login_attempt');
    }
}

