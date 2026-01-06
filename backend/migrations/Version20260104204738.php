<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260104204738 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        // Create activity_log table if it doesn't exist
        $this->addSql('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, action_type VARCHAR(50) NOT NULL, entity_type VARCHAR(50) DEFAULT NULL, entity_id INT DEFAULT NULL, metadata JSON DEFAULT NULL COMMENT \'(DC2Type:json)\', created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX idx_activity_user (user_id), INDEX idx_activity_created (created_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        // Add foreign key if it doesn't exist
        $this->addSql('SET @exist := (SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = \'activity_log\' AND constraint_name = \'FK_FD06F647A76ED395\');
        SET @sqlstmt := IF(@exist = 0, \'ALTER TABLE activity_log ADD CONSTRAINT FK_FD06F647A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE\', \'SELECT 1\');
        PREPARE stmt FROM @sqlstmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;');
        
        // Add is_public column to destination_review if it doesn't exist
        $this->addSql('SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = \'destination_review\' AND column_name = \'is_public\');
        SET @sqlstmt := IF(@exist = 0, \'ALTER TABLE destination_review ADD is_public TINYINT(1) DEFAULT 1 NOT NULL\', \'SELECT 1\');
        PREPARE stmt FROM @sqlstmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE activity_log DROP FOREIGN KEY FK_FD06F647A76ED395');
        $this->addSql('DROP TABLE activity_log');
        $this->addSql('CREATE INDEX IDX_destination_featured ON destination (is_featured, display_order)');
        $this->addSql('CREATE INDEX IDX_destination_search ON destination (name, country)');
        $this->addSql('CREATE INDEX IDX_destination_pinned ON destination (is_pinned, display_order)');
        $this->addSql('CREATE INDEX IDX_collection_active ON destination_collection (is_active, display_order)');
        $this->addSql('DROP INDEX uniq_a174fe80989d9b62 ON destination_collection');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_collection_slug ON destination_collection (slug)');
        $this->addSql('ALTER TABLE destination_collection_items DROP FOREIGN KEY FK_BE75FFA9514956FD');
        $this->addSql('ALTER TABLE destination_collection_items DROP FOREIGN KEY FK_BE75FFA9816C6140');
        $this->addSql('DROP INDEX idx_be75ffa9514956fd ON destination_collection_items');
        $this->addSql('CREATE INDEX IDX_collection_items_collection ON destination_collection_items (collection_id)');
        $this->addSql('DROP INDEX idx_be75ffa9816c6140 ON destination_collection_items');
        $this->addSql('CREATE INDEX IDX_collection_items_destination ON destination_collection_items (destination_id)');
        $this->addSql('ALTER TABLE destination_collection_items ADD CONSTRAINT FK_BE75FFA9514956FD FOREIGN KEY (collection_id) REFERENCES destination_collection (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE destination_collection_items ADD CONSTRAINT FK_BE75FFA9816C6140 FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE destination_review DROP is_public');
        $this->addSql('ALTER TABLE wishlist_item DROP FOREIGN KEY FK_6424F4E8A76ED395');
        $this->addSql('ALTER TABLE wishlist_item DROP FOREIGN KEY FK_6424F4E8816C6140');
        $this->addSql('DROP INDEX idx_6424f4e8a76ed395 ON wishlist_item');
        $this->addSql('CREATE INDEX IDX_wishlist_user ON wishlist_item (user_id)');
        $this->addSql('DROP INDEX idx_6424f4e8816c6140 ON wishlist_item');
        $this->addSql('CREATE INDEX IDX_wishlist_destination ON wishlist_item (destination_id)');
        $this->addSql('ALTER TABLE wishlist_item ADD CONSTRAINT FK_6424F4E8A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE wishlist_item ADD CONSTRAINT FK_6424F4E8816C6140 FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE');
    }
}
