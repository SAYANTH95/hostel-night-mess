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
-- Dumping data for table `Booking`
--

LOCK TABLES `Booking` WRITE;
/*!40000 ALTER TABLE `Booking` DISABLE KEYS */;
/*!40000 ALTER TABLE `Booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Booking_Item`
--

LOCK TABLES `Booking_Item` WRITE;
/*!40000 ALTER TABLE `Booking_Item` DISABLE KEYS */;
/*!40000 ALTER TABLE `Booking_Item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Daily_Stock`
--

LOCK TABLES `Daily_Stock` WRITE;
/*!40000 ALTER TABLE `Daily_Stock` DISABLE KEYS */;
INSERT INTO `Daily_Stock` VALUES (1,1,'2026-10-09',20,20),(2,2,'2026-10-09',15,15),(3,3,'2026-10-09',30,30),(4,4,'2026-10-09',25,25),(5,5,'2026-10-09',40,40);
/*!40000 ALTER TABLE `Daily_Stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Feedback`
--

LOCK TABLES `Feedback` WRITE;
/*!40000 ALTER TABLE `Feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `Feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Hostel`
--

LOCK TABLES `Hostel` WRITE;
/*!40000 ALTER TABLE `Hostel` DISABLE KEYS */;
INSERT INTO `Hostel` VALUES (1,'Mens Hostel','A'),(2,'Mens Hostel','B');
/*!40000 ALTER TABLE `Hostel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Menu_Item`
--

LOCK TABLES `Menu_Item` WRITE;
/*!40000 ALTER TABLE `Menu_Item` DISABLE KEYS */;
INSERT INTO `Menu_Item` VALUES (1,'Veg Sandwich','Snacks',50.00,1,5,1),(2,'Chicken Sandwich','Snacks',70.00,0,8,1),(3,'Maggi','Quick Meals',40.00,1,6,1),(4,'Cold Coffee','Beverages',45.00,1,3,1),(5,'Samosa','Snacks',20.00,1,2,1);
/*!40000 ALTER TABLE `Menu_Item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Payment`
--

LOCK TABLES `Payment` WRITE;
/*!40000 ALTER TABLE `Payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `Payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Queue_Token`
--

LOCK TABLES `Queue_Token` WRITE;
/*!40000 ALTER TABLE `Queue_Token` DISABLE KEYS */;
/*!40000 ALTER TABLE `Queue_Token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Staff`
--

LOCK TABLES `Staff` WRITE;
/*!40000 ALTER TABLE `Staff` DISABLE KEYS */;
INSERT INTO `Staff` VALUES (1,'Mess Staff','STAFF','9000000010'),(2,'Mess Admin','ADMIN','9000000011');
/*!40000 ALTER TABLE `Staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Students`
--

LOCK TABLES `Students` WRITE;
/*!40000 ALTER TABLE `Students` DISABLE KEYS */;
INSERT INTO `Students` VALUES (1,'25MID0101','Student One',1,'101','9000000001','student1@example.com'),(2,'25MID0120','Student Two',2,'204','9000000002','student2@example.com');
/*!40000 ALTER TABLE `Students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Time_Slot`
--

LOCK TABLES `Time_Slot` WRITE;
/*!40000 ALTER TABLE `Time_Slot` DISABLE KEYS */;
INSERT INTO `Time_Slot` VALUES (1,'21:00:00','21:15:00',10),(2,'21:15:00','21:30:00',10),(3,'21:30:00','21:45:00',10),(4,'21:45:00','22:00:00',10);
/*!40000 ALTER TABLE `Time_Slot` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-09 20:02:25
