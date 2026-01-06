<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Create destination_review table for user reviews and ratings
 */
final class Version20260104184826 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create destination_review table for user reviews and ratings';
    }

    public function up(Schema $schema): void
    {
        // Create destination_review table
        $this->addSql('CREATE TABLE destination_review (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, destination_id INT NOT NULL, rating INT NOT NULL, comment LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX idx_review_destination (destination_id), INDEX idx_review_user (user_id), UNIQUE INDEX uniq_user_destination_review (user_id, destination_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE destination_review ADD CONSTRAINT FK_2B7A1E51A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE destination_review ADD CONSTRAINT FK_2B7A1E51816C6140 FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // Drop destination_review table
        $this->addSql('ALTER TABLE destination_review DROP FOREIGN KEY FK_2B7A1E51A76ED395');
        $this->addSql('ALTER TABLE destination_review DROP FOREIGN KEY FK_2B7A1E51816C6140');
        $this->addSql('DROP TABLE destination_review');
    }
}
