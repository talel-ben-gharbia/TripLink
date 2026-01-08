<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration: Create FAQ table for managing frequently asked questions
 */
final class Version20260108000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create FAQ table for managing frequently asked questions';
    }

    public function up(Schema $schema): void
    {
        // Check if table exists before creating
        $connection = $this->connection;
        $schemaManager = $connection->createSchemaManager();
        $tables = $schemaManager->listTableNames();

        if (!in_array('faq', $tables)) {
            $this->addSql('CREATE TABLE faq (
                id INT AUTO_INCREMENT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                display_order INT DEFAULT 0 NOT NULL,
                is_active TINYINT(1) DEFAULT 1 NOT NULL,
                created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
                updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE faq');
    }
}



