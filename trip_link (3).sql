-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 22, 2025 at 01:54 PM
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

--
-- Dumping data for table `auth_session`
--

INSERT INTO `auth_session` (`id`, `user_id`, `session_id`, `jwt_token`, `refresh_token`, `created_at`, `expires_at`, `device_info`, `ip_address`) VALUES
(8, 5, '8be7dc0d647efe0a86db734e58a7e32113ef01d0bc2631feaa6134b62f494027', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM1ODgxMjgsImV4cCI6MTc2MzU5MTcyOCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.WlVD6PsCwfSvghfLV7W73yDmsqWF3rUj_ovRfGLAN8q02OrX72JeQmI7JMxF9hJDLeXx6n-WJ8pzwJGkGgddp1WeXerPsYVI0KiT3wJYq3KvPXUNtzXxltIRrLRBSfZl3DHkKRmsSBpQcZev9_Ct0sextCEnLxspatC05QTqvMq3OximNS-C5Sc5Imz0trrb57P7QkBB3N0IX3BWkpE-clDf123QOtO0CDKcptUPmgRsVq9Bt2y7P9kzIKO5iVZBq0uql_DuSmcYE2LMxsqWnFJb156RSkuyvLoNeY__ulJOlUTN013zApolqxrknf4myGjBJAR3JcySiKsEMRTPdA', 'abbcf38a50ab3ed1e85940be7fd777987aac2e33123cb1b58dbe2ad0de24f983', '2025-11-19 22:35:28', '2025-11-19 23:35:28', NULL, '127.0.0.1'),
(18, 5, '549d1ae0e1bb5d2ad7889b7e38c0f8f62fb4f0b5787aa9de2f7069978ba239d5', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3MTk0NjIsImV4cCI6MTc2MzcyMzA2Miwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.eDCPIrAE5BZdPbmjp8_wMnwCnJM1krgq70QlaaACFRlgqvaACebeYNndqfKAAAaRAlCs7ayq7snxtG9VpinD15I_5_DQg-u8StrHhCF3R5pnwU7tGB6eig2MnFL0D6KMxB6FoChV_hfIRcBLebOr7FIl6ZmIPuKZSNA75nbyplvnKLLdfZDjgI2uymV3dwS-gIeLgyTbVdgQeNhDEaD0-gQZMgLwpBPFjF936OoZUBJDWxNiDIbG95CsPTFkWZi1dNj0w9l9Y4KIfdY3x-HddSPpw3kRCGw7f-d1y5hiUmKg-AaJ17N1BJsEZ-Z1iOBHh2RFLx3riKFrcsWkOilwEg', '79c9bbd419da8ccb49586661f7b3dc82d2b553cdd3233ed4277ecbeda7176fff', '2025-11-21 11:04:22', '2025-11-21 12:04:22', NULL, '127.0.0.1'),
(19, 5, '8a590862b65b7baad5d03e4d73ca5d5b42eaf2d3ba4006171d152ea822d2d666', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3MzA4NTUsImV4cCI6MTc2MzczNDQ1NSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.MOjlFgve706pTBPh9TBhFjg_jZlYeZT9dgqHT5o2A5rlGGFX-Mfp6PBa-2pszwm4QTQvkeUqgBsi6FWgqNZPJPprCvXjkfKvlHpWnWMdqsN8uXPc_lWXwbniaDBnEbrBZcHAajFAR_y5NrHPbo8z-Skeh2YG1Iea-HPke8XSfwZUBF8M_YXN6WbOkq8OTEmQ75LfMy1cErMdaaqWecwXQ7ctuhaPiTuVaIFVE1o3sznhhcvWZqwZm1H06DeSj8pzDoprtrjP8EvQorX3Ejiw1ybECQwnW3Tel_2li1e_-uh7btKKyDVXZmsTVeTin9t4JiUc8c4d1S3UV4OlXujG0A', 'ab4df2a4eacc440f2a21f476c4638c22655f70166006ebcea5c61c86de5bf94e', '2025-11-21 14:14:15', '2025-11-21 15:14:15', NULL, '127.0.0.1'),
(20, 5, '1a22afab5d03df368f7c2e4709446055525b3d80a5291118b7895e93b5c08cd4', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3MzQ3MTcsImV4cCI6MTc2MzczODMxNywicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.cBAUENmfIAgOzderfrMTqEfr8LVcjZhoZ724KSy0K_58nPNz_XRG_WTg-RmIszzt1ETXxlgrlp7g_YI8jAjopcQ1tyQRn35Eb_Xu4Bk_2schodCNl4K-IXixMNECukoQv9xd-4e-1WEuxp6l5jCCANxg9njry-rDspIMK35dn_NzHfBDU2PsKl1xCXCtJGzAkYIa2z9Y0nRdGqSqowTwK5Y3Y49Wz_5T2D1a47NaXCkHrwGnlhO_NE-dJ32KBmCHldKscbqXQPhhhsjqDNw7N5DG_1euf59N_jLg5xIjtSSscaLT0Tqa6QKVsyuGroDq3B94vhP_gb7UDXvw0rtzQg', '6fdf4ff67088a70de63affc2cc66527f295b572c68bc8bbbc07ccb1e0ddd0ca3', '2025-11-21 15:18:37', '2025-11-21 16:18:37', NULL, '127.0.0.1'),
(22, 5, '41b279f9e89d8b317745d93ea39b0357607c437fd18fad575edbef602f128479', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3Mzg3NTUsImV4cCI6MTc2Mzc0MjM1NSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.bpYRXqGWA2NIknmd54PBvTe8gyeQic0FMuQhLxH7N-wpPUNHXa-9kDRGwfhWUNPpvOK9AJCXPAY6dvFCIvioy2a9K3KwGs35XDsM7BwMoJmoGXgCZu_LMOcU1WE48PeOMV_VHDzR8m4g3U16TLXC8MEaGlUxtul-D77Ex7soDpjOXWx-1Xuk_mPRdos5pyQlWQ_TFHREvhfzczSjRf8mwci9BRqHkIsBaVXquAuEGxVLk_ACMGdBbIRRyOHniPD4ydGCgJGc2V80uIhEnKv5eH83UpgMJcer7c7KAz_uqsNk2cTsXu45XkCuoECTOxv7-TfBlKAEBJu1mWUSDH32ww', '71bd47b88dbdc49f817f4115d3c9a0fd72ec8b5e2b67f33160a26b262afc4852', '2025-11-21 16:25:55', '2025-11-21 17:25:55', NULL, '127.0.0.1');

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
(14, 5, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NjM3NjE0NTgsImV4cCI6MTc2Mzc2NTA1OCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoieW91c3NlZmRoaWJAZ21haWwuY29tIn0.Z7U-7fi7rHf1EmARncf2wW8Q-SNk-c4G6TqsM5S5bHq8OIxtZitoSeRBfZsAoaTpY9YBkwYkYa3kohyqLuX3L5D9B2EiuujD3LZSPd0uLy_00iMQTQYnisIDSd7zm0edQQ1TMhXnjEYAK-m5M2xy9HwzMRzz9ehrqxSPbgob7WxGWe7PdgzccgFcPMQvofUHrt9St200TKF_R9ti1xuSbYlFxmGo6wpl16QgIth2srGy_An5_EZcHZm5k5guVDTbLz7yTZ6LW0Unic722trScjxho6LelevsJA589tW-8mxqnAtF8i_fJwjtEuTAs-Jk9yalXj7PK_1lx6s8B7q', '2025-11-21 23:24:49', '2025-11-22 00:24:49');

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
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `destination`
--

INSERT INTO `destination` (`id`, `name`, `country`, `city`, `category`, `description`, `tags`, `price_min`, `price_max`, `rating`, `images`, `created_at`) VALUES
(1, 'Paris', 'France', 'Paris', 'city', 'City of lights and culture', NULL, 120, 280, 4.8, '[\"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04'),
(2, 'Tokyo', 'Japan', 'Tokyo', 'city', 'Vibrant metropolis blending tradition and technology', NULL, 90, 220, 4.7, '[\"https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04'),
(3, 'Bali', 'Indonesia', 'Ubud', 'beach', 'Tropical paradise with rich culture', NULL, 70, 180, 4.6, '[\"https://images.unsplash.com/photo-1516997125298-4e3b7f0036d2?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04'),
(4, 'New York', 'USA', 'New York', 'city', 'Iconic skyline and endless attractions', NULL, 140, 320, 4.5, '[\"https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04'),
(5, 'Dubai', 'UAE', 'Dubai', 'luxury', 'Luxury shopping and modern architecture', NULL, 160, 380, 4.6, '[\"https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04'),
(6, 'Barcelona', 'Spain', 'Barcelona', 'cultural', 'Gaudi architecture and Mediterranean vibes', NULL, 100, 240, 4.7, '[\"https://images.unsplash.com/photo-1544989164-311a6d12df5f?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04'),
(7, 'Santorini', 'Greece', 'Santorini', 'romance', 'Whitewashed cliffs and sunset views', NULL, 150, 350, 4.8, '[\"https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04'),
(9, 'Swiss Alps', 'Switzerland', 'Zermatt', 'mountain', 'Alpine peaks with world-class skiing', NULL, 130, 300, 4.7, '[\"https://images.unsplash.com/photo-1470777631079-1e18c5e0dc2d?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04'),
(10, 'Kyoto', 'Japan', 'Kyoto', 'cultural', 'Historic temples and serene gardens', NULL, 80, 200, 4.6, '[\"https://images.unsplash.com/photo-1465311440660-74f6d35b6a67?auto=format&fit=crop&w=1600&q=80\"]', '2025-11-21 15:42:04');

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
('DoctrineMigrations\\Version20251121090000', '2025-11-21 15:42:04', 26);

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
(34, 'admin@gmail.com', '127.0.0.1', '2025-11-22 00:04:35', 1);

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
(1, 'admin@gmail.com', '[\"ROLE_ADMIN\"]', '$2y$13$k/VeLVFKvxiZiw3yUnqXg.SUlq9l5K5mF4Y2fHpgLa8Kc9xXWXGhm', 1, 'ACTIVE', 14, 0, NULL),
(5, 'youssefdhib@gmail.com', '[\"ROLE_USER\"]', '$2y$13$U8dViyHQ5MoWY9aKM4f4NeiDuzH1EVwdRWl0Y0F1/Znsgl.tSy1rW', 1, 'ACTIVE', 19, 0, NULL),
(6, 'demo1@triplink.test', '[\"ROLE_USER\"]', 'demo-password-hash', 1, 'ACTIVE', 1, 0, NULL),
(7, 'demo2@triplink.test', '[\"ROLE_USER\"]', 'demo-password-hash', 1, 'ACTIVE', 1, 0, NULL),
(8, 'demo3@triplink.test', '[\"ROLE_USER\"]', 'demo-password-hash', 1, 'ACTIVE', 1, 0, NULL);

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
(4, 5, '2025-11-10 23:14:09', '2025-11-21 22:44:18', '2025-11-21 22:44:18');

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
(4, 5, '[\"Adventure\",\"Luxury\",\"Cultural\",\"Mountains\",\"Budget\"]', '[\"Nightlife\",\"History\",\"Shopping\"]', NULL, 0, '{\"adventurous\":50,\"cultural\":50,\"luxury\":50,\"budget\":50,\"spontaneous\":50,\"planned\":50,\"social\":50,\"solo\":50}', '{\"hotels\":77,\"hostels\":50,\"apartments\":50,\"resorts\":50,\"adventure\":50,\"culture\":50,\"nature\":50,\"nightlife\":70,\"local\":88,\"fineDining\":50,\"streetFood\":50,\"vegetarian\":50,\"flights\":83,\"trains\":50,\"buses\":50,\"cars\":50}'),
(5, 6, '[\"Adventure\",\"Budget\"]', '[\"Food\",\"Photography\"]', 'Medium', 60, '{\"adventurous\":60,\"cultural\":50,\"luxury\":30,\"budget\":70,\"spontaneous\":55,\"planned\":45,\"social\":50,\"solo\":50}', '{\"Accommodation\":{\"hotels\":60,\"hostels\":40,\"apartments\":50,\"resorts\":30}}'),
(6, 7, '[\"Luxury\",\"Beach\"]', '[\"Shopping\",\"Food\"]', 'High', 65, '{\"adventurous\":40,\"cultural\":55,\"luxury\":80,\"budget\":30,\"spontaneous\":50,\"planned\":60,\"social\":70,\"solo\":40}', '{\"Food\":{\"fineDining\":80,\"local\":60}}'),
(7, 8, '[\"Cultural\",\"Mountains\"]', '[\"Photography\",\"Shopping\"]', 'Low', 55, '{\"adventurous\":70,\"cultural\":75,\"luxury\":20,\"budget\":80,\"spontaneous\":60,\"planned\":50,\"social\":45,\"solo\":65}', '{\"Activities\":{\"adventure\":70,\"culture\":80}}');

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
(4, 5, 'youssef', 'DHIB', '99757218', NULL),
(5, 6, 'Demo', 'One', '1111111111', NULL),
(6, 7, 'Demo', 'Two', '2222222222', NULL),
(7, 8, 'Demo', 'Three', '3333333333', NULL);

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
(16, 5, 7, '2025-11-21 22:57:21');

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
-- Indexes for table `destination`
--
ALTER TABLE `destination`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_destination_search` (`name`,`country`);

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
  ADD KEY `IDX_wishlist_user` (`user_id`),
  ADD KEY `IDX_wishlist_destination` (`destination_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_session`
--
ALTER TABLE `auth_session`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `blacklisted_token`
--
ALTER TABLE `blacklisted_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `destination`
--
ALTER TABLE `destination`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `email_verification`
--
ALTER TABLE `email_verification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_attempt`
--
ALTER TABLE `login_attempt`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `reset_password_request`
--
ALTER TABLE `reset_password_request`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_activity`
--
ALTER TABLE `user_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_profile`
--
ALTER TABLE `user_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `wishlist_item`
--
ALTER TABLE `wishlist_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
