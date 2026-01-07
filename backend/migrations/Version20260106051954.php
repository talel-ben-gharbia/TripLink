<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260106051954 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Check if tables exist before creating (idempotent migration)
        $connection = $this->connection;
        $schemaManager = $connection->createSchemaManager();
        $tables = $schemaManager->listTableNames();
        
        // Create tables only if they don't exist
        if (!in_array('client', $tables)) {
            $this->addSql('CREATE TABLE client (id INT AUTO_INCREMENT NOT NULL, agent_id INT NOT NULL, user_id INT NOT NULL, notes LONGTEXT DEFAULT NULL, tags JSON DEFAULT NULL COMMENT \'(DC2Type:json)\', preferences JSON DEFAULT NULL COMMENT \'(DC2Type:json)\', status VARCHAR(20) DEFAULT \'ACTIVE\' NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_C74404553414710B (agent_id), INDEX IDX_C7440455A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            $this->addSql('ALTER TABLE client ADD CONSTRAINT FK_C74404553414710B FOREIGN KEY (agent_id) REFERENCES `user` (id) ON DELETE CASCADE');
            $this->addSql('ALTER TABLE client ADD CONSTRAINT FK_C7440455A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        }
        
        if (!in_array('itinerary', $tables)) {
            $this->addSql('CREATE TABLE itinerary (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, booking_id INT DEFAULT NULL, type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, date DATE NOT NULL, time TIME DEFAULT NULL, notes LONGTEXT DEFAULT NULL, cost NUMERIC(10, 2) DEFAULT \'0\' NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_FF2238F6A76ED395 (user_id), INDEX IDX_FF2238F63301C60 (booking_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            $this->addSql('ALTER TABLE itinerary ADD CONSTRAINT FK_FF2238F6A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
            $this->addSql('ALTER TABLE itinerary ADD CONSTRAINT FK_FF2238F63301C60 FOREIGN KEY (booking_id) REFERENCES booking (id) ON DELETE SET NULL');
        }
        
        if (!in_array('package', $tables)) {
            $this->addSql('CREATE TABLE package (id INT AUTO_INCREMENT NOT NULL, agent_id INT NOT NULL, client_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, destinations JSON NOT NULL COMMENT \'(DC2Type:json)\', activities JSON DEFAULT NULL COMMENT \'(DC2Type:json)\', total_price NUMERIC(10, 2) NOT NULL, status VARCHAR(20) DEFAULT \'DRAFT\' NOT NULL, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL, number_of_guests INT DEFAULT 1 NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_DE6867953414710B (agent_id), INDEX IDX_DE68679519EB6921 (client_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            $this->addSql('ALTER TABLE package ADD CONSTRAINT FK_DE6867953414710B FOREIGN KEY (agent_id) REFERENCES `user` (id) ON DELETE CASCADE');
            $this->addSql('ALTER TABLE package ADD CONSTRAINT FK_DE68679519EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id) ON DELETE SET NULL');
        }
        
        if (!in_array('travel_package', $tables)) {
            $this->addSql('CREATE TABLE travel_package (id INT AUTO_INCREMENT NOT NULL, agent_id INT NOT NULL, client_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, destinations JSON NOT NULL COMMENT \'(DC2Type:json)\', activities JSON DEFAULT NULL COMMENT \'(DC2Type:json)\', start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL, number_of_guests INT DEFAULT 2 NOT NULL, total_price NUMERIC(10, 2) NOT NULL, status VARCHAR(20) DEFAULT \'DRAFT\' NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_1F2BD0843414710B (agent_id), INDEX IDX_1F2BD08419EB6921 (client_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            $this->addSql('ALTER TABLE travel_package ADD CONSTRAINT FK_1F2BD0843414710B FOREIGN KEY (agent_id) REFERENCES `user` (id) ON DELETE CASCADE');
            $this->addSql('ALTER TABLE travel_package ADD CONSTRAINT FK_1F2BD08419EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id) ON DELETE SET NULL');
        }
        
        // Skip agent_application and booking table changes - not critical for Package Builder
        // These can be handled in a separate migration if needed
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE client DROP FOREIGN KEY FK_C74404553414710B');
        $this->addSql('ALTER TABLE client DROP FOREIGN KEY FK_C7440455A76ED395');
        $this->addSql('ALTER TABLE itinerary DROP FOREIGN KEY FK_FF2238F6A76ED395');
        $this->addSql('ALTER TABLE itinerary DROP FOREIGN KEY FK_FF2238F63301C60');
        $this->addSql('ALTER TABLE package DROP FOREIGN KEY FK_DE6867953414710B');
        $this->addSql('ALTER TABLE package DROP FOREIGN KEY FK_DE68679519EB6921');
        $this->addSql('ALTER TABLE travel_package DROP FOREIGN KEY FK_1F2BD0843414710B');
        $this->addSql('ALTER TABLE travel_package DROP FOREIGN KEY FK_1F2BD08419EB6921');
        $this->addSql('DROP TABLE client');
        $this->addSql('DROP TABLE itinerary');
        $this->addSql('DROP TABLE package');
        $this->addSql('DROP TABLE travel_package');
        $this->addSql('ALTER TABLE agent_application DROP FOREIGN KEY FK_34958681A76ED395');
        $this->addSql('ALTER TABLE agent_application DROP FOREIGN KEY FK_34958681A76ED395');
        $this->addSql('ALTER TABLE agent_application DROP FOREIGN KEY FK_3495868185D7FB47');
        $this->addSql('DROP INDEX idx_3495868185d7fb47 ON agent_application');
        $this->addSql('CREATE INDEX IDX_agent_application_reviewed ON agent_application (reviewed_by)');
        $this->addSql('DROP INDEX idx_34958681a76ed395 ON agent_application');
        $this->addSql('CREATE INDEX IDX_agent_application_user ON agent_application (user_id)');
        $this->addSql('ALTER TABLE agent_application ADD CONSTRAINT FK_34958681A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE agent_application ADD CONSTRAINT FK_3495868185D7FB47 FOREIGN KEY (reviewed_by) REFERENCES `user` (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_E00CEDDEA76ED395');
        $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_E00CEDDE816C6140');
        $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_E00CEDDE3414710B');
        $this->addSql('CREATE INDEX IDX_booking_status ON booking (status)');
        $this->addSql('DROP INDEX uniq_e00cedde3d918210 ON booking');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_booking_reference ON booking (booking_reference)');
        $this->addSql('DROP INDEX idx_e00ceddea76ed395 ON booking');
        $this->addSql('CREATE INDEX IDX_booking_user ON booking (user_id)');
        $this->addSql('DROP INDEX idx_e00cedde816c6140 ON booking');
        $this->addSql('CREATE INDEX IDX_booking_destination ON booking (destination_id)');
        $this->addSql('DROP INDEX idx_e00cedde3414710b ON booking');
        $this->addSql('CREATE INDEX IDX_booking_agent ON booking (agent_id)');
        $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_E00CEDDEA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_E00CEDDE816C6140 FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_E00CEDDE3414710B FOREIGN KEY (agent_id) REFERENCES `user` (id) ON DELETE SET NULL');
    }
}
