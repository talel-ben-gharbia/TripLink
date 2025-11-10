-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 10, 2025 at 11:18 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `trip_link`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_session`
--

CREATE TABLE `auth_session` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `jwt_token` longtext NOT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `expires_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `device_info` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blacklisted_token`
--

CREATE TABLE `blacklisted_token` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `blacklisted_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `expires_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blacklisted_token`
--

INSERT INTO `blacklisted_token` (`id`, `user_id`, `token`, `blacklisted_at`, `expires_at`) VALUES
(3, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjI4MTI4NzcsImV4cCI6MTc2MjgxNjQ3Nywicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.KrUPX8s9nivZYWDGVtBfhOco7w_9wEuhNME9oRuD-9Xfcoo3qqf_JBBuM3inruodbZRFH0Q3zInYbficYQh6e762OJch8ILkY9-N9GTXENmSiCN2Cke8sd3rBkyYERYuaiOg6XdXjLPYCunTtiUurvvbxHtDatieqo-_YJfoGEq9UMNtpxxZfPAcJKFpf1N5uIDeP9EhnbAxkIngmZlF7Rezx0CbsjsMbq0I-XEPIBdBIjW8gtbnSKY50ThWQqHn4azqzpnWOi3DVujO2LeHZma8EhGCT5p2IGEMsVn6mhp2s4bhOhjyizmU_f-GQLCS3RJuhiTKaPO-ZuNQ0oT', '2025-11-10 23:17:03', '2025-11-11 00:17:03');

-- --------------------------------------------------------

--
-- Table structure for table `doctrine_migration_versions`
--

CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20251106030000', '2025-11-10 10:55:20', 83),
('DoctrineMigrations\\Version20251107000000', '2025-11-10 10:55:21', 38),
('DoctrineMigrations\\Version20251108000000', '2025-11-10 10:55:21', 0),
('DoctrineMigrations\\Version20251109000000', '2025-11-10 10:55:21', 176),
('DoctrineMigrations\\Version20251110153931', NULL, NULL),
('DoctrineMigrations\\Version20251110154029', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `email_verification`
--

CREATE TABLE `email_verification` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `email` varchar(180) NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `expires_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `is_verified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempt`
--

CREATE TABLE `login_attempt` (
  `id` int(11) NOT NULL,
  `email` varchar(180) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `attempted_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `success` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_attempt`
--

INSERT INTO `login_attempt` (`id`, `email`, `ip_address`, `attempted_at`, `success`) VALUES
(1, 'admin@gmail.com', '127.0.0.1', '2025-11-10 22:21:38', 1),
(9, 'admin@gmail.com', '127.0.0.1', '2025-11-10 23:12:15', 1),
(10, 'admin@gmail.com', '127.0.0.1', '2025-11-10 23:12:16', 1),
(11, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-10 23:14:37', 1);

-- --------------------------------------------------------

--
-- Table structure for table `reset_password_request`
--

CREATE TABLE `reset_password_request` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `used` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reset_password_request`
--

INSERT INTO `reset_password_request` (`id`, `user_id`, `token`, `expires_at`, `used`) VALUES
(1, 5, '93fe42d208805759792ee20ca07882c38a124398850764a3dad84f155b497cc0', '2025-11-11 00:17:23', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(180) NOT NULL,
  `roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '(DC2Type:json)' CHECK (json_valid(`roles`)),
  `password` varchar(255) NOT NULL,
  `is_verified` tinyint(1) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `token_version` int(11) NOT NULL DEFAULT 1,
  `login_attempts` int(11) NOT NULL DEFAULT 0,
  `last_login_attempt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `roles`, `password`, `is_verified`, `status`, `token_version`, `login_attempts`, `last_login_attempt`) VALUES
(1, 'admin@gmail.com', '[\"ROLE_ADMIN\"]', '$2y$13$k/VeLVFKvxiZiw3yUnqXg.SUlq9l5K5mF4Y2fHpgLa8Kc9xXWXGhm', 1, 'ACTIVE', 7, 0, NULL),
(5, 'youssefdhib@gmail.com', '[\"ROLE_USER\"]', '$2y$13$U8dViyHQ5MoWY9aKM4f4NeiDuzH1EVwdRWl0Y0F1/Znsgl.tSy1rW', 1, 'ACTIVE', 3, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_activity`
--

CREATE TABLE `user_activity` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `updated_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `last_login` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_activity`
--

INSERT INTO `user_activity` (`id`, `user_id`, `created_at`, `updated_at`, `last_login`) VALUES
(4, 5, '2025-11-10 23:14:09', '2025-11-10 23:14:37', '2025-11-10 23:14:37');

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `travel_styles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '(DC2Type:json)' CHECK (json_valid(`travel_styles`)),
  `interests` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '(DC2Type:json)' CHECK (json_valid(`interests`)),
  `budget_range` varchar(50) DEFAULT NULL,
  `profile_completion` int(11) NOT NULL DEFAULT 0,
  `personality_axis` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '(DC2Type:json)' CHECK (json_valid(`personality_axis`)),
  `preference_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '(DC2Type:json)' CHECK (json_valid(`preference_categories`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `travel_styles`, `interests`, `budget_range`, `profile_completion`, `personality_axis`, `preference_categories`) VALUES
(4, 5, '[\"Adventure\",\"Luxury\",\"Cultural\",\"Mountains\",\"Budget\"]', '[\"Nightlife\",\"History\",\"Shopping\"]', NULL, 0, '{\"adventurous\":83,\"cultural\":50,\"luxury\":77,\"budget\":65,\"spontaneous\":21,\"planned\":88,\"social\":50,\"solo\":50}', '{\"hotels\":50,\"hostels\":50,\"apartments\":50,\"resorts\":50,\"adventure\":50,\"culture\":50,\"nature\":50,\"nightlife\":70,\"local\":88,\"fineDining\":50,\"streetFood\":50,\"vegetarian\":50,\"flights\":83,\"trains\":50,\"buses\":50,\"cars\":50}');

-- --------------------------------------------------------

--
-- Table structure for table `user_profile`
--

CREATE TABLE `user_profile` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_profile`
--

INSERT INTO `user_profile` (`id`, `user_id`, `first_name`, `last_name`, `phone`, `avatar`) VALUES
(4, 5, 'youssef', 'DHIB', '99757218', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_session`
--
ALTER TABLE `auth_session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_9E60F527613FECDF` (`session_id`),
  ADD KEY `IDX_9E60F527A76ED395` (`user_id`);

--
-- Indexes for table `blacklisted_token`
--
ALTER TABLE `blacklisted_token`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_27D93664A76ED395` (`user_id`),
  ADD KEY `IDX_27D93664A76ED3955F37A13B` (`user_id`,`token`);

--
-- Indexes for table `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Indexes for table `email_verification`
--
ALTER TABLE `email_verification`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_FE223585F37A13B` (`token`),
  ADD KEY `IDX_FE22358A76ED395` (`user_id`);

--
-- Indexes for table `login_attempt`
--
ALTER TABLE `login_attempt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_8C11C1BE7927C7422FFD58C` (`email`,`ip_address`);

--
-- Indexes for table `reset_password_request`
--
ALTER TABLE `reset_password_request`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_7CE748A5F37A13B` (`token`),
  ADD KEY `IDX_7CE748AA76ED395` (`user_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_IDENTIFIER_EMAIL` (`email`);

--
-- Indexes for table `user_activity`
--
ALTER TABLE `user_activity`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_4CF9ED5AA76ED395` (`user_id`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_402A6F60A76ED395` (`user_id`);

--
-- Indexes for table `user_profile`
--
ALTER TABLE `user_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_D95AB405A76ED395` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_session`
--
ALTER TABLE `auth_session`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `blacklisted_token`
--
ALTER TABLE `blacklisted_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `email_verification`
--
ALTER TABLE `email_verification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_attempt`
--
ALTER TABLE `login_attempt`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `reset_password_request`
--
ALTER TABLE `reset_password_request`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_activity`
--
ALTER TABLE `user_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_profile`
--
ALTER TABLE `user_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_session`
--
ALTER TABLE `auth_session`
  ADD CONSTRAINT `FK_9E60F527A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `blacklisted_token`
--
ALTER TABLE `blacklisted_token`
  ADD CONSTRAINT `FK_27D93664A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `email_verification`
--
ALTER TABLE `email_verification`
  ADD CONSTRAINT `FK_FE22358A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `reset_password_request`
--
ALTER TABLE `reset_password_request`
  ADD CONSTRAINT `FK_7CE748AA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `user_activity`
--
ALTER TABLE `user_activity`
  ADD CONSTRAINT `FK_4CF9ED5AA76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `FK_402A6F60A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `user_profile`
--
ALTER TABLE `user_profile`
  ADD CONSTRAINT `FK_D95AB405A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
