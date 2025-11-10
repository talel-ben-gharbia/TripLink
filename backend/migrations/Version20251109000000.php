<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration: Restructure database according to UML diagram
 * Separates User into User, UserProfile, UserActivity, UserPreferences
 * Adds AuthSession and EmailVerification tables
 */
final class Version20251109000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Restructure database: Create separate tables for UserProfile, UserActivity, UserPreferences, AuthSession, EmailVerification';
    }

    public function up(Schema $schema): void
    {
        // Drop old user table and recreate with minimal fields
        $this->addSql('DROP TABLE IF EXISTS reset_password_request');
        $this->addSql('DROP TABLE IF EXISTS login_attempt');
        $this->addSql('DROP TABLE IF EXISTS blacklisted_token');
        $this->addSql('DROP TABLE IF EXISTS `user`');

        // Create minimal user table
        $this->addSql('CREATE TABLE `user` (
            id INT AUTO_INCREMENT NOT NULL,
            email VARCHAR(180) NOT NULL,
            password VARCHAR(255) NOT NULL,
            roles JSON NOT NULL,
            is_verified TINYINT(1) NOT NULL DEFAULT 0,
            status VARCHAR(20) NOT NULL DEFAULT \'PENDING\',
            token_version INT NOT NULL DEFAULT 1,
            UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Create user_profile table
        $this->addSql('CREATE TABLE user_profile (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            phone VARCHAR(15) NOT NULL,
            avatar VARCHAR(255) DEFAULT NULL,
            UNIQUE INDEX UNIQ_user_profile_user (user_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_user_profile_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Create user_activity table
        $this->addSql('CREATE TABLE user_activity (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            last_login DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            UNIQUE INDEX UNIQ_user_activity_user (user_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_user_activity_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Create user_preferences table
        $this->addSql('CREATE TABLE user_preferences (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            travel_styles JSON DEFAULT NULL,
            interests JSON DEFAULT NULL,
            budget_range VARCHAR(50) DEFAULT NULL,
            profile_completion INT NOT NULL DEFAULT 0,
            personality_axis JSON DEFAULT NULL,
            preference_categories JSON DEFAULT NULL,
            UNIQUE INDEX UNIQ_user_preferences_user (user_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_user_preferences_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Create auth_session table
        $this->addSql('CREATE TABLE auth_session (
            id INT AUTO_INCREMENT NOT NULL,
            session_id VARCHAR(255) NOT NULL,
            user_id INT NOT NULL,
            jwt_token TEXT NOT NULL,
            refresh_token VARCHAR(255) DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            expires_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            device_info VARCHAR(255) DEFAULT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            UNIQUE INDEX UNIQ_auth_session_id (session_id),
            INDEX IDX_auth_session_user (user_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_auth_session_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Create email_verification table
        $this->addSql('CREATE TABLE email_verification (
            id INT AUTO_INCREMENT NOT NULL,
            token VARCHAR(255) NOT NULL,
            user_id INT NOT NULL,
            email VARCHAR(180) NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            expires_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            is_verified TINYINT(1) NOT NULL DEFAULT 0,
            UNIQUE INDEX UNIQ_email_verification_token (token),
            INDEX IDX_email_verification_user (user_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_email_verification_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Recreate reset_password_request table
        $this->addSql('CREATE TABLE reset_password_request (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            used TINYINT(1) NOT NULL DEFAULT 0,
            UNIQUE INDEX UNIQ_reset_token (token),
            INDEX IDX_reset_user (user_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_reset_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Recreate login_attempt table
        $this->addSql('CREATE TABLE login_attempt (
            id INT AUTO_INCREMENT NOT NULL,
            email VARCHAR(180) NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            attempted_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            success TINYINT(1) NOT NULL,
            INDEX IDX_login_email_ip (email, ip_address),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Recreate blacklisted_token table
        $this->addSql('CREATE TABLE blacklisted_token (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            token VARCHAR(500) NOT NULL,
            blacklisted_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            expires_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_blacklist_user_token (user_id, token),
            PRIMARY KEY(id),
            CONSTRAINT FK_blacklist_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE blacklisted_token');
        $this->addSql('DROP TABLE login_attempt');
        $this->addSql('DROP TABLE reset_password_request');
        $this->addSql('DROP TABLE email_verification');
        $this->addSql('DROP TABLE auth_session');
        $this->addSql('DROP TABLE user_preferences');
        $this->addSql('DROP TABLE user_activity');
        $this->addSql('DROP TABLE user_profile');
        $this->addSql('DROP TABLE `user`');
    }
}

