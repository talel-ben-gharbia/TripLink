<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251106030000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create user and reset_password_request tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE `user` (
            id INT AUTO_INCREMENT NOT NULL,
            email VARCHAR(180) NOT NULL,
            roles JSON NOT NULL,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            phone VARCHAR(15) NOT NULL,
            travel_styles JSON DEFAULT NULL,
            interests JSON DEFAULT NULL,
            is_verified TINYINT(1) NOT NULL DEFAULT 0,
            profile_image VARCHAR(255) DEFAULT NULL,
            personality_axis JSON DEFAULT NULL,
            preference_categories JSON DEFAULT NULL,
            token_version INT NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            last_login DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            status VARCHAR(20) NOT NULL DEFAULT \'PENDING\',
            UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE reset_password_request (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            used TINYINT(1) NOT NULL DEFAULT 0,
            UNIQUE INDEX UNIQ_reset_token (token),
            INDEX IDX_reset_user (user_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE reset_password_request ADD CONSTRAINT FK_reset_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE reset_password_request DROP FOREIGN KEY FK_reset_user');
        $this->addSql('DROP TABLE reset_password_request');
        $this->addSql('DROP TABLE `user`');
    }
}

