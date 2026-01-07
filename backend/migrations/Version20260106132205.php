<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260106132205 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Check if tables exist before creating them
        $connection = $this->connection;
        $schemaManager = $connection->createSchemaManager();
        $tables = $schemaManager->listTableNames();

        // Create agent_message table if it doesn't exist
        if (!in_array('agent_message', $tables)) {
            $this->addSql('CREATE TABLE agent_message (id INT AUTO_INCREMENT NOT NULL, agent_id INT NOT NULL, client_id INT NOT NULL, booking_id INT DEFAULT NULL, subject VARCHAR(255) NOT NULL, message LONGTEXT NOT NULL, `read` TINYINT(1) DEFAULT 0 NOT NULL, direction VARCHAR(10) DEFAULT \'TO_CLIENT\' NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_64EE52D53414710B (agent_id), INDEX IDX_64EE52D519EB6921 (client_id), INDEX IDX_64EE52D53301C60 (booking_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            $this->addSql('ALTER TABLE agent_message ADD CONSTRAINT FK_64EE52D53414710B FOREIGN KEY (agent_id) REFERENCES `user` (id) ON DELETE CASCADE');
            $this->addSql('ALTER TABLE agent_message ADD CONSTRAINT FK_64EE52D519EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id) ON DELETE CASCADE');
            $this->addSql('ALTER TABLE agent_message ADD CONSTRAINT FK_64EE52D53301C60 FOREIGN KEY (booking_id) REFERENCES booking (id) ON DELETE SET NULL');
        }

        // Create commission table if it doesn't exist
        if (!in_array('commission', $tables)) {
            $this->addSql('CREATE TABLE commission (id INT AUTO_INCREMENT NOT NULL, agent_id INT NOT NULL, booking_id INT NOT NULL, amount NUMERIC(10, 2) NOT NULL, percentage NUMERIC(5, 2) DEFAULT \'10.00\' NOT NULL, status VARCHAR(20) DEFAULT \'PENDING\' NOT NULL, paid_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_1C6501583414710B (agent_id), INDEX IDX_1C6501583301C60 (booking_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            $this->addSql('ALTER TABLE commission ADD CONSTRAINT FK_1C6501583414710B FOREIGN KEY (agent_id) REFERENCES `user` (id) ON DELETE CASCADE');
            $this->addSql('ALTER TABLE commission ADD CONSTRAINT FK_1C6501583301C60 FOREIGN KEY (booking_id) REFERENCES booking (id) ON DELETE CASCADE');
        }

        // Handle agent_application table changes (only if table exists)
        if (in_array('agent_application', $tables)) {
            // Check foreign keys using information_schema
            $fkCheck = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'agent_application' 
                 AND CONSTRAINT_NAME = 'FK_34958681A76ED395'"
            );
            
            if ($fkCheck > 0) {
                $this->addSql('ALTER TABLE agent_application DROP FOREIGN KEY FK_34958681A76ED395');
            }
            
            // Check indexes
            $idxCheck = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'agent_application' 
                 AND INDEX_NAME = 'idx_agent_application_user'"
            );
            if ($idxCheck > 0) {
                $this->addSql('DROP INDEX idx_agent_application_user ON agent_application');
            }
            
            $idxCheck2 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'agent_application' 
                 AND INDEX_NAME = 'IDX_34958681A76ED395'"
            );
            if ($idxCheck2 == 0) {
                $this->addSql('CREATE INDEX IDX_34958681A76ED395 ON agent_application (user_id)');
            }
            
            // Check and drop ALL foreign keys on reviewed_by first (if they exist)
            // Get all foreign keys that reference reviewed_by column
            $fkNames = $connection->fetchFirstColumn(
                "SELECT CONSTRAINT_NAME 
                 FROM information_schema.TABLE_CONSTRAINTS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'agent_application' 
                 AND CONSTRAINT_TYPE = 'FOREIGN KEY'
                 AND CONSTRAINT_NAME IN (
                     SELECT CONSTRAINT_NAME 
                     FROM information_schema.KEY_COLUMN_USAGE 
                     WHERE TABLE_SCHEMA = DATABASE() 
                     AND TABLE_NAME = 'agent_application' 
                     AND COLUMN_NAME = 'reviewed_by'
                     AND REFERENCED_TABLE_NAME IS NOT NULL
                 )"
            );
            
            // Drop each foreign key that exists
            foreach ($fkNames as $fkName) {
                if ($fkName) {
                    $this->addSql("ALTER TABLE agent_application DROP FOREIGN KEY `{$fkName}`");
                }
            }
            
            // Now we can safely drop the index (check both uppercase and lowercase)
            $idxCheck3 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'agent_application' 
                 AND (INDEX_NAME = 'idx_agent_application_reviewed' OR INDEX_NAME = 'IDX_agent_application_reviewed')"
            );
            if ($idxCheck3 > 0) {
                // Get the actual index name
                $actualIdxName = $connection->fetchOne(
                    "SELECT INDEX_NAME FROM information_schema.STATISTICS 
                     WHERE TABLE_SCHEMA = DATABASE() 
                     AND TABLE_NAME = 'agent_application' 
                     AND (INDEX_NAME = 'idx_agent_application_reviewed' OR INDEX_NAME = 'IDX_agent_application_reviewed')
                     LIMIT 1"
                );
                if ($actualIdxName) {
                    $this->addSql("DROP INDEX {$actualIdxName} ON agent_application");
                }
            }
            
            // Create new index if it doesn't exist
            $idxCheck4 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'agent_application' 
                 AND INDEX_NAME = 'IDX_3495868185D7FB47'"
            );
            if ($idxCheck4 == 0) {
                $this->addSql('CREATE INDEX IDX_3495868185D7FB47 ON agent_application (reviewed_by)');
            }
            
            // Re-add foreign key if it doesn't exist
            $fkCheck2 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'agent_application' 
                 AND CONSTRAINT_NAME = 'FK_3495868185D7FB47'"
            );
            if ($fkCheck2 == 0) {
                $this->addSql('ALTER TABLE agent_application ADD CONSTRAINT FK_3495868185D7FB47 FOREIGN KEY (reviewed_by) REFERENCES `user` (id) ON DELETE SET NULL');
            }
            
            $fkCheck3 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'agent_application' 
                 AND CONSTRAINT_NAME = 'FK_34958681A76ED395'"
            );
            if ($fkCheck3 == 0) {
                $this->addSql('ALTER TABLE agent_application ADD CONSTRAINT FK_34958681A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE SET NULL');
            }
        }

        // Handle booking table changes (only if table exists)
        if (in_array('booking', $tables)) {
            // Check and drop index if it exists
            $idxCheck = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND INDEX_NAME = 'IDX_booking_status'"
            );
            if ($idxCheck > 0) {
                $this->addSql('DROP INDEX IDX_booking_status ON booking');
            }
            
            // Drop foreign keys only if they exist
            $fkCheck = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND CONSTRAINT_NAME = 'FK_booking_user'"
            );
            if ($fkCheck > 0) {
                $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_booking_user');
            }
            
            $fkCheck2 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND CONSTRAINT_NAME = 'FK_booking_agent'"
            );
            if ($fkCheck2 > 0) {
                $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_booking_agent');
            }
            
            $fkCheck3 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND CONSTRAINT_NAME = 'FK_booking_destination'"
            );
            if ($fkCheck3 > 0) {
                $this->addSql('ALTER TABLE booking DROP FOREIGN KEY FK_booking_destination');
            }
            
            // Handle indexes
            $idxCheck2 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND INDEX_NAME = 'uniq_booking_reference'"
            );
            if ($idxCheck2 > 0) {
                $this->addSql('DROP INDEX uniq_booking_reference ON booking');
            }
            
            $idxCheck3 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND INDEX_NAME = 'UNIQ_E00CEDDE3D918210'"
            );
            if ($idxCheck3 == 0) {
                $this->addSql('CREATE UNIQUE INDEX UNIQ_E00CEDDE3D918210 ON booking (booking_reference)');
            }
            
            $idxCheck4 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND INDEX_NAME = 'idx_booking_user'"
            );
            if ($idxCheck4 > 0) {
                $this->addSql('DROP INDEX idx_booking_user ON booking');
            }
            
            $idxCheck5 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND INDEX_NAME = 'IDX_E00CEDDEA76ED395'"
            );
            if ($idxCheck5 == 0) {
                $this->addSql('CREATE INDEX IDX_E00CEDDEA76ED395 ON booking (user_id)');
            }
            
            $idxCheck6 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND INDEX_NAME = 'idx_booking_destination'"
            );
            if ($idxCheck6 > 0) {
                $this->addSql('DROP INDEX idx_booking_destination ON booking');
            }
            
            $idxCheck7 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND INDEX_NAME = 'IDX_E00CEDDE816C6140'"
            );
            if ($idxCheck7 == 0) {
                $this->addSql('CREATE INDEX IDX_E00CEDDE816C6140 ON booking (destination_id)');
            }
            
            $idxCheck8 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND INDEX_NAME = 'idx_booking_agent'"
            );
            if ($idxCheck8 > 0) {
                $this->addSql('DROP INDEX idx_booking_agent ON booking');
            }
            
            $idxCheck9 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.STATISTICS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND INDEX_NAME = 'IDX_E00CEDDE3414710B'"
            );
            if ($idxCheck9 == 0) {
                $this->addSql('CREATE INDEX IDX_E00CEDDE3414710B ON booking (agent_id)');
            }
            
            // Add foreign keys if they don't exist
            $fkCheck4 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND CONSTRAINT_NAME = 'FK_booking_user'"
            );
            if ($fkCheck4 == 0) {
                $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_booking_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
            }
            
            $fkCheck5 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND CONSTRAINT_NAME = 'FK_booking_agent'"
            );
            if ($fkCheck5 == 0) {
                $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_booking_agent FOREIGN KEY (agent_id) REFERENCES user (id) ON DELETE SET NULL');
            }
            
            $fkCheck6 = $connection->fetchOne(
                "SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                 WHERE TABLE_SCHEMA = DATABASE() 
                 AND TABLE_NAME = 'booking' 
                 AND CONSTRAINT_NAME = 'FK_booking_destination'"
            );
            if ($fkCheck6 == 0) {
                $this->addSql('ALTER TABLE booking ADD CONSTRAINT FK_booking_destination FOREIGN KEY (destination_id) REFERENCES destination (id) ON DELETE CASCADE');
            }
        }

        // Handle itinerary table change (only if table exists)
        if (in_array('itinerary', $tables)) {
            $this->addSql('ALTER TABLE itinerary CHANGE cost cost NUMERIC(10, 2) DEFAULT \'0\' NOT NULL');
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE agent_message DROP FOREIGN KEY FK_64EE52D53414710B');
        $this->addSql('ALTER TABLE agent_message DROP FOREIGN KEY FK_64EE52D519EB6921');
        $this->addSql('ALTER TABLE agent_message DROP FOREIGN KEY FK_64EE52D53301C60');
        $this->addSql('ALTER TABLE commission DROP FOREIGN KEY FK_1C6501583414710B');
        $this->addSql('ALTER TABLE commission DROP FOREIGN KEY FK_1C6501583301C60');
        $this->addSql('DROP TABLE agent_message');
        $this->addSql('DROP TABLE commission');
        $this->addSql('ALTER TABLE agent_application DROP FOREIGN KEY FK_3495868185D7FB47');
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
        $this->addSql('ALTER TABLE itinerary CHANGE cost cost NUMERIC(10, 2) DEFAULT \'0.00\' NOT NULL');
    }
}
