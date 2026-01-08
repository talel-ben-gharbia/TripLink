<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Fix payment status for cancelled bookings
 */
final class Version20250117000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update payment status for cancelled bookings that still have PENDING payment status';
    }

    public function up(Schema $schema): void
    {
        // Update cancelled bookings with PENDING payment status to FAILED
        $this->addSql("
            UPDATE booking 
            SET payment_status = 'FAILED' 
            WHERE status = 'CANCELLED' 
            AND payment_status = 'PENDING'
        ");
    }

    public function down(Schema $schema): void
    {
        // This migration is not reversible as we can't determine original payment status
        // But we can set them back to PENDING if needed
        $this->addSql("
            UPDATE booking 
            SET payment_status = 'PENDING' 
            WHERE status = 'CANCELLED' 
            AND payment_status = 'FAILED'
        ");
    }
}




