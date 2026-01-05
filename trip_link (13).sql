-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 05, 2026 at 01:01 AM
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
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '(DC2Type:json)' CHECK (json_valid(`metadata`)),
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_id`, `action_type`, `entity_type`, `entity_id`, `metadata`, `created_at`) VALUES
(1, 9, 'view_destination', 'destination', 12, '{\"destinationName\":\"Buenos Aires\",\"destinationCity\":\"Buenos Aires\",\"destinationCountry\":\"Argentina\"}', '2026-01-04 21:56:28'),
(2, 9, 'view_destination', 'destination', 12, '{\"destinationName\":\"Buenos Aires\",\"destinationCity\":\"Buenos Aires\",\"destinationCountry\":\"Argentina\"}', '2026-01-04 22:18:17'),
(3, 9, 'update_review', 'review', 1, '{\"destinationId\":12,\"destinationName\":\"Buenos Aires\",\"rating\":5,\"isPublic\":true}', '2026-01-04 22:18:24'),
(4, 9, 'view_destination', 'destination', 13, '{\"destinationName\":\"Machu Picchu\",\"destinationCity\":\"Cusco\",\"destinationCountry\":\"Peru\"}', '2026-01-04 22:30:36'),
(5, 9, 'create_review', 'review', NULL, '{\"destinationId\":13,\"destinationName\":\"Machu Picchu\",\"rating\":4,\"isPublic\":true}', '2026-01-04 22:30:52'),
(6, 9, 'view_destination', 'destination', 11, '{\"destinationName\":\"Rio de Janeiro\",\"destinationCity\":\"Rio de Janeiro\",\"destinationCountry\":\"Brazil\"}', '2026-01-04 22:47:00'),
(7, 9, 'create_review', 'review', NULL, '{\"destinationId\":11,\"destinationName\":\"Rio de Janeiro\",\"rating\":4,\"isPublic\":true}', '2026-01-04 22:47:06'),
(8, 9, 'view_destination', 'destination', 13, '{\"destinationName\":\"Machu Picchu\",\"destinationCity\":\"Cusco\",\"destinationCountry\":\"Peru\"}', '2026-01-05 00:27:05'),
(9, 1, 'view_destination', 'destination', 12, '{\"destinationName\":\"Buenos Aires\",\"destinationCity\":\"Buenos Aires\",\"destinationCountry\":\"Argentina\"}', '2026-01-05 00:36:09'),
(10, 1, 'view_destination', 'destination', 21, '{\"destinationName\":\"Sidi Bou Sa\\u00efd\",\"destinationCity\":\"Sidi Bou Sa\\u00efd\",\"destinationCountry\":\"Tunisia\"}', '2026-01-05 00:36:24');

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

--
-- Dumping data for table `auth_session`
--

INSERT INTO `auth_session` (`id`, `user_id`, `session_id`, `jwt_token`, `refresh_token`, `created_at`, `expires_at`, `device_info`, `ip_address`) VALUES
(8, 5, '8be7dc0d647efe0a86db734e58a7e32113ef01d0bc2631feaa6134b62f494027', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM1ODgxMjgsImV4cCI6MTc2MzU5MTcyOCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.WlVD6PsCwfSvghfLV7W73yDmsqWF3rUj_ovRfGLAN8q02OrX72JeQmI7JMxF9hJDLeXx6n-WJ8pzwJGkGgddp1WeXerPsYVI0KiT3wJYq3KvPXUNtzXxltIRrLRBSfZl3DHkKRmsSBpQcZev9_Ct0sextCEnLxspatC05QTqvMq3OximNS-C5Sc5Imz0trrb57P7QkBB3N0IX3BWkpE-clDf123QOtO0CDKcptUPmgRsVq9Bt2y7P9kzIKO5iVZBq0uql_DuSmcYE2LMxsqWnFJb156RSkuyvLoNeY__ulJOlUTN013zApolqxrknf4myGjBJAR3JcySiKsEMRTPdA', 'abbcf38a50ab3ed1e85940be7fd777987aac2e33123cb1b58dbe2ad0de24f983', '2025-11-19 22:35:28', '2025-11-19 23:35:28', NULL, '127.0.0.1'),
(18, 5, '549d1ae0e1bb5d2ad7889b7e38c0f8f62fb4f0b5787aa9de2f7069978ba239d5', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3MTk0NjIsImV4cCI6MTc2MzcyMzA2Miwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.eDCPIrAE5BZdPbmjp8_wMnwCnJM1krgq70QlaaACFRlgqvaACebeYNndqfKAAAaRAlCs7ayq7snxtG9VpinD15I_5_DQg-u8StrHhCF3R5pnwU7tGB6eig2MnFL0D6KMxB6FoChV_hfIRcBLebOr7FIl6ZmIPuKZSNA75nbyplvnKLLdfZDjgI2uymV3dwS-gIeLgyTbVdgQeNhDEaD0-gQZMgLwpBPFjF936OoZUBJDWxNiDIbG95CsPTFkWZi1dNj0w9l9Y4KIfdY3x-HddSPpw3kRCGw7f-d1y5hiUmKg-AaJ17N1BJsEZ-Z1iOBHh2RFLx3riKFrcsWkOilwEg', '79c9bbd419da8ccb49586661f7b3dc82d2b553cdd3233ed4277ecbeda7176fff', '2025-11-21 11:04:22', '2025-11-21 12:04:22', NULL, '127.0.0.1'),
(19, 5, '8a590862b65b7baad5d03e4d73ca5d5b42eaf2d3ba4006171d152ea822d2d666', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3MzA4NTUsImV4cCI6MTc2MzczNDQ1NSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.MOjlFgve706pTBPh9TBhFjg_jZlYeZT9dgqHT5o2A5rlGGFX-Mfp6PBa-2pszwm4QTQvkeUqgBsi6FWgqNZPJPprCvXjkfKvlHpWnWMdqsN8uXPc_lWXwbniaDBnEbrBZcHAajFAR_y5NrHPbo8z-Skeh2YG1Iea-HPke8XSfwZUBF8M_YXN6WbOkq8OTEmQ75LfMy1cErMdaaqWecwXQ7ctuhaPiTuVaIFVE1o3sznhhcvWZqwZm1H06DeSj8pzDoprtrjP8EvQorX3Ejiw1ybECQwnW3Tel_2li1e_-uh7btKKyDVXZmsTVeTin9t4JiUc8c4d1S3UV4OlXujG0A', 'ab4df2a4eacc440f2a21f476c4638c22655f70166006ebcea5c61c86de5bf94e', '2025-11-21 14:14:15', '2025-11-21 15:14:15', NULL, '127.0.0.1'),
(20, 5, '1a22afab5d03df368f7c2e4709446055525b3d80a5291118b7895e93b5c08cd4', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3MzQ3MTcsImV4cCI6MTc2MzczODMxNywicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.cBAUENmfIAgOzderfrMTqEfr8LVcjZhoZ724KSy0K_58nPNz_XRG_WTg-RmIszzt1ETXxlgrlp7g_YI8jAjopcQ1tyQRn35Eb_Xu4Bk_2schodCNl4K-IXixMNECukoQv9xd-4e-1WEuxp6l5jCCANxg9njry-rDspIMK35dn_NzHfBDU2PsKl1xCXCtJGzAkYIa2z9Y0nRdGqSqowTwK5Y3Y49Wz_5T2D1a47NaXCkHrwGnlhO_NE-dJ32KBmCHldKscbqXQPhhhsjqDNw7N5DG_1euf59N_jLg5xIjtSSscaLT0Tqa6QKVsyuGroDq3B94vhP_gb7UDXvw0rtzQg', '6fdf4ff67088a70de63affc2cc66527f295b572c68bc8bbbc07ccb1e0ddd0ca3', '2025-11-21 15:18:37', '2025-11-21 16:18:37', NULL, '127.0.0.1'),
(22, 5, '41b279f9e89d8b317745d93ea39b0357607c437fd18fad575edbef602f128479', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3Mzg3NTUsImV4cCI6MTc2Mzc0MjM1NSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.bpYRXqGWA2NIknmd54PBvTe8gyeQic0FMuQhLxH7N-wpPUNHXa-9kDRGwfhWUNPpvOK9AJCXPAY6dvFCIvioy2a9K3KwGs35XDsM7BwMoJmoGXgCZu_LMOcU1WE48PeOMV_VHDzR8m4g3U16TLXC8MEaGlUxtul-D77Ex7soDpjOXWx-1Xuk_mPRdos5pyQlWQ_TFHREvhfzczSjRf8mwci9BRqHkIsBaVXquAuEGxVLk_ACMGdBbIRRyOHniPD4ydGCgJGc2V80uIhEnKv5eH83UpgMJcer7c7KAz_uqsNk2cTsXu45XkCuoECTOxv7-TfBlKAEBJu1mWUSDH32ww', '71bd47b88dbdc49f817f4115d3c9a0fd72ec8b5e2b67f33160a26b262afc4852', '2025-11-21 16:25:55', '2025-11-21 17:25:55', NULL, '127.0.0.1'),
(24, 5, 'b54837249d2bbcd2bd8c9b10206ad333d795cba5401ac2672132cd4770401674', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NTI3NDEsImV4cCI6MTc2NzU1NjM0MSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.DhfhH4ree2c6O9HKxs3Fk7QcnNQrcPKfc_yjX8lAUJhPR6iT-jhI9aB3z1AF7-K6NhNLQbSE9bFnOCmvx3PSnUvxaDQZVPckNi-52TQIWbbbsZjBWLjnJC_-mXuf1TkRwWoPyPAj89ksZC_ZIhWMfpFFGZMupkpN-KWnBY6Sl2zAT-nVGchgmMzncFOnYAgxTdx3ZRpXAMPvZnSoMfcCrcl71ZX6B2Mj6Q2OTqCD5JVhGMqclUduzV_CocA-ofX-W4oDb3ZL6TVO2B5APW8ayGwkqkCzbZ9q73AiEZZlH3-vEPxo36ynEM6HF2G-ceNUqyGKAMoyFh_GC9B1TzDZRA', '51f77e13a52211cf565c2d2f8a1574fd11dacd598c4972bcd0cc5ae2728aa0cf', '2026-01-04 19:52:21', '2026-01-04 20:52:21', NULL, '127.0.0.1'),
(26, 9, 'ab63c1b6f4fe49abb488a0c698d7c2087c3724d72c72cc3b13508af4c43e48cb', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NTg2OTEsImV4cCI6MTc2NzU2MjI5MSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.BPOwxIxdMxSHkUKFBBTqLrsrEvwX3N9XVjyos5dSbjL26Uuyjj683DEipwc_0l-HYbk79ltP4GP57c-bCXI9DlQ6FNaCs1ColJTekFVnq6_v8T9EtmTIRygIgk_--gaLlTZtPQHRbYy4Fwvz0IWLfCP6bCzaTMbnA0R-lOW7DHUtWfLPeqIqv1EX2j_gM1EX03QvMzGZH3_aGlKCqIeXnVgjma6gNu7Z8RdyTE5OLkB4rGR7pj0eLMk0FajAk7Vnc5HbdHIHEXgzK9JtDIq3nqdlFkEGE4mpz8dqbvUenrD85FESvdGE4ad5bYsrex2rRQa-BoPYKTtvY66gXLVIrQ', '75b391ba2ff9bda609372d354292935d7765017ffe709cc6ee7a413e1246f2a0', '2026-01-04 21:31:31', '2026-01-04 22:31:31', NULL, '127.0.0.1'),
(27, 9, '37ca42b011f1ae61d04feba62cb89ff2983bea15c36d3f3bb2096a1ab8610178', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NTkzNjYsImV4cCI6MTc2NzU2Mjk2Niwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.O5WEyAq5jGZ7wX3j-Pqmfqt-LUk6ifu6zQ5tX81te-8m6cxrP3A1zG3_FmxCXWoirsosjzadEqpr3OWEsQceaC5VbuYIQ0_PogOly0C5yHM9p-6ZGDzNyM8mauEqCpuM361HRFsgZVdtS7UIK6GssZ5N1FgwBd6tExt88Fx63smwHo1KLFDevftCt8qibGjAWlTAUJyEv9eyy6yEG49_ve2Bsgw2xKDePwIk9Ti_Onqr1xNZ5_dt9K2xqb6HEXwVo1GZBjjkV0iSWe2Arh-_0ln9BS3U-XMDzh2hnwv3T4hqjqDW0xfKwW3Tx0m-URu0XMl2Egqm7t4X_9-j_u5gEw', '5d460bac0556b07c8512b4038ae647c25354c54a7ab8184a0d7434397b7de4f0', '2026-01-04 21:42:46', '2026-01-04 22:42:46', NULL, '127.0.0.1'),
(29, 9, 'ae726c8f78bee55021c2810003efeaf06be663b55e9504b0ae9a18f2b1c09b41', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NjAyNDYsImV4cCI6MTc2NzU2Mzg0Niwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.GJ43Oi-nzXdQYfaMueG1MXsIbsLeEaaG_GHAREn7WGBXJ9b4qBT06s4kf0x_Zote92K1N4DqoaOctaQLtkUCgiFiAEGnMR058iIu023uLVa4_i2BzqXckwSNMhk7tF77q8HBweyjd_37M3RL5NrU5sSdeeXO5MXGi0PV9i-E4v6qqCpU1IYTAI4lCWopCDyS_y78zov1AcrVupnioruNwm2QNCGqG4xIy-6zmHekEesI4EzRMvg30_QvhRwDAozI08jG47VD7OS8JVonZ04R-vdM2PtbegM9HMk1SnWooqLKIj7AnO9AAqDvqFfpiMB3r43bFsEZhoJUBndcQMbuKw', '37b7e0186b070a11e7ebd7719559b24fb33f228df02dbbf3e83475a984a0b6e9', '2026-01-04 21:57:26', '2026-01-04 22:57:26', NULL, '127.0.0.1');

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
(3, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjI4MTI4NzcsImV4cCI6MTc2MjgxNjQ3Nywicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.KrUPX8s9nivZYWDGVtBfhOco7w_9wEuhNME9oRuD-9Xfcoo3qqf_JBBuM3inruodbZRFH0Q3zInYbficYQh6e762OJch8ILkY9-N9GTXENmSiCN2Cke8sd3rBkyYERYuaiOg6XdXjLPYCunTtiUurvvbxHtDatieqo-_YJfoGEq9UMNtpxxZfPAcJKFpf1N5uIDeP9EhnbAxkIngmZlF7Rezx0CbsjsMbq0I-XEPIBdBIjW8gtbnSKY50ThWQqHn4azqzpnWOi3DVujO2LeHZma8EhGCT5p2IGEMsVn6mhp2s4bhOhjyizmU_f-GQLCS3RJuhiTKaPO-ZuNQ0oT', '2025-11-10 23:17:03', '2025-11-11 00:17:03'),
(4, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM1OTQwNDEsImV4cCI6MTc2MzU5NzY0MSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.kH3Vnv-mvsrZ0m_Cm4gQtYeerMTDSHNQJDl37XuMaTEF0UMQc8GcuhNB7BcBZHX0ZkVWiVlvSNrNWJBKX9gwlpXBa6EyuDhPGCik7DhLXu44xMaBRgHx9QzKu0EPWCxTGyb4cx5r97gK1uFLpXn4C0ehzYMLDCgenjpP_QTPN308ZnQ_IgcY8e3DDpuLJpcyLWw4JO5kwXWyylMoyXLF0ri91hZGXkSfjbtChOPfhvbMznn5PvxUSnmPxkMJoMx3T_k02KBticxEaRPsbp_BS56wccEJLS-mPX5E_qoHkbSScqtZ_lsOdH2eskY85wQ74oAw7fy76xF7vAETlQt', '2025-11-20 00:14:21', '2025-11-20 01:14:21'),
(5, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM2Mzk1OTQsImV4cCI6MTc2MzY0MzE5NCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.In9NxIfCfAs6eaxEvXnhJiqLOTTb4IrMnFBSAK4K3GdQy1a2ICWdgSHjsIRxt4vEr6H_gSeorGwt4NYe8vPWno4_BkPMY07ls6NwVi6QtaGP2SCncnU83PbisZRrCFbRqkt5LC3dEHFuts5BeiupJOSni34SU4XnALXQCGiv0LgV6oHA9ufNj5z-NzU0z5b6QST4UrSfI4sKyOiU4IkQF0nPCD-zuzVZtp-OSNuRxIxp5NY1F9GenbshqkH4UlBV34R6uc4CsKTRoAsLJSEWRHPg-LrlMC25_Wh6z1WDo7EgnJM3_npTJ6mffWot1WreZNIhHmxU8gAOEPb8OwE', '2025-11-20 12:53:40', '2025-11-20 13:53:40'),
(6, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM2NDU3MTgsImV4cCI6MTc2MzY0OTMxOCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.Nckyav9CD8BsIlbSQadpgAmrT5w3Bl4Ef8oq5XxKUI0-BUlUiz1LFzh9tGvT30eTAkBsn7g2ipw4h_GkZX7vO9qwmap_5WulTpZarI9l-3k5Ad8gCCRJH5UhqPOg56qhyCpCT_9CFm8rm7kGst4LHpSLUH6DyZBLih0fJ9hLKJM55lFI5yu9ZzQ1H_24dIt8VnxJIHcQ3L509ybIjD1TkZigzWoLxzMlmWvx87_VhaHHvQsSXCFVzSgksKYcMUszpjI7EHqX84EjbHi3oxZbDVdPCuYXFfzTQOQRJG_lEiKCnWBmTU24S5fI55uei-xkpA2JTN8vNRn7A2BpRfK', '2025-11-20 14:35:45', '2025-11-20 15:35:45'),
(7, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM2NDU3NzYsImV4cCI6MTc2MzY0OTM3Niwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.dbzqOfPyQRYFPqT_WF-dIQr6DxA6oiJ_RR7B-vhmR2Kumwqc2OjGlapXdXfvrZzbc-WtZJEIbdSga10eeBhJNuEp2ttwmCbmQCNE7DJyoK94tC3uxKhmfK0IGCTWYQfSYUg63uITZiOn6x-yveAFEGeLtNReFUP-CbFaPfVrn0__acSkoFJBXWNsE4oaFZuRKUXF1yS6ePMrD3fMusPYxU62k-IgNuw05winUnF_nMpKAU8Q2OtVp646mi9drFbbsJ7-EqISX3WRzB-dFhsFBGrK0ptrHU4bVz1yRUh6ZI_WiMekcKf5GkpyEGwVq8QlKXLMLB1jFRi6dDYEMog', '2025-11-20 14:36:44', '2025-11-20 15:36:44'),
(8, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM2NDgxNjMsImV4cCI6MTc2MzY1MTc2Mywicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.UAtl1-2kGBI6sQp7QUgi73uHhEZyN61hU_ZMby9gkzkrxG91YuArOVpeWlwZGoI5YLI1BoIdRW-ifn61Zv7bWPlLrjdn33ZMtMuU4KYA6VCpwrYR2z0azZ_jWpevitWxoYlZKX0Gd3tpxAj10CGqjb47urZTZc-QP6TaE40neWTAYDK3cuv5qgJzFYrgJ2UiCOuOyETxHhr6sGMkTcrqstpRkDsSuEHBrkuiPb-bagHC_34LF-9N9i4y9DYl4yTJGCpKSmhPMd3PAqmBocu_9J-zA1RlExSNQGzqqrYTWRM3npw1J0cCqDuQqnI88UxRfpNvNhR16JroyxqU-8V', '2025-11-20 15:16:25', '2025-11-20 16:16:25'),
(9, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM2NDkxNDQsImV4cCI6MTc2MzY1Mjc0NCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.WHwIi6B67DDZs1X5b6Hfw4mcwXPOgw-K2B7LlUeTfq4_ad7BWpBn1nPW1ekap8yC5aRsfprh-JZWeogzJF1vDQsUm2KYua7CiIZpF6Uu_aUqg0tqr39W6qN_oxcMp-ZqJjryRksgBn3SWW7ogl3v0KITvLAdNoB0u8_5hbnzwEXdDeRqfnCjkBjZZaUZOICetDapotehLD4f_T7m8nmALlenzCXlddiAfTyJom_iEOIYtpoNZYI3TPSuKoOl8hSD3o_AtjUHyEJuWu1RGpXR7m9AhTeoiwDKnXMRYqHxEVvaXjSB51p-w8hD4qsZm8mrWdM6R8x0Lgwl-x3fwup', '2025-11-20 15:46:13', '2025-11-20 16:46:13'),
(10, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM2Nzc0MjMsImV4cCI6MTc2MzY4MTAyMywicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.jF6oHNDEetVZqVN8Tap6Yjf3sDNTyW3L19opguWMW5Zn0I_sGK8Jf3VYh17TWoftbOQEN0X8xISM2qRNL5INqUrljNT8oVpu9ZVYdRT8cM3pkUIPezOv-kTGAPLTwE63O1pBHeh6WUXvWPpWO0ng6JBM6TS6Vrvop4Trkgi-D7KJYOBR2t2kDZeJ1qhEbN0a54luxfnDeuaIeHVor0hSLW4EcE-FK26IusK-S9G7ZknpwMl9SCH_EPaycZTCyo_vCRlvobkROLv25nu-Q5hfbUyZd76bqcmu_c6MmBlXr6EwyxriFVI9vWW0eV6UP2JFOap7t0amF9UeUN9Jtrx', '2025-11-21 00:12:59', '2025-11-21 01:12:59'),
(11, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3MTc5OTAsImV4cCI6MTc2MzcyMTU5MCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.AuFyqyOoHW0SEw10jQzBpetFENgt7yiGHIH5T_G_B1-ZUxPlOKNvTDHpQfngKqWkabllgyTCwc8PbFckI3f4TEVfta8uWByZuk_3TtLGpU3u0OJ6HTeRsXXIf5v22pAPqgoSQQS87mrZaieS5v7evTx8xJy8wtcYgAql4VdgRNemNyGmbsAIbPX62pgiRyb5xUuLvHxMFwSl5FB2l5a2iJbbkSaFb-QiBWnu3c2zrsg_zC82CP0ANhBP20efEYHR05OIjSZ3sxAqq9XbTYF312CFIMya80dBJ0_pivWB8zMLkK9M-lTOIoJwOYC9B4-KTymW_gLNU8P-2NsZFD3', '2025-11-21 10:40:22', '2025-11-21 11:40:22'),
(12, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3MTkzMDcsImV4cCI6MTc2MzcyMjkwNywicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.g2edcXTXqQJXgUIEJWPTsMC9kdaNrjpDq_wzo-G06KcIL0XGuAeDd3xgU0mvNNLtdlVuAog3zrYdmqTQr1Gsr899be4zObFWMhdImkeAPaOcInsgYPeFdxffjpCGRYypaZtPrkRQDL15sMbWZzWqyjPL3gH_uy9WuOPtU3_JXPXuecOqEEJj4Sn6wyVEi9ZC6pswJACCU1hk56nQnhDOBTQdLb8Y9drBMb-uWzbCdqXg4z-XCaD8IUhJKFyMw1SnsB1NveLQSJCSM_dA-FGyd3Jh5qv_mDyz3tESpB3uvR-g43A5XrKTybVi6srFtVj6WOxzkAurJnAjKIruG3R', '2025-11-21 11:04:16', '2025-11-21 12:04:16'),
(13, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3MzY1MDAsImV4cCI6MTc2Mzc0MDEwMCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.DwpjoEnDQVG0DApVPw6U2BFk2vD1eYjYUebMTu-zgXr85kExfBmBKThRUWw2I6avNkIYDI2KGkXueZkpXWvxPXOui7ot5pYQUgVFS3IB9TSKbCjTIT4h-rUwoECdhZ06i8D3JM5OYCE_BfzbHF-xQhOlJ-El2xP4IO4iquPDQ5-DGiquTy-nivsmAtTpNDNaPsRSsdvTvo2JvMwvX-LFb45lurjSMru_o7XS37dHwvPL5UCykfDKYh2KNoxIIOBPpUOoWmod-7CmKfj5o3XC0RaIfAEAi9AKhDX1exz2PIxaNPoCmvVKdqC1Wq0uya407gucscrRtTg630XQunS', '2025-11-21 16:22:50', '2025-11-21 17:22:50'),
(14, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3NjE0NTgsImV4cCI6MTc2Mzc2NTA1OCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.Z7U-7fi7rHf1EmARncf2wW8Q-SNk-c4G6TqsM5S5bHq8OIxtZitoSeRBfZsAoaTpY9YBkwYkYa3kohyqLuX3L5D9B2EiuujD3LZSPd0uLy_00iMQTQYnisIDSd7zm0edQQ1TMhXnjEYAK-m5M2xy9HwzMRzz9ehrqxSPbgob7WxGWe7PdgzccgFcPMQvofUHrt9St200TKF_R9ti1xuSbYlFxmGo6wpl16QgIth2srGy_An5_EZcHZm5k5guVDTbLz7yTZ6LW0Unic722trScjxho6LelevsJA589tW-8mxqnAtF8i_fJwjtEuTAs-Jk9yalXj7PK_1lx6s8B7q', '2025-11-21 23:24:49', '2025-11-22 00:24:49'),
(15, 9, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NTgyOTMsImV4cCI6MTc2NzU2MTg5Mywicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.P1rt8zsHCgpmkpBjpMEmXsXQhx6i3opMvGmZ2Sy7MOTqYhwwo5jZ9SLDgmLziBWswr-uPHWWkWQmT5WNB9a7zsGRr3ZJiS60nz8ugmY6SsxzqsNF8fSMvzTq_VNV3IjSuIrZ3_UrZk96XCDEo6INmeTQZ9uUAyubdrxf6Rp3nCXbUiGZkHdnykovpH1lgJ274kYRL1BMiDQC3I52qYONhS3lybXkd524hDj6iaZ1p8rNKkqb5vlTqlRnzDppgcn-6Wxtap1nBAaAAmcBf-fGGoXxSdddVh4YxPqgr594FcZnsmq0bYjWjj37tBe4DSX4xXXBiuubaOH9y351BDamhg', '2026-01-04 21:25:16', '2026-01-04 22:25:16'),
(16, 9, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NjAxNzEsImV4cCI6MTc2NzU2Mzc3MSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.Ar3V16P5nW2qySnQrrp8WanxjJXwObnsOj2xTT3ieK7Zgg26HWzx_qfLPRr5Mwjd67dlf5RGTE6I7OjNklTEVbHWjEShwyBuG9VgAori3hFR795_zehUzyeRxQeD71JePlw5MRzo-zQSNWtSSLL4SbZpfoPp_GBRA7fhppEZc46vMwqND67Uv7CL-Wf6MKKC8tlWJkdj5kya8xSa1hB5HLxtW5oors0n3L9C0kUsTNO9VaICrpH0S_6rZW9-jf0IrvOrajcRq2AFamEPRm7NykgCb5rkDHS2GmIpNllgakFy_f9r6UOBY0v8fEN9k2wd-C_ImTz1sO6Eqar1C0OEwg', '2026-01-04 21:56:47', '2026-01-04 22:56:47'),
(17, 9, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NjA4ODksImV4cCI6MTc2NzU2NDQ4OSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.CQd9fb73jp_yDQ9rdatBvAq54XqnHYqdsF7DXC7JllmJsvdx3PhWDNgV_Ny0zalmcViuSS0MQAHO2TQuHKvDMCg9mHQOZlZde00Id9ruYhgEIFbYM3Cv3RiYKfwJgq7JUDIeOwB1wLMAtZUkUTqKzuLxbHMYLKGAbp4NhF21tTYCeWmadQgc0bNXsPcHN_NzmMVNJUIF_chDzA9sIZzr2zt6YeKFHUztv_kzTYuqjO7-IBJjd-B95K5SdibqAkji9qABblpZsGX1rkGGOVGi5V8dexPI8pGkHngg70TnqFdkCt6OKggLxokNcR282TvNDS6CNwb7JxOolT_lEPvJxQ', '2026-01-04 22:11:17', '2026-01-04 23:11:17'),
(18, 9, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NjE0ODYsImV4cCI6MTc2NzU2NTA4Niwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.OafjNqMjtZmx7ZeSHQuF95E-tg6ouU-plkiA7kf2n6gPJ5ZG34V-5CtSI7-nMVquvuZYWEaNu9wcfcoD62S2SOnU_C-prLmIFXGIJuUV739tp4oJ1gSetGHOac_2zHEqXuP6mM_ruWfAu4hcgeQ_Y0Ef8pKTbbLTCnyQwqXLKKu5gy5_X2WamzYD8ITkVWEBDhUgk6gRutA1vnXIxg8x3Qg6BV0vS34CmSwXj8xCFNTb93hOhPu7f9QYbpkIgI3O7vQ1PWFd9D81cskyZOw5rN__DKy-pbTnmBf4CmwCHzR9CvjobyNqCUHapYTMa9zgF_hDZFvvhP9eb7VFzjPNnA', '2026-01-04 22:18:54', '2026-01-04 23:18:54'),
(19, 9, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NjIyMjAsImV4cCI6MTc2NzU2NTgyMCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.IA12hZ30O_8hWWvylgdz7Yu7xRPbMRxltiFDJvh5gOim10qpWV0rmLBRqWr78rPnkToGVtU_OK6U68-GmiBw5I9JMCndF9xuoreWFMEKF6UNNH7XEhAsHpU0giH1CYAhQSK3wKqAvTHiOnff9_r4KgaPREQJJG1c_NYsDtMYr-KUIE-HhGC8nxs3vaHGgvxS4J_7i1mHoBwQ5GoHdp6Uh9uwel5B_cOYYkQq23_4lK3MT7WPao8B2kN5cfz3MgAAUEufZ2mITOMdjwRL_xco0vbLvRrFngsOAcBF3dAjRntyG_n75uRUtOLscioxGErOsR7zwjtDFyL9KMwvkG-rlA', '2026-01-04 22:30:56', '2026-01-04 23:30:56'),
(20, 9, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NjI0NTksImV4cCI6MTc2NzU2NjA1OSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.YBrGwkXrSlRIKKTQCB2fF0eBZGs96su5FRmf0DCPJTEjJjz7iDFdhViBmdSvbdHQqDI84NNq4BaSougCLr_9FHt9T5DGxZs0hd3H1IV5JPYblLNflB4gfNLwKwHQyt1LNYRfaVd7PYQ1fcuJjcTVwv0cVCpabp80DjbcbBkDdgVZHAOQ-aG8XZA_gIYpt42VKfPV7r_XGjzb2dq8Aweeu28PcAGBnxaQi03oCKE47mHPyoVzKb7BapCKzfMvdCjuCEhGH_Di_yrzmmkPlywHjj8QaDlJV8yooYUUO36Kcj9abzO4vNu6LF1T68Gewn_UUXtNaiBVg6H5RPrEGI-klg', '2026-01-04 22:36:04', '2026-01-04 23:36:04'),
(21, 9, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NjI5MDgsImV4cCI6MTc2NzU2NjUwOCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.H7SuXH91S0qPIeI0vEYCFN8whKFVP9vVeTeZVTQW9E09vWcv5ae6o6Dkm3BgOxUFlScGIa2ioguCr924biB94_UJ4Nax4oy4SLanpD-GxLn0yeLJjc1PQwUxtlBR0qZmCyt8kGIB6QK6WT7OH3TA64JsNN9kg34CvyoX_3tk0WQt1gaKUpp9nb_GFjOIcdrcaF7XbPY8Lk94_wUUJ0izU7lhYhbswafn9_Z1fmBR-OmDpSB8Xd_IvrGRAxF-4XdWZjwG8zHtVe4SA9gJp7SzCT8tjA0wpNHNt6cvuPO25abquMjOdELI3o-abQlacvjkdLR3dHLMBtgbYHxH8zk37w', '2026-01-04 22:51:55', '2026-01-04 23:51:55'),
(22, 9, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3Njc1NjkyMTUsImV4cCI6MTc2NzU3MjgxNSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoidGVzdEBnbWFpbC5jb20ifQ.LaT3oC4yDUi2rxz6h0aUOzB6GTjYpZoBG8BZws6NiheEdCR8wwlBmnV1KA94UN417HZi17Z-Vbq_IW1fTVXykmIF64h4SWERXL8v9EE_QPGi_ucqdGgZ2DZAFi7q077BwrC_eca7hU9fGLP4Y2tWa35KPREU-ON-vg6Ak7uOA5M2ukuEpEd1sxXvwPIG7msXx1SW7DavIaJmJC9SVVuMNXAbzllqZJ3VHF1nZfPxTfcFYzdPAFWyfDoiRSXGaji91AATeQFZrlf0zur1qW12epZv63agiaQ2nmmD52fJlCNUoq_jQYZqnsQL-y40YXoiQoxF5_I97LY7k88dHMExkw', '2026-01-05 00:33:09', '2026-01-05 01:33:09');

-- --------------------------------------------------------

--
-- Table structure for table `destination`
--

CREATE TABLE `destination` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `country` varchar(100) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `description` longtext DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `price_min` int(11) DEFAULT NULL,
  `price_max` int(11) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `destination`
--

INSERT INTO `destination` (`id`, `name`, `country`, `city`, `category`, `description`, `tags`, `price_min`, `price_max`, `rating`, `is_featured`, `is_pinned`, `display_order`, `images`, `created_at`) VALUES
(1, 'Paris', 'France', 'Paris', 'city', 'City of lights and culture', NULL, 120, 280, 4.8, 0, 0, NULL, '[\"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04'),
(2, 'Tokyo', 'Japan', 'Tokyo', 'city', 'Vibrant metropolis blending tradition and technology', NULL, 90, 220, 4.7, 0, 0, NULL, '[\"https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04'),
(3, 'Bali', 'Indonesia', 'Ubud', 'beach', 'Tropical paradise with rich culture', NULL, 70, 180, 4.6, 0, 0, NULL, '[\"https:\\/\\/i.pinimg.com\\/1200x\\/e0\\/31\\/a9\\/e031a96ec6e6ab68a940e24c14ca96e3.jpg\"]', '2025-11-21 15:42:04'),
(4, 'New York', 'USA', 'New York', 'city', 'Iconic skyline and endless attractions', NULL, 140, 320, 4.5, 0, 0, NULL, '[\"https:\\/\\/i.pinimg.com\\/736x\\/20\\/32\\/54\\/203254b9ec32a80b6f987c1a8b21559b.jpg\"]', '2025-11-21 15:42:04'),
(5, 'Dubai', 'UAE', 'Dubai', 'luxury', 'Luxury shopping and modern architecture', NULL, 160, 380, 4.6, 0, 0, NULL, '[\"https:\\/\\/i.pinimg.com\\/1200x\\/c5\\/8b\\/8c\\/c58b8c199ea3479c226546d9be11dc17.jpg\"]', '2025-11-21 15:42:04'),
(6, 'Barcelona', 'Spain', 'Barcelona', 'cultural', 'Gaudi architecture and Mediterranean vibes', NULL, 100, 240, 4.7, 0, 0, NULL, '[\"https:\\/\\/i.pinimg.com\\/736x\\/51\\/b0\\/a6\\/51b0a60b97585f59c60a30f837aae6d6.jpg\"]', '2025-11-21 15:42:04'),
(7, 'Santorini', 'Greece', 'Santorini', 'romance', 'Whitewashed cliffs and sunset views', NULL, 150, 350, 4.8, 0, 0, NULL, '[\"https:\\/\\/i.pinimg.com\\/736x\\/6f\\/40\\/68\\/6f4068366ceaf6ea808ef4cc13603d3b.jpg\"]', '2025-11-21 15:42:04'),
(9, 'Swiss Alps', 'Switzerland', 'Zermatt', 'mountain', 'Alpine peaks with world-class skiing', NULL, 130, 300, 4.7, 0, 0, NULL, '[\"https:\\/\\/i.pinimg.com\\/736x\\/b2\\/5f\\/6f\\/b25f6f1169fb415a7bbec0bb8b6c6c4e.jpg\"]', '2025-11-21 15:42:04'),
(10, 'Kyoto', 'Japan', 'Kyoto', 'cultural', 'Historic temples and serene gardens', NULL, 80, 200, 4.6, 0, 0, NULL, '[\"https:\\/\\/i.pinimg.com\\/736x\\/cf\\/98\\/d6\\/cf98d67e667d3126091e1d9530ed0a0b.jpg\"]', '2025-11-21 15:42:04'),
(11, 'Rio de Janeiro', 'Brazil', 'Rio de Janeiro', 'beach', 'Famous for its Copacabana beach and the Christ the Redeemer statue.', '[\"beach\",\"culture\",\"city\",\"carnival\"]', 100, 250, 4, 0, 1, NULL, '[\"https://i.pinimg.com/736x/37/3d/d6/373dd6935d1cdaf08b5bae1d0663fd13.jpg\"]', '2025-11-23 00:00:00'),
(12, 'Buenos Aires', 'Argentina', 'Buenos Aires', 'city', 'Vibrant capital known for tango and rich European architecture.', '[\"city\",\"culture\",\"tango\",\"history\"]', 90, 220, 5, 1, 1, NULL, '[\"https://i.pinimg.com/1200x/cf/e4/9f/cfe49febdd7150fd83c83d66f99d15c6.jpg\"]', '2025-11-23 00:00:00'),
(13, 'Machu Picchu', 'Peru', 'Cusco', 'historical', 'Ancient Incan city set high in the Andes mountains.', '[\"historical\",\"mountain\",\"adventure\",\"hiking\"]', 120, 300, 4, 0, 1, NULL, '[\"https://i.pinimg.com/736x/53/32/3b/53323b2387e70c4c3757aacfc163f780.jpg\"]', '2025-11-23 00:00:00'),
(14, 'Santiago', 'Chile', 'Santiago', 'city', 'Capital city with a stunning backdrop of the Andes mountains.', '[\"city\",\"mountains\",\"culture\"]', 80, 200, 4.5, 0, 0, NULL, '[\"https://i.pinimg.com/1200x/62/0c/f4/620cf49c4dd266bd87552b4028b36c60.jpg\"]', '2025-11-23 00:00:00'),
(15, 'Bogotá', 'Colombia', 'Bogotá', 'city', 'High-altitude city with a rich mix of culture, history, and food.', '[\"city\",\"culture\",\"history\",\"mountain\"]', 70, 180, 4.4, 0, 0, NULL, '[\"https://i.pinimg.com/1200x/5b/3c/78/5b3c783b6916df68c12b26f693c882d8.jpg\"]', '2025-11-23 00:00:00'),
(16, 'Lima', 'Peru', 'Lima', 'coastal', 'Capital city on the Pacific coast known for its gastronomy.', '[\"city\",\"coast\",\"food\",\"culture\"]', 60, 180, 4.3, 0, 0, NULL, '[\"https://i.pinimg.com/1200x/f7/67/a2/f767a22025a28aa9818cc2977632c1ea.jpg\"]', '2025-11-23 00:00:00'),
(17, 'Quito', 'Ecuador', 'Quito', 'historical', 'UNESCO-listed old town with beautiful colonial architecture.', '[\"historical\",\"city\",\"culture\",\"mountains\"]', 50, 150, 4.5, 0, 0, NULL, '[\"https://i.pinimg.com/736x/77/b3/81/77b381823a4da0c637d73caf62cd42ff.jpg\"]', '2025-11-23 00:00:00'),
(18, 'Salar de Uyuni', 'Bolivia', 'Uyuni', 'nature', 'World’s largest salt flat with otherworldly landscapes.', '[\"nature\",\"desert\",\"photography\",\"adventure\"]', 100, 280, 4.8, 0, 0, NULL, '[\"https://i.pinimg.com/736x/ab/d9/75/abd9755513fbeb0c2041d8942a0e31f8.jpg\"]', '2025-11-23 00:00:00'),
(19, 'Cartagena', 'Colombia', 'Cartagena', 'historical', 'Caribbean coastal city with colorful colonial streets.', '[\"beach\",\"historical\",\"culture\",\"city\"]', 90, 220, 4.6, 0, 0, NULL, '[\"https://i.pinimg.com/736x/23/ed/57/23ed57ea19670dad3034352ea8c19b60.jpg\"]', '2025-11-23 00:00:00'),
(20, 'Montevideo', 'Uruguay', 'Montevideo', 'city', 'Charming coastal capital with a relaxed atmosphere.', '[\"city\",\"coast\",\"culture\",\"history\"]', 70, 180, 4.4, 0, 0, NULL, '[\"https://i.pinimg.com/1200x/a1/f8/14/a1f814a9838625e82bee05ebbc774308.jpg\"]', '2025-11-23 00:00:00'),
(21, 'Sidi Bou Saïd', 'Tunisia', 'Sidi Bou Saïd', 'cultural', 'Sidi Bou Saïd is a blue-and-white cliffside village overlooking the Mediterranean, known for cafés, art streets, and stunning sea views.', '[\"cultural\",\"scenic\",\"photography\",\"mediterranean\"]', 40, 120, 4.7, 0, 0, NULL, '[\"https://i.pinimg.com/1200x/1b/02/7f/1b027fbc78646050b285dbd3ea52d6f4.jpg\"]', '2025-11-23 00:00:00'),
(22, 'Djerba', 'Tunisia', 'Djerba', 'beach', 'Djerba is a calm island known for its beaches, palm trees, markets, and traditional architecture.', '[\"beach\",\"relax\",\"island\",\"culture\"]', 50, 150, 4.5, 0, 0, NULL, '[\"https://i.pinimg.com/1200x/e7/1a/df/e71adffee13764b4946e436cc9384b5e.jpg\"]', '2025-11-23 00:00:00'),
(23, 'Sahara Desert (Douz)', 'Tunisia', 'Douz', 'adventure', 'Douz is the gateway to the Sahara dunes, offering camel rides, 4x4 tours, and golden desert landscapes.', '[\"desert\",\"adventure\",\"nature\",\"sahara\"]', 80, 220, 4.8, 0, 0, NULL, '[\"https://i.pinimg.com/736x/f4/1b/ac/f41bac3c4bc12990eee9ce6918719319.jpg\"]', '2025-11-23 00:00:00'),
(24, 'Marrakech', 'Morocco', 'Marrakech', 'city', 'Marrakech is famous for its souks, palaces, gardens, and the vibrant Jemaa el-Fnaa square.', '[\"city\",\"culture\",\"market\",\"historical\"]', 70, 200, 4.6, 0, 0, NULL, '[\"https://i.pinimg.com/1200x/ab/02/44/ab024490d6f080530c0da81877240166.jpg\"]', '2025-11-23 00:00:00'),
(25, 'Chefchaouen', 'Morocco', 'Chefchaouen', 'scenic', 'Known as the Blue Pearl, Chefchaouen is a mountain town painted entirely in blue.', '[\"blue-city\",\"scenic\",\"photography\",\"mountains\"]', 50, 140, 4.7, 0, 0, NULL, '[\"https://i.pinimg.com/1200x/1b/02/7f/1b027fbc78646050b285dbd3ea52d6f4.jpg\"]', '2025-11-23 00:00:00'),
(26, 'Merzouga (Erg Chebbi)', 'Morocco', 'Merzouga', 'adventure', 'Merzouga is the entry to the giant Erg Chebbi dunes, offering camel tours and luxury desert camps.', '[\"desert\",\"adventure\",\"dunes\",\"camp\"]', 100, 260, 4.8, 0, 0, NULL, '[\"https://i.pinimg.com/1200x/cb/50/7a/cb507a9bc64bf477facdd2a4054c11d3.jpg\"]', '2025-11-23 00:00:00'),
(27, 'Giza Pyramids', 'Egypt', 'Giza', 'historical', 'The Giza Pyramids are one of the world’s most iconic archaeological sites and wonders of ancient Egypt.', '[\"pyramids\",\"historical\",\"unesco\",\"ancient\"]', 120, 300, 4.9, 0, 0, NULL, '[\"https://i.pinimg.com/736x/44/e7/fa/44e7fab364792c4127bc97a2045855ef.jpg\"]', '2025-11-23 00:00:00'),
(28, 'Sharm El Sheikh', 'Egypt', 'Sharm El Sheikh', 'beach', 'Sharm El Sheikh is known for its Red Sea beaches, luxury resorts, and world-class diving spots.', '[\"beach\",\"diving\",\"red-sea\",\"resort\"]', 80, 220, 4.6, 0, 0, NULL, '[\"https://i.pinimg.com/736x/f7/7f/fe/f77ffed088a4148b72843536dc59ca28.jpg\"]', '2025-11-23 00:00:00'),
(29, 'Luxor', 'Egypt', 'Luxor', 'cultural', 'Luxor is an open-air museum featuring Karnak Temple, Valley of the Kings, and ancient Egyptian monuments.', '[\"temples\",\"history\",\"culture\",\"ancient-egypt\"]', 70, 180, 4.7, 0, 0, NULL, '[\"https://i.pinimg.com/736x/35/3a/89/353a89890413e8f0fce5ea24497e96a3.jpg\"]', '2025-11-23 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `destination_collection`
--

CREATE TABLE `destination_collection` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(11) DEFAULT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `destination_orders` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`destination_orders`)),
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `updated_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `destination_collection`
--

