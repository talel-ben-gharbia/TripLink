<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration for Booking and Agent Application system
 */
final class Version20250115000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create booking and agent_application tables';
    }

    public function up(Schema $schema): void
    {
        // Create booking table
        $this->addSql('CREATE TABLE IF NOT EXISTS booking (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            destination_id INT NOT NULL,
            agent_id INT DEFAULT NULL,
            booking_type VARCHAR(20) NOT NULL,
            check_in_date DATE NOT NULL,
            check_out_date DATE DEFAULT NULL,
            number_of_guests INT NOT NULL,
            total_price NUMERIC(10, 2) NOT NULL,
            status VARCHAR(20) DEFAULT \'PENDING\' NOT NULL,
            payment_status VARCHAR(20) DEFAULT \'PENDING\' NOT NULL,
            stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
            booking_reference VARCHAR(50) NOT NULL,
            special_requests LONGTEXT DEFAULT NULL,
            contact_email VARCHAR(255) NOT NULL,
            contact_phone VARCHAR(50) DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            confirmed_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            cancelled_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            cancellation_reason LONGTEXT DEFAULT NULL,
            UNIQUE INDEX UNIQ_booking_reference (booking_reference),
            INDEX IDX_booking_user (user_id),
            INDEX IDX_booking_destination (destination_id),
            INDEX IDX_booking_agent (agent_id),
            INDEX IDX_booking_status (status),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Create agent_application table
        $this->addSql('CREATE TABLE IF NOT EXISTS agent_application (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            company_name VARCHAR(255) DEFAULT NULL,
            license_number VARCHAR(100) DEFAULT NULL,
            years_experience INT DEFAULT NULL,
            specializations JSON DEFAULT NULL,
            motivation LONGTEXT DEFAULT NULL,
            status VARCHAR(20) DEFAULT \'PENDING\' NOT NULL,
            admin_notes LONGTEXT DEFAULT NULL,
            reviewed_by INT DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            reviewed_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_agent_application_user (user_id),
            INDEX IDX_agent_application_status (status),
            INDEX IDX_agent_application_reviewed (reviewed_by),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Add foreign keys
        $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_booking_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_booking_destination FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_booking_agent FOREIGN KEY (agent_id) REFERENCES `user` (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE agent_application ADD CONSTRAINT FK_agent_application_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE agent_application ADD CONSTRAINT FK_agent_application_reviewed FOREIGN KEY (reviewed_by) REFERENCES `user` (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_booking_user');
        $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_booking_destination');
        $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_booking_agent');
        $this->addSql('ALTER TABLE agent_application DROP FOREIGN KEY FK_agent_application_user');
        $this->addSql('ALTER TABLE agent_application DROP FOREIGN KEY FK_agent_application_reviewed');
        $this->addSql('DROP TABLE booking');
        $this->addSql('DROP TABLE agent_application');
    }
}


