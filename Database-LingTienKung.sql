-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for ling_tien_kung_db
CREATE DATABASE IF NOT EXISTS `ling_tien_kung_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ling_tien_kung_db`;

-- Dumping structure for table ling_tien_kung_db.data_sensor
CREATE TABLE IF NOT EXISTS `data_sensor` (
  `id_data` bigint NOT NULL AUTO_INCREMENT,
  `timestamp` datetime(3) NOT NULL,
  `device_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `id_gerakan` int NOT NULL,
  `ax` double DEFAULT NULL,
  `ay` double DEFAULT NULL,
  `az` double DEFAULT NULL,
  `gx` double DEFAULT NULL,
  `gy` double DEFAULT NULL,
  `gz` double DEFAULT NULL,
  `mx` double DEFAULT NULL,
  `my` double DEFAULT NULL,
  `mz` double DEFAULT NULL,
  `id_sesi` int NOT NULL,
  PRIMARY KEY (`id_data`),
  KEY `id_gerakan` (`id_gerakan`),
  KEY `id_sesi` (`id_sesi`),
  CONSTRAINT `data_sensor_ibfk_2` FOREIGN KEY (`id_gerakan`) REFERENCES `gerakan_latihan` (`id_gerakan`) ON DELETE CASCADE,
  CONSTRAINT `data_sensor_ibfk_3` FOREIGN KEY (`id_sesi`) REFERENCES `sesi_latihan` (`id_sesi`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12548 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table ling_tien_kung_db.gerakan_latihan
CREATE TABLE IF NOT EXISTS `gerakan_latihan` (
  `id_gerakan` int NOT NULL AUTO_INCREMENT,
  `nama_gerakan` varchar(100) DEFAULT NULL,
  `url_gerakan` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id_gerakan`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table ling_tien_kung_db.hasil_ml
CREATE TABLE IF NOT EXISTS `hasil_ml` (
  `id_analisis` int NOT NULL AUTO_INCREMENT,
  `id_gerakan` int DEFAULT NULL,
  `id_sesi` int DEFAULT NULL,
  `skor_gerakan` float DEFAULT NULL,
  `catatan_feedback` text,
  `waktu_analisis` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_analisis`),
  KEY `id_gerakan` (`id_gerakan`),
  KEY `id_sesi` (`id_sesi`),
  CONSTRAINT `hasil_ml_ibfk_1` FOREIGN KEY (`id_gerakan`) REFERENCES `gerakan_latihan` (`id_gerakan`) ON DELETE CASCADE,
  CONSTRAINT `hasil_ml_ibfk_2` FOREIGN KEY (`id_sesi`) REFERENCES `sesi_latihan` (`id_sesi`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table ling_tien_kung_db.pengguna
CREATE TABLE IF NOT EXISTS `pengguna` (
  `id_pengguna` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'user',
  `status_pengguna` enum('active','deactive','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pending',
  `usia` int DEFAULT NULL,
  `jenis_kelamin` enum('L','P') DEFAULT NULL,
  `tanggal_daftar` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pengguna`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table ling_tien_kung_db.perangkat_iot
CREATE TABLE IF NOT EXISTS `perangkat_iot` (
  `id_perangkat` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int DEFAULT NULL,
  `nama_perangkat` varchar(100) DEFAULT NULL,
  `mac_address` varchar(50) DEFAULT NULL,
  `status_koneksi` enum('online','offline') DEFAULT NULL,
  `tanggal_registrasi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_perangkat`),
  KEY `id_pengguna` (`id_pengguna`),
  CONSTRAINT `perangkat_iot_ibfk_1` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

-- Dumping structure for table ling_tien_kung_db.sesi_latihan
CREATE TABLE IF NOT EXISTS `sesi_latihan` (
  `id_sesi` int NOT NULL AUTO_INCREMENT,
  `id_pengguna` int DEFAULT NULL,
  `waktu_mulai` datetime DEFAULT NULL,
  `waktu_selesai` datetime DEFAULT NULL,
  `status_sesi` enum('aktif','berhenti','selesai') DEFAULT NULL,
  `total_durasi` int DEFAULT NULL,
  PRIMARY KEY (`id_sesi`),
  KEY `id_pengguna` (`id_pengguna`),
  CONSTRAINT `sesi_latihan_ibfk_1` FOREIGN KEY (`id_pengguna`) REFERENCES `pengguna` (`id_pengguna`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