INSERT INTO `destination_collection` (`id`, `name`, `description`, `slug`, `type`, `is_active`, `display_order`, `cover_image`, `destination_orders`, `created_at`, `updated_at`) VALUES
(1, 'tunisia', 'tunisia', 'tunisia', NULL, 1, NULL, 'https://i.pinimg.com/1200x/1b/02/7f/1b027fbc78646050b285dbd3ea52d6f4.jpg', '{\"21\":1,\"22\":2,\"23\":3}', '2026-01-05 00:33:43', '2026-01-05 00:43:11');

-- --------------------------------------------------------

--
-- Table structure for table `destination_collection_items`
--

CREATE TABLE `destination_collection_items` (
  `collection_id` int(11) NOT NULL,
  `destination_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `destination_collection_items`
--

INSERT INTO `destination_collection_items` (`collection_id`, `destination_id`) VALUES
(1, 21),
(1, 22),
(1, 23);

-- --------------------------------------------------------

--
-- Table structure for table `destination_review`
--

CREATE TABLE `destination_review` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `destination_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` longtext DEFAULT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `updated_at` datetime DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
  `is_public` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `destination_review`
--

INSERT INTO `destination_review` (`id`, `user_id`, `destination_id`, `rating`, `comment`, `created_at`, `updated_at`, `is_public`) VALUES
(1, 9, 12, 5, 'argentina😘😘😘', '2026-01-04 21:45:10', '2026-01-04 22:18:24', 1),
(2, 9, 13, 4, '👌👌😘😘', '2026-01-04 22:30:52', NULL, 1),
(3, 9, 11, 4, NULL, '2026-01-04 22:47:06', NULL, 1);

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
('DoctrineMigrations\\Version20251110154029', NULL, NULL),
('DoctrineMigrations\\Version20251119000000', '2025-11-19 22:30:56', 163),
('DoctrineMigrations\\Version20251121090000', '2025-11-21 15:42:04', 26),
('DoctrineMigrations\\Version20260104000000', '2026-01-04 19:04:49', 31),
('DoctrineMigrations\\Version20260104000001', '2026-01-04 19:04:50', 91),
('DoctrineMigrations\\Version20260104000002', '2026-01-04 19:04:50', 3),
('DoctrineMigrations\\Version20260104184826', '2026-01-04 19:58:52', 99),
('DoctrineMigrations\\Version20260104204717', '2026-01-04 21:54:05', 223),
('DoctrineMigrations\\Version20260104204738', '2026-01-04 21:55:35', 24);

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
(11, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-10 23:14:37', 1),
(12, 'admin@gmail.com', '127.0.0.1', '2025-11-19 22:35:17', 1),
(13, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-19 22:35:27', 1),
(14, 'admin@gmail.com', '127.0.0.1', '2025-11-19 22:47:33', 1),
(15, 'admin@gmail.com', '127.0.0.1', '2025-11-19 23:49:55', 1),
(16, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-20 00:14:00', 1),
(17, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-20 12:53:14', 1),
(18, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-20 14:35:18', 1),
(19, 'admin@gmail.com', '127.0.0.1', '2025-11-20 14:35:50', 1),
(20, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-20 14:36:16', 1),
(21, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-20 15:16:03', 1),
(22, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-20 15:32:24', 1),
(23, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-20 23:23:43', 1),
(24, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-21 10:39:50', 1),
(25, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-21 11:01:47', 1),
(26, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-21 11:04:22', 1),
(27, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-21 14:14:14', 1),
(28, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-21 15:18:36', 1),
(29, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-21 15:48:19', 1),
(30, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-21 16:25:55', 1),
(31, 'youssefdhib@gmail.com', '127.0.0.1', '2025-11-21 22:44:18', 1),
(32, 'admin@gmail.com', '127.0.0.1', '2025-11-21 23:24:55', 1),
(33, 'admin@gmail.com', '127.0.0.1', '2025-11-21 23:54:59', 1),
(34, 'admin@gmail.com', '127.0.0.1', '2025-11-22 00:04:35', 1),
(35, 'admin@gmail.com', '127.0.0.1', '2025-11-23 11:08:49', 1),
(36, 'admin@gmail.com', '127.0.0.1', '2025-11-23 11:17:26', 1),
(37, 'admin@gmail.com', '127.0.0.1', '2026-01-04 19:33:27', 1),
(38, 'admin@gmail.com', '127.0.0.1', '2026-01-04 19:37:50', 1),
(39, 'youssefdhib@gmail.com', '127.0.0.1', '2026-01-04 19:52:21', 1),
(40, 'test@gmail.com', '127.0.0.1', '2026-01-04 21:24:53', 1),
(41, 'test@gmail.com', '127.0.0.1', '2026-01-04 21:31:06', 0),
(42, 'test@gmail.com', '127.0.0.1', '2026-01-04 21:31:30', 1),
(43, 'test1@gmail.com', '127.0.0.1', '2026-01-04 21:42:36', 0),
(44, 'test@gmail.com', '127.0.0.1', '2026-01-04 21:42:45', 1),
(45, 'test@gmail.com', '127.0.0.1', '2026-01-04 21:56:10', 1),
(46, 'test@gmail.com', '127.0.0.1', '2026-01-04 21:57:26', 1),
(47, 'test@gmail.com', '127.0.0.1', '2026-01-04 22:08:08', 1),
(48, 'admin@gmail.com', '127.0.0.1', '2026-01-04 22:11:24', 1),
(49, 'test@gmail.com', '127.0.0.1', '2026-01-04 22:18:06', 1),
(50, 'admin@gmail.com', '127.0.0.1', '2026-01-04 22:20:36', 1),
(51, 'test@gmail.com', '127.0.0.1', '2026-01-04 22:30:20', 1),
(52, 'test@gmail.com', '127.0.0.1', '2026-01-04 22:34:19', 1),
(53, 'test@gmail.com', '127.0.0.1', '2026-01-04 22:41:47', 1),
(54, 'test@gmail.com', '127.0.0.1', '2026-01-05 00:26:55', 1),
(55, 'admin@gmail.com', '127.0.0.1', '2026-01-05 00:33:16', 1);

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
(1, 'admin@gmail.com', '[\"ROLE_ADMIN\"]', '$2y$13$k/VeLVFKvxiZiw3yUnqXg.SUlq9l5K5mF4Y2fHpgLa8Kc9xXWXGhm', 1, 'ACTIVE', 21, 0, NULL),
(5, 'youssefdhib@gmail.com', '[\"ROLE_USER\"]', '$2y$13$U8dViyHQ5MoWY9aKM4f4NeiDuzH1EVwdRWl0Y0F1/Znsgl.tSy1rW', 1, 'ACTIVE', 20, 0, NULL),
(6, 'demo1@triplink.test', '[\"ROLE_USER\"]', 'demo-password-hash', 1, 'ACTIVE', 1, 0, NULL),
(7, 'demo2@triplink.test', '[\"ROLE_USER\"]', 'demo-password-hash', 1, 'ACTIVE', 1, 0, NULL),
(8, 'demo3@triplink.test', '[\"ROLE_USER\"]', 'demo-password-hash', 1, 'ACTIVE', 1, 0, NULL),
(9, 'test@gmail.com', '[\"ROLE_USER\"]', '$2y$13$rMwnikg8GLpp/1SO/u16XuYtz8CDId/dkvQTRZKSOZMllv.iLe9u2', 1, 'ACTIVE', 12, 0, NULL);

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
(4, 5, '2025-11-10 23:14:09', '2026-01-04 19:52:21', '2026-01-04 19:52:21'),
(5, 9, '2026-01-04 21:24:36', '2026-01-05 00:26:55', '2026-01-05 00:26:55');

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
  `preference_categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '(DC2Type:json)' CHECK (json_valid(`preference_categories`)),
  `onboarding_completed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `travel_styles`, `interests`, `budget_range`, `profile_completion`, `personality_axis`, `preference_categories`, `onboarding_completed`) VALUES
(4, 5, '[\"Adventure\",\"Luxury\",\"Cultural\",\"Mountains\",\"Budget\"]', '[\"Nightlife\",\"History\",\"Shopping\"]', NULL, 0, '{\"adventurous\":50,\"cultural\":50,\"luxury\":50,\"budget\":50,\"spontaneous\":50,\"planned\":50,\"social\":50,\"solo\":50}', '{\"hotels\":77,\"hostels\":50,\"apartments\":50,\"resorts\":50,\"adventure\":50,\"culture\":50,\"nature\":50,\"nightlife\":70,\"local\":88,\"fineDining\":50,\"streetFood\":50,\"vegetarian\":50,\"flights\":83,\"trains\":50,\"buses\":50,\"cars\":50}', 0),
(5, 6, '[\"Adventure\",\"Budget\"]', '[\"Food\",\"Photography\"]', 'Medium', 60, '{\"adventurous\":60,\"cultural\":50,\"luxury\":30,\"budget\":70,\"spontaneous\":55,\"planned\":45,\"social\":50,\"solo\":50}', '{\"Accommodation\":{\"hotels\":60,\"hostels\":40,\"apartments\":50,\"resorts\":30}}', 0),
(6, 7, '[\"Luxury\",\"Beach\"]', '[\"Shopping\",\"Food\"]', 'High', 65, '{\"adventurous\":40,\"cultural\":55,\"luxury\":80,\"budget\":30,\"spontaneous\":50,\"planned\":60,\"social\":70,\"solo\":40}', '{\"Food\":{\"fineDining\":80,\"local\":60}}', 0),
(7, 8, '[\"Cultural\",\"Mountains\"]', '[\"Photography\",\"Shopping\"]', 'Low', 55, '{\"adventurous\":70,\"cultural\":75,\"luxury\":20,\"budget\":80,\"spontaneous\":60,\"planned\":50,\"social\":45,\"solo\":65}', '{\"Activities\":{\"adventure\":70,\"culture\":80}}', 0),
(8, 9, '[\"Adventure\",\"Mountains\"]', '[\"Nature\",\"History\"]', NULL, 0, '{\"adventurous\":100,\"cultural\":50,\"luxury\":50,\"budget\":50,\"spontaneous\":75,\"planned\":50,\"social\":50,\"solo\":50}', '{\"hotels\":50,\"hostels\":50,\"apartments\":50,\"resorts\":50,\"adventure\":50,\"culture\":50,\"nature\":50,\"nightlife\":50,\"local\":50,\"fineDining\":50,\"streetFood\":50,\"vegetarian\":50,\"flights\":50,\"trains\":50,\"buses\":50,\"cars\":50}', 0);

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
(4, 5, 'youssef', 'DHIB', '99757218', 'avatar_695ab73b1113a9.18096408.png'),
(5, 6, 'Demo', 'One', '1111111111', NULL),
(6, 7, 'Demo', 'Two', '2222222222', NULL),
(7, 8, 'Demo', 'Three', '3333333333', NULL),
(8, 9, 'test', 'test', '1234567890', '695acc84b5b34.png');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist_item`
--

CREATE TABLE `wishlist_item` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `destination_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wishlist_item`
--

INSERT INTO `wishlist_item` (`id`, `user_id`, `destination_id`, `created_at`) VALUES
(1, 6, 1, '2025-11-21 15:42:04'),
(2, 6, 3, '2025-11-21 15:42:04'),
(3, 6, 2, '2025-11-21 15:42:04'),
(4, 7, 5, '2025-11-21 15:42:04'),
(5, 7, 7, '2025-11-21 15:42:04'),
(7, 8, 9, '2025-11-21 15:42:04'),
(8, 8, 10, '2025-11-21 15:42:04'),
(9, 8, 6, '2025-11-21 15:42:04'),
(14, 5, 5, '2025-11-21 22:56:52'),
(15, 5, 9, '2025-11-21 22:56:59'),
(16, 5, 7, '2025-11-21 22:57:21'),
(17, 9, 13, '2026-01-05 00:27:14'),
(18, 9, 11, '2026-01-05 00:27:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_user` (`user_id`),
  ADD KEY `idx_activity_created` (`created_at`);

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
-- Indexes for table `destination`
--
ALTER TABLE `destination`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `destination_collection`
--
ALTER TABLE `destination_collection`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_A174FE80989D9B62` (`slug`);

--
-- Indexes for table `destination_collection_items`
--
ALTER TABLE `destination_collection_items`
  ADD PRIMARY KEY (`collection_id`,`destination_id`),
  ADD KEY `IDX_BE75FFA9514956FD` (`collection_id`),
  ADD KEY `IDX_BE75FFA9816C6140` (`destination_id`);

--
-- Indexes for table `destination_review`
--
ALTER TABLE `destination_review`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_destination_review` (`user_id`,`destination_id`),
  ADD KEY `idx_review_destination` (`destination_id`),
  ADD KEY `idx_review_user` (`user_id`);

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
-- Indexes for table `wishlist_item`
--
ALTER TABLE `wishlist_item`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_wishlist_user_destination` (`user_id`,`destination_id`),
  ADD KEY `IDX_6424F4E8A76ED395` (`user_id`),
  ADD KEY `IDX_6424F4E8816C6140` (`destination_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `auth_session`
--
ALTER TABLE `auth_session`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `blacklisted_token`
--
ALTER TABLE `blacklisted_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `destination`
--
ALTER TABLE `destination`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `destination_collection`
--
ALTER TABLE `destination_collection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `destination_review`
--
ALTER TABLE `destination_review`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `reset_password_request`
--
ALTER TABLE `reset_password_request`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `user_activity`
--
ALTER TABLE `user_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_profile`
--
ALTER TABLE `user_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `wishlist_item`
--
ALTER TABLE `wishlist_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `FK_FD06F647A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `destination_collection_items`
--
ALTER TABLE `destination_collection_items`
  ADD CONSTRAINT `FK_collection_items_collection` FOREIGN KEY (`collection_id`) REFERENCES `destination_collection` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_collection_items_destination` FOREIGN KEY (`destination_id`) REFERENCES `destination` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `destination_review`
--
ALTER TABLE `destination_review`
  ADD CONSTRAINT `FK_2B7A1E51816C6140` FOREIGN KEY (`destination_id`) REFERENCES `destination` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_2B7A1E51A76ED395` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

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

--
-- Constraints for table `wishlist_item`
--
ALTER TABLE `wishlist_item`
  ADD CONSTRAINT `FK_wishlist_destination` FOREIGN KEY (`destination_id`) REFERENCES `destination` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
