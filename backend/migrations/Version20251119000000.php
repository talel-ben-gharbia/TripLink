<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251119000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create destination and wishlist_item tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE destination (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, country VARCHAR(100) NOT NULL, city VARCHAR(100) DEFAULT NULL, category VARCHAR(50) NOT NULL, description LONGTEXT DEFAULT NULL, tags JSON DEFAULT NULL, price_min INT DEFAULT NULL, price_max INT DEFAULT NULL, rating DOUBLE PRECISION DEFAULT NULL, images JSON DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE wishlist_item (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, destination_id INT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_wishlist_user (user_id), INDEX IDX_wishlist_destination (destination_id), UNIQUE INDEX uniq_wishlist_user_destination (user_id, destination_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE wishlist_item ADD CONSTRAINT FK_wishlist_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE wishlist_item ADD CONSTRAINT FK_wishlist_destination FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_destination_search ON destination (name, country)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE wishlist_item DROP FOREIGN KEY FK_wishlist_user');
        $this->addSql('ALTER TABLE wishlist_item DROP FOREIGN KEY FK_wishlist_destination');
        $this->addSql('DROP TABLE wishlist_item');
        $this->addSql('DROP TABLE destination');
    }
}