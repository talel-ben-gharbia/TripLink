<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251110153931 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE auth_session DROP FOREIGN KEY FK_auth_session_user');
        $this->addSql('ALTER TABLE auth_session DROP FOREIGN KEY FK_auth_session_user');
        $this->addSql('ALTER TABLE auth_session CHANGE jwt_token jwt_token LONGTEXT NOT NULL');
        $this->addSql('ALTER TABLE auth_session ADD CONSTRAINT FK_9E60F527A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('DROP INDEX uniq_auth_session_id ON auth_session');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_9E60F527613FECDF ON auth_session (session_id)');
        $this->addSql('DROP INDEX idx_auth_session_user ON auth_session');
        $this->addSql('CREATE INDEX IDX_9E60F527A76ED395 ON auth_session (user_id)');
        $this->addSql('ALTER TABLE auth_session ADD CONSTRAINT FK_auth_session_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE blacklisted_token DROP FOREIGN KEY FK_blacklist_user');
        $this->addSql('DROP INDEX idx_blacklist_user_token ON blacklisted_token');
        $this->addSql('CREATE INDEX IDX_27D93664A76ED3955F37A13B ON blacklisted_token (user_id, token)');
        $this->addSql('ALTER TABLE blacklisted_token ADD CONSTRAINT FK_blacklist_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE email_verification DROP FOREIGN KEY FK_email_verification_user');
        $this->addSql('ALTER TABLE email_verification DROP FOREIGN KEY FK_email_verification_user');
        $this->addSql('ALTER TABLE email_verification ADD CONSTRAINT FK_FE22358A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('DROP INDEX uniq_email_verification_token ON email_verification');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FE223585F37A13B ON email_verification (token)');
        $this->addSql('DROP INDEX idx_email_verification_user ON email_verification');
        $this->addSql('CREATE INDEX IDX_FE22358A76ED395 ON email_verification (user_id)');
        $this->addSql('ALTER TABLE email_verification ADD CONSTRAINT FK_email_verification_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('DROP INDEX idx_login_email_ip ON login_attempt');
        $this->addSql('CREATE INDEX IDX_8C11C1BE7927C7422FFD58C ON login_attempt (email, ip_address)');
        $this->addSql('ALTER TABLE reset_password_request DROP FOREIGN KEY FK_reset_user');
        $this->addSql('ALTER TABLE reset_password_request DROP FOREIGN KEY FK_reset_user');
        $this->addSql('ALTER TABLE reset_password_request CHANGE used used TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE reset_password_request ADD CONSTRAINT FK_7CE748AA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('DROP INDEX uniq_reset_token ON reset_password_request');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7CE748A5F37A13B ON reset_password_request (token)');
        $this->addSql('DROP INDEX idx_reset_user ON reset_password_request');
        $this->addSql('CREATE INDEX IDX_7CE748AA76ED395 ON reset_password_request (user_id)');
        $this->addSql('ALTER TABLE reset_password_request ADD CONSTRAINT FK_reset_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user ADD login_attempts INT DEFAULT 0 NOT NULL, ADD last_login_attempt DATETIME DEFAULT NULL, CHANGE is_verified is_verified TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE user_activity DROP FOREIGN KEY FK_user_activity_user');
        $this->addSql('ALTER TABLE user_activity DROP FOREIGN KEY FK_user_activity_user');
        $this->addSql('ALTER TABLE user_activity ADD CONSTRAINT FK_4CF9ED5AA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('DROP INDEX uniq_user_activity_user ON user_activity');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_4CF9ED5AA76ED395 ON user_activity (user_id)');
        $this->addSql('ALTER TABLE user_activity ADD CONSTRAINT FK_user_activity_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_preferences DROP FOREIGN KEY FK_user_preferences_user');
        $this->addSql('ALTER TABLE user_preferences DROP FOREIGN KEY FK_user_preferences_user');
        $this->addSql('ALTER TABLE user_preferences ADD CONSTRAINT FK_402A6F60A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('DROP INDEX uniq_user_preferences_user ON user_preferences');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_402A6F60A76ED395 ON user_preferences (user_id)');
        $this->addSql('ALTER TABLE user_preferences ADD CONSTRAINT FK_user_preferences_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_profile DROP FOREIGN KEY FK_user_profile_user');
        $this->addSql('ALTER TABLE user_profile DROP FOREIGN KEY FK_user_profile_user');
        $this->addSql('ALTER TABLE user_profile ADD CONSTRAINT FK_D95AB405A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('DROP INDEX uniq_user_profile_user ON user_profile');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D95AB405A76ED395 ON user_profile (user_id)');
        $this->addSql('ALTER TABLE user_profile ADD CONSTRAINT FK_user_profile_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE auth_session DROP FOREIGN KEY FK_9E60F527A76ED395');
        $this->addSql('ALTER TABLE auth_session DROP FOREIGN KEY FK_9E60F527A76ED395');
        $this->addSql('ALTER TABLE auth_session CHANGE jwt_token jwt_token TEXT NOT NULL');
        $this->addSql('ALTER TABLE auth_session ADD CONSTRAINT FK_auth_session_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('DROP INDEX idx_9e60f527a76ed395 ON auth_session');
        $this->addSql('CREATE INDEX IDX_auth_session_user ON auth_session (user_id)');
        $this->addSql('DROP INDEX uniq_9e60f527613fecdf ON auth_session');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_auth_session_id ON auth_session (session_id)');
        $this->addSql('ALTER TABLE auth_session ADD CONSTRAINT FK_9E60F527A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE blacklisted_token DROP FOREIGN KEY FK_27D93664A76ED395');
        $this->addSql('DROP INDEX idx_27d93664a76ed3955f37a13b ON blacklisted_token');
        $this->addSql('CREATE INDEX IDX_blacklist_user_token ON blacklisted_token (user_id, token)');
        $this->addSql('ALTER TABLE blacklisted_token ADD CONSTRAINT FK_27D93664A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE email_verification DROP FOREIGN KEY FK_FE22358A76ED395');
        $this->addSql('ALTER TABLE email_verification DROP FOREIGN KEY FK_FE22358A76ED395');
        $this->addSql('ALTER TABLE email_verification ADD CONSTRAINT FK_email_verification_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('DROP INDEX idx_fe22358a76ed395 ON email_verification');
        $this->addSql('CREATE INDEX IDX_email_verification_user ON email_verification (user_id)');
        $this->addSql('DROP INDEX uniq_fe223585f37a13b ON email_verification');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_email_verification_token ON email_verification (token)');
        $this->addSql('ALTER TABLE email_verification ADD CONSTRAINT FK_FE22358A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('DROP INDEX idx_8c11c1be7927c7422ffd58c ON login_attempt');
        $this->addSql('CREATE INDEX IDX_login_email_ip ON login_attempt (email, ip_address)');
        $this->addSql('ALTER TABLE reset_password_request DROP FOREIGN KEY FK_7CE748AA76ED395');
        $this->addSql('ALTER TABLE reset_password_request DROP FOREIGN KEY FK_7CE748AA76ED395');
        $this->addSql('ALTER TABLE reset_password_request CHANGE used used TINYINT(1) DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE reset_password_request ADD CONSTRAINT FK_reset_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('DROP INDEX idx_7ce748aa76ed395 ON reset_password_request');
        $this->addSql('CREATE INDEX IDX_reset_user ON reset_password_request (user_id)');
        $this->addSql('DROP INDEX uniq_7ce748a5f37a13b ON reset_password_request');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_reset_token ON reset_password_request (token)');
        $this->addSql('ALTER TABLE reset_password_request ADD CONSTRAINT FK_7CE748AA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE `user` DROP login_attempts, DROP last_login_attempt, CHANGE is_verified is_verified TINYINT(1) DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE user_activity DROP FOREIGN KEY FK_4CF9ED5AA76ED395');
        $this->addSql('ALTER TABLE user_activity DROP FOREIGN KEY FK_4CF9ED5AA76ED395');
        $this->addSql('ALTER TABLE user_activity ADD CONSTRAINT FK_user_activity_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('DROP INDEX uniq_4cf9ed5aa76ed395 ON user_activity');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_user_activity_user ON user_activity (user_id)');
        $this->addSql('ALTER TABLE user_activity ADD CONSTRAINT FK_4CF9ED5AA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user_preferences DROP FOREIGN KEY FK_402A6F60A76ED395');
        $this->addSql('ALTER TABLE user_preferences DROP FOREIGN KEY FK_402A6F60A76ED395');
        $this->addSql('ALTER TABLE user_preferences ADD CONSTRAINT FK_user_preferences_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('DROP INDEX uniq_402a6f60a76ed395 ON user_preferences');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_user_preferences_user ON user_preferences (user_id)');
        $this->addSql('ALTER TABLE user_preferences ADD CONSTRAINT FK_402A6F60A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user_profile DROP FOREIGN KEY FK_D95AB405A76ED395');
        $this->addSql('ALTER TABLE user_profile DROP FOREIGN KEY FK_D95AB405A76ED395');
        $this->addSql('ALTER TABLE user_profile ADD CONSTRAINT FK_user_profile_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('DROP INDEX uniq_d95ab405a76ed395 ON user_profile');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_user_profile_user ON user_profile (user_id)');
        $this->addSql('ALTER TABLE user_profile ADD CONSTRAINT FK_D95AB405A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
    }
}
