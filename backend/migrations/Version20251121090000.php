<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251121090000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Seed initial destinations, demo users, and wishlists';
    }

    public function up(Schema $schema): void
    {
        // Seed destinations (idempotent)
        $this->addSql("INSERT INTO destination (name, country, city, category, description, tags, price_min, price_max, rating, images, created_at)
            SELECT 'Paris', 'France', 'Paris', 'city', 'City of lights and culture', NULL, 120, 280, 4.8, '[\"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80\"]', CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM destination WHERE name = 'Paris')");

        $this->addSql("INSERT INTO destination (name, country, city, category, description, tags, price_min, price_max, rating, images, created_at)
            SELECT 'Tokyo', 'Japan', 'Tokyo', 'city', 'Vibrant metropolis blending tradition and technology', NULL, 90, 220, 4.7, '[\"https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1600&q=80\"]', CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM destination WHERE name = 'Tokyo')");

        $this->addSql("INSERT INTO destination (name, country, city, category, description, tags, price_min, price_max, rating, images, created_at)
            SELECT 'Bali', 'Indonesia', 'Ubud', 'beach', 'Tropical paradise with rich culture', NULL, 70, 180, 4.6, '[\"https://images.unsplash.com/photo-1516997125298-4e3b7f0036d2?auto=format&fit=crop&w=1600&q=80\"]', CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM destination WHERE name = 'Bali')");

        $this->addSql("INSERT INTO destination (name, country, city, category, description, tags, price_min, price_max, rating, images, created_at)
            SELECT 'New York', 'USA', 'New York', 'city', 'Iconic skyline and endless attractions', NULL, 140, 320, 4.5, '[\"https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80\"]', CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM destination WHERE name = 'New York')");

        $this->addSql("INSERT INTO destination (name, country, city, category, description, tags, price_min, price_max, rating, images, created_at)
            SELECT 'Dubai', 'UAE', 'Dubai', 'luxury', 'Luxury shopping and modern architecture', NULL, 160, 380, 4.6, '[\"https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1600&q=80\"]', CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM destination WHERE name = 'Dubai')");

        $this->addSql("INSERT INTO destination (name, country, city, category, description, tags, price_min, price_max, rating, images, created_at)
            SELECT 'Barcelona', 'Spain', 'Barcelona', 'cultural', 'Gaudi architecture and Mediterranean vibes', NULL, 100, 240, 4.7, '[\"https://images.unsplash.com/photo-1544989164-311a6d12df5f?auto=format&fit=crop&w=1600&q=80\"]', CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM destination WHERE name = 'Barcelona')");

        $this->addSql("INSERT INTO destination (name, country, city, category, description, tags, price_min, price_max, rating, images, created_at)
            SELECT 'Santorini', 'Greece', 'Santorini', 'romance', 'Whitewashed cliffs and sunset views', NULL, 150, 350, 4.8, '[\"https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80\"]', CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM destination WHERE name = 'Santorini')");

        $this->addSql("INSERT INTO destination (name, country, city, category, description, tags, price_min, price_max, rating, images, created_at)
            SELECT 'Maldives', 'Maldives', NULL, 'beach', 'Crystal-clear waters and overwater villas', NULL, 200, 500, 4.9, '[\"https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1600&q=80\"]', CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM destination WHERE name = 'Maldives')");

        $this->addSql("INSERT INTO destination (name, country, city, category, description, tags, price_min, price_max, rating, images, created_at)
            SELECT 'Swiss Alps', 'Switzerland', 'Zermatt', 'mountain', 'Alpine peaks with world-class skiing', NULL, 130, 300, 4.7, '[\"https://images.unsplash.com/photo-1470777631079-1e18c5e0dc2d?auto=format&fit=crop&w=1600&q=80\"]', CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM destination WHERE name = 'Swiss Alps')");

        $this->addSql("INSERT INTO destination (name, country, city, category, description, tags, price_min, price_max, rating, images, created_at)
            SELECT 'Kyoto', 'Japan', 'Kyoto', 'cultural', 'Historic temples and serene gardens', NULL, 80, 200, 4.6, '[\"https://images.unsplash.com/photo-1465311440660-74f6d35b6a67?auto=format&fit=crop&w=1600&q=80\"]', CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM destination WHERE name = 'Kyoto')");

        // Seed demo users (idempotent). Password hashes are placeholders and not meant for login.
        $this->addSql("INSERT INTO `user` (email, password, roles, is_verified, status, token_version)
            SELECT 'demo1@triplink.test', 'demo-password-hash', '[\"ROLE_USER\"]', 1, 'ACTIVE', 1
            WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email = 'demo1@triplink.test')");
        $this->addSql("INSERT INTO `user` (email, password, roles, is_verified, status, token_version)
            SELECT 'demo2@triplink.test', 'demo-password-hash', '[\"ROLE_USER\"]', 1, 'ACTIVE', 1
            WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email = 'demo2@triplink.test')");
        $this->addSql("INSERT INTO `user` (email, password, roles, is_verified, status, token_version)
            SELECT 'demo3@triplink.test', 'demo-password-hash', '[\"ROLE_USER\"]', 1, 'ACTIVE', 1
            WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email = 'demo3@triplink.test')");

        // Profiles
        $this->addSql("INSERT INTO user_profile (user_id, first_name, last_name, phone, avatar)
            SELECT u.id, 'Demo', 'One', '1111111111', NULL FROM `user` u WHERE u.email = 'demo1@triplink.test'
            AND NOT EXISTS (SELECT 1 FROM user_profile up WHERE up.user_id = u.id)");
        $this->addSql("INSERT INTO user_profile (user_id, first_name, last_name, phone, avatar)
            SELECT u.id, 'Demo', 'Two', '2222222222', NULL FROM `user` u WHERE u.email = 'demo2@triplink.test'
            AND NOT EXISTS (SELECT 1 FROM user_profile up WHERE up.user_id = u.id)");
        $this->addSql("INSERT INTO user_profile (user_id, first_name, last_name, phone, avatar)
            SELECT u.id, 'Demo', 'Three', '3333333333', NULL FROM `user` u WHERE u.email = 'demo3@triplink.test'
            AND NOT EXISTS (SELECT 1 FROM user_profile up WHERE up.user_id = u.id)");

        // Preferences
        $this->addSql("INSERT INTO user_preferences (user_id, travel_styles, interests, budget_range, profile_completion, personality_axis, preference_categories)
            SELECT u.id, '[\"Adventure\",\"Budget\"]', '[\"Food\",\"Photography\"]', 'Medium', 60,
                   '{\"adventurous\":60,\"cultural\":50,\"luxury\":30,\"budget\":70,\"spontaneous\":55,\"planned\":45,\"social\":50,\"solo\":50}',
                   '{\"Accommodation\":{\"hotels\":60,\"hostels\":40,\"apartments\":50,\"resorts\":30}}'
            FROM `user` u WHERE u.email = 'demo1@triplink.test'
            AND NOT EXISTS (SELECT 1 FROM user_preferences p WHERE p.user_id = u.id)");
        $this->addSql("INSERT INTO user_preferences (user_id, travel_styles, interests, budget_range, profile_completion, personality_axis, preference_categories)
            SELECT u.id, '[\"Luxury\",\"Beach\"]', '[\"Shopping\",\"Food\"]', 'High', 65,
                   '{\"adventurous\":40,\"cultural\":55,\"luxury\":80,\"budget\":30,\"spontaneous\":50,\"planned\":60,\"social\":70,\"solo\":40}',
                   '{\"Food\":{\"fineDining\":80,\"local\":60}}'
            FROM `user` u WHERE u.email = 'demo2@triplink.test'
            AND NOT EXISTS (SELECT 1 FROM user_preferences p WHERE p.user_id = u.id)");
        $this->addSql("INSERT INTO user_preferences (user_id, travel_styles, interests, budget_range, profile_completion, personality_axis, preference_categories)
            SELECT u.id, '[\"Cultural\",\"Mountains\"]', '[\"Photography\",\"Shopping\"]', 'Low', 55,
                   '{\"adventurous\":70,\"cultural\":75,\"luxury\":20,\"budget\":80,\"spontaneous\":60,\"planned\":50,\"social\":45,\"solo\":65}',
                   '{\"Activities\":{\"adventure\":70,\"culture\":80}}'
            FROM `user` u WHERE u.email = 'demo3@triplink.test'
            AND NOT EXISTS (SELECT 1 FROM user_preferences p WHERE p.user_id = u.id)");

        // Wishlists (link demo users to a few destinations)
        $pairs = [
            ['demo1@triplink.test', 'Paris'],
            ['demo1@triplink.test', 'Bali'],
            ['demo1@triplink.test', 'Tokyo'],
            ['demo2@triplink.test', 'Dubai'],
            ['demo2@triplink.test', 'Santorini'],
            ['demo2@triplink.test', 'Maldives'],
            ['demo3@triplink.test', 'Swiss Alps'],
            ['demo3@triplink.test', 'Kyoto'],
            ['demo3@triplink.test', 'Barcelona'],
        ];

        foreach ($pairs as $pair) {
            [$email, $dest] = $pair;
            $this->addSql("INSERT INTO wishlist_item (user_id, destination_id, created_at)
                SELECT u.id, d.id, CURRENT_TIMESTAMP
                FROM `user` u, destination d
                WHERE u.email = '" . $email . "' AND d.name = '" . $dest . "'
                AND NOT EXISTS (
                    SELECT 1 FROM wishlist_item wi WHERE wi.user_id = u.id AND wi.destination_id = d.id
                )");
        }
    }

    public function down(Schema $schema): void
    {
        // Remove wishlist entries for demo users
        $this->addSql("DELETE wi FROM wishlist_item wi WHERE wi.user_id IN (SELECT id FROM `user` WHERE email IN ('demo1@triplink.test','demo2@triplink.test','demo3@triplink.test'))");

        // Remove preferences and profiles
        $this->addSql("DELETE FROM user_preferences WHERE user_id IN (SELECT id FROM `user` WHERE email IN ('demo1@triplink.test','demo2@triplink.test','demo3@triplink.test'))");
        $this->addSql("DELETE FROM user_profile WHERE user_id IN (SELECT id FROM `user` WHERE email IN ('demo1@triplink.test','demo2@triplink.test','demo3@triplink.test'))");

        // Remove demo users
        $this->addSql("DELETE FROM `user` WHERE email IN ('demo1@triplink.test','demo2@triplink.test','demo3@triplink.test')");

        // Optionally remove seeded destinations
        $this->addSql("DELETE FROM destination WHERE name IN ('Paris','Tokyo','Bali','New York','Dubai','Barcelona','Santorini','Maldives','Swiss Alps','Kyoto')");
    }
}