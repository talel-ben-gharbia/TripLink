<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Phase 1: Create destination collections table for curated content
 */
final class Version20260104000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Phase 1: Create destination_collection table and junction table for curated collections';
    }

    public function up(Schema $schema): void
    {
        // Create destination_collection table
        $this->addSql('CREATE TABLE destination_collection (
            id INT AUTO_INCREMENT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description LONGTEXT DEFAULT NULL,
            slug VARCHAR(255) NOT NULL,
            type VARCHAR(50) DEFAULT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            display_order INT DEFAULT NULL,
            cover_image VARCHAR(500) DEFAULT NULL,
            destination_orders JSON DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            UNIQUE INDEX UNIQ_collection_slug (slug),
            INDEX IDX_collection_active (is_active, display_order),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Create junction table for collection-destination many-to-many
        $this->addSql('CREATE TABLE destination_collection_items (
            collection_id INT NOT NULL,
            destination_id INT NOT NULL,
            INDEX IDX_collection_items_collection (collection_id),
            INDEX IDX_collection_items_destination (destination_id),
            PRIMARY KEY(collection_id, destination_id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Add foreign keys
        $this->addSql('ALTER TABLE destination_collection_items 
            ADD CONSTRAINT FK_collection_items_collection 
            FOREIGN KEY (collection_id) REFERENCES destination_collection (id) ON DELETE CASCADE');

        $this->addSql('ALTER TABLE destination_collection_items 
            ADD CONSTRAINT FK_collection_items_destination 
            FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE destination_collection_items DROP FOREIGN KEY FK_collection_items_collection');
        $this->addSql('ALTER TABLE destination_collection_items DROP FOREIGN KEY FK_collection_items_destination');
        $this->addSql('DROP TABLE destination_collection_items');
        $this->addSql('DROP TABLE destination_collection');
    }
}

