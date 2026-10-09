-- MySQL dump 10.13  Distrib 8.4.11, for macos15 (arm64)
--
-- Host: localhost    Database: night_mess
-- ------------------------------------------------------
-- Server version	8.4.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Booking`
--

DROP TABLE IF EXISTS `Booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Booking` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `slot_id` int NOT NULL,
  `booking_date` date NOT NULL,
  `status` enum('PLACED','CONFIRMED','PREPARING','READY','COLLECTED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PLACED',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`booking_id`),
  KEY `student_id` (`student_id`),
  KEY `slot_id` (`slot_id`),
  CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Students` (`student_id`),
  CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`slot_id`) REFERENCES `Time_Slot` (`slot_id`),
  CONSTRAINT `booking_chk_1` CHECK ((`total_amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Booking_Item`
--

DROP TABLE IF EXISTS `Booking_Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Booking_Item` (
  `booking_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`booking_id`,`item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `booking_item_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `Booking` (`booking_id`),
  CONSTRAINT `booking_item_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `Menu_Item` (`item_id`),
  CONSTRAINT `booking_item_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `booking_item_chk_2` CHECK ((`unit_price` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Daily_Stock`
--

DROP TABLE IF EXISTS `Daily_Stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Daily_Stock` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `stock_date` date NOT NULL,
  `qty_prepared` int NOT NULL,
  `qty_remaining` int NOT NULL,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `item_id` (`item_id`,`stock_date`),
  CONSTRAINT `daily_stock_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `Menu_Item` (`item_id`),
  CONSTRAINT `daily_stock_chk_1` CHECK ((`qty_prepared` >= 0)),
  CONSTRAINT `daily_stock_chk_2` CHECK ((`qty_remaining` >= 0)),
  CONSTRAINT `daily_stock_chk_3` CHECK ((`qty_remaining` <= `qty_prepared`))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Feedback`
--

DROP TABLE IF EXISTS `Feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Feedback` (
  `feedback_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`feedback_id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `Booking` (`booking_id`),
  CONSTRAINT `feedback_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hostel`
--

DROP TABLE IF EXISTS `Hostel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Hostel` (
  `hostel_id` int NOT NULL AUTO_INCREMENT,
  `hostel_name` varchar(100) NOT NULL,
  `block` varchar(20) NOT NULL,
  PRIMARY KEY (`hostel_id`),
  UNIQUE KEY `block` (`block`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Menu_Item`
--

DROP TABLE IF EXISTS `Menu_Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Menu_Item` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_veg` tinyint(1) NOT NULL DEFAULT '1',
  `prep_time_min` int NOT NULL DEFAULT '5',
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `item_name` (`item_name`),
  CONSTRAINT `menu_item_chk_1` CHECK ((`price` >= 0)),
  CONSTRAINT `menu_item_chk_2` CHECK ((`prep_time_min` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Payment`
--

DROP TABLE IF EXISTS `Payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `mode` enum('UPI','COUNTER') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `pay_status` enum('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `paid_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `Booking` (`booking_id`),
  CONSTRAINT `payment_chk_1` CHECK ((`amount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Queue_Token`
--

DROP TABLE IF EXISTS `Queue_Token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Queue_Token` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `token_date` date NOT NULL,
  `token_no` int NOT NULL,
  `queue_status` enum('WAITING','PREPARING','READY','COLLECTED','EXPIRED') NOT NULL DEFAULT 'WAITING',
  `issued_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `served_by` int DEFAULT NULL,
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  UNIQUE KEY `token_date` (`token_date`,`token_no`),
  KEY `served_by` (`served_by`),
  CONSTRAINT `queue_token_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `Booking` (`booking_id`),
  CONSTRAINT `queue_token_ibfk_2` FOREIGN KEY (`served_by`) REFERENCES `Staff` (`staff_id`),
  CONSTRAINT `queue_token_chk_1` CHECK ((`token_no` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Staff`
--

DROP TABLE IF EXISTS `Staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Staff` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` enum('STAFF','ADMIN','WARDEN') NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Students`
--

DROP TABLE IF EXISTS `Students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `reg_no` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `hostel_id` int NOT NULL,
  `room_no` varchar(20) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `reg_no` (`reg_no`),
  UNIQUE KEY `email` (`email`),
  KEY `hostel_id` (`hostel_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`hostel_id`) REFERENCES `Hostel` (`hostel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Time_Slot`
--

DROP TABLE IF EXISTS `Time_Slot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Time_Slot` (
  `slot_id` int NOT NULL AUTO_INCREMENT,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `max_orders` int NOT NULL,
  PRIMARY KEY (`slot_id`),
  UNIQUE KEY `start_time` (`start_time`,`end_time`),
  CONSTRAINT `time_slot_chk_1` CHECK ((`end_time` > `start_time`)),
  CONSTRAINT `time_slot_chk_2` CHECK ((`max_orders` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-09 20:02:16
