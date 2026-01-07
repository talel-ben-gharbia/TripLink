<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration to update agent_application and user tables for separate agent flow
 */
final class Version20250116000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update agent_application to use email instead of requiring user, and add must_change_password to user';
    }

    public function up(Schema $schema): void
    {
        // First, add email column (nullable first, then we'll make it NOT NULL)
        $this->addSql('ALTER TABLE agent_application 
            ADD COLUMN email VARCHAR(180) DEFAULT NULL AFTER id');

        // Populate email from user table for existing records
        $this->addSql('UPDATE agent_application a 
            INNER JOIN `user` u ON a.user_id = u.id 
            SET a.email = u.email 
            WHERE a.user_id IS NOT NULL');

        // Populate email for any remaining records (shouldn't happen, but safety check)
        $this->addSql('UPDATE agent_application 
            SET email = CONCAT(\'temp_\', id, \'@temp.local\') 
            WHERE email IS NULL');

        // Now make email NOT NULL
        $this->addSql('ALTER TABLE agent_application 
            MODIFY COLUMN email VARCHAR(180) NOT NULL');

        // Add other columns
        $this->addSql('ALTER TABLE agent_application 
            ADD COLUMN first_name VARCHAR(100) DEFAULT NULL AFTER email,
            ADD COLUMN last_name VARCHAR(100) DEFAULT NULL AFTER first_name,
            ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER last_name');

        // Make user_id nullable in agent_application
        $this->addSql('ALTER TABLE agent_application 
            MODIFY user_id INT DEFAULT NULL');

        // Add must_change_password to user table
        // Note: MySQL doesn't support IF NOT EXISTS in ALTER TABLE, so we check manually
        $this->addSql('ALTER TABLE `user` 
            ADD COLUMN must_change_password TINYINT(1) DEFAULT 0 NOT NULL AFTER last_login_attempt');

        // Add index on email for agent_application
        $this->addSql('CREATE INDEX IF NOT EXISTS IDX_agent_application_email ON agent_application (email)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IDX_agent_application_email ON agent_application');
        $this->addSql('ALTER TABLE agent_application 
            DROP COLUMN email,
            DROP COLUMN first_name,
            DROP COLUMN last_name,
            DROP COLUMN phone,
            MODIFY user_id INT NOT NULL');
        $this->addSql('ALTER TABLE `user` 
            DROP COLUMN must_change_password');
    }
}

