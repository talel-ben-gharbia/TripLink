<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration to create notification table
 */
final class Version20260106034315 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create notification table for in-app notifications';
    }

    public function up(Schema $schema): void
    {
        // Check if notification table exists
        $connection = $this->connection;
        $schemaManager = $connection->createSchemaManager();
        $tables = $schemaManager->listTableNames();
        
        if (!in_array('notification', $tables)) {
            $this->addSql('CREATE TABLE notification (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, message LONGTEXT NOT NULL, `read` TINYINT(1) DEFAULT 0 NOT NULL, entity_type VARCHAR(50) DEFAULT NULL, entity_id INT DEFAULT NULL, action_url VARCHAR(500) DEFAULT NULL, metadata JSON DEFAULT NULL COMMENT \'(DC2Type:json)\', created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_BF5476CAA76ED395 (user_id), INDEX idx_user_read (user_id, `read`), INDEX idx_created_at (created_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            
            // Add foreign key
            $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CAA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        } else {
            // Table exists, check if foreign key exists
            try {
                $foreignKeys = $schemaManager->listTableForeignKeys('notification');
                $fkExists = false;
                foreach ($foreignKeys as $fk) {
                    if (strpos($fk->getName(), 'user_id') !== false || strpos($fk->getName(), 'BF5476CAA76ED395') !== false) {
                        $fkExists = true;
                        break;
                    }
                }
                if (!$fkExists) {
                    $this->addSql('ALTER TABLE notification ADD CONSTRAINT FK_BF5476CAA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
                }
            } catch (\Exception $e) {
                // Foreign key might already exist, continue
            }
        }
        
        // Update user_profile to allow nullable fields (if not already done)
        try {
            $columns = $schemaManager->listTableColumns('user_profile');
            if (isset($columns['first_name']) && $columns['first_name']->getNotnull()) {
                $this->addSql('ALTER TABLE user_profile MODIFY first_name VARCHAR(255) DEFAULT NULL');
            }
            if (isset($columns['last_name']) && $columns['last_name']->getNotnull()) {
                $this->addSql('ALTER TABLE user_profile MODIFY last_name VARCHAR(255) DEFAULT NULL');
            }
            if (isset($columns['phone']) && $columns['phone']->getNotnull()) {
                $this->addSql('ALTER TABLE user_profile MODIFY phone VARCHAR(15) DEFAULT NULL');
            }
        } catch (\Exception $e) {
            // Table might not exist or columns already nullable, continue
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE notification DROP FOREIGN KEY FK_BF5476CAA76ED395');
        $this->addSql('DROP TABLE notification');
        $this->addSql('ALTER TABLE user_profile MODIFY first_name VARCHAR(255) NOT NULL, MODIFY last_name VARCHAR(255) NOT NULL, MODIFY phone VARCHAR(15) NOT NULL');
    }
}
