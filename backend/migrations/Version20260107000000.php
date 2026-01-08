<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration: Create travel_document table for document management
 */
final class Version20260107000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create travel_document table for managing user travel documents (passports, visas, etc.)';
    }

    public function up(Schema $schema): void
    {
        // Check if table exists before creating
        $connection = $this->connection;
        $schemaManager = $connection->createSchemaManager();
        $tables = $schemaManager->listTableNames();

        if (!in_array('travel_document', $tables)) {
            $this->addSql('CREATE TABLE travel_document (
                id INT AUTO_INCREMENT NOT NULL,
                user_id INT NOT NULL,
                document_type VARCHAR(50) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_size INT NOT NULL,
                mime_type VARCHAR(100) NOT NULL,
                extracted_data JSON DEFAULT NULL COMMENT \'(DC2Type:json)\',
                document_number VARCHAR(100) DEFAULT NULL,
                expiration_date DATE DEFAULT NULL,
                issue_date DATE DEFAULT NULL,
                country VARCHAR(100) DEFAULT NULL,
                is_verified TINYINT(1) DEFAULT 0 NOT NULL,
                created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
                updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
                INDEX IDX_TRAVEL_DOC_USER (user_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            
            $this->addSql('ALTER TABLE travel_document ADD CONSTRAINT FK_TRAVEL_DOC_USER FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE travel_document DROP FOREIGN KEY FK_TRAVEL_DOC_USER');
        $this->addSql('DROP TABLE travel_document');
    }
}



