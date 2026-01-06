<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260104204717 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX IDX_destination_featured ON destination');
        $this->addSql('DROP INDEX IDX_destination_search ON destination');
        $this->addSql('DROP INDEX IDX_destination_pinned ON destination');
        $this->addSql('DROP INDEX IDX_collection_active ON destination_collection');
        $this->addSql('DROP INDEX uniq_collection_slug ON destination_collection');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_A174FE80989D9B62 ON destination_collection (slug)');
        $this->addSql('ALTER TABLE destination_collection_items DROP FOREIGN KEY FK_collection_items_collection');
        $this->addSql('ALTER TABLE destination_collection_items DROP FOREIGN KEY FK_collection_items_destination');
        $this->addSql('DROP INDEX idx_collection_items_collection ON destination_collection_items');
        $this->addSql('CREATE INDEX IDX_BE75FFA9514956FD ON destination_collection_items (collection_id)');
        $this->addSql('DROP INDEX idx_collection_items_destination ON destination_collection_items');
        $this->addSql('CREATE INDEX IDX_BE75FFA9816C6140 ON destination_collection_items (destination_id)');
        $this->addSql('ALTER TABLE destination_collection_items ADD CONSTRAINT FK_collection_items_collection FOREIGN KEY (collection_id) REFERENCES destination_collection (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE destination_collection_items ADD CONSTRAINT FK_collection_items_destination FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE destination_review ADD is_public TINYINT(1) DEFAULT 1 NOT NULL');
        $this->addSql('ALTER TABLE wishlist_item DROP FOREIGN KEY FK_wishlist_destination');
        $this->addSql('ALTER TABLE wishlist_item DROP FOREIGN KEY FK_wishlist_user');
        $this->addSql('DROP INDEX idx_wishlist_user ON wishlist_item');
        $this->addSql('CREATE INDEX IDX_6424F4E8A76ED395 ON wishlist_item (user_id)');
        $this->addSql('DROP INDEX idx_wishlist_destination ON wishlist_item');
        $this->addSql('CREATE INDEX IDX_6424F4E8816C6140 ON wishlist_item (destination_id)');
        $this->addSql('ALTER TABLE wishlist_item ADD CONSTRAINT FK_wishlist_destination FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE wishlist_item ADD CONSTRAINT FK_wishlist_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
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
