-- MySQL dump 10.13  Distrib 8.4.3, for Linux (aarch64)
--
-- Host: localhost    Database: inventorydb
-- ------------------------------------------------------
-- Server version	8.4.3

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
-- Table structure for table `AuditLogs`
--

DROP TABLE IF EXISTS `AuditLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AuditLogs` (
  `LogID` int NOT NULL AUTO_INCREMENT,
  `ProductID` int DEFAULT NULL,
  `InventoryID` int DEFAULT NULL,
  `EmployeeID` int DEFAULT NULL,
  `TransactionDate` timestamp NULL DEFAULT NULL,
  `TransactionType` varchar(255) DEFAULT NULL,
  `QuantityChanged` int DEFAULT NULL,
  PRIMARY KEY (`LogID`),
  KEY `ProductID` (`ProductID`),
  KEY `InventoryID` (`InventoryID`),
  KEY `EmployeeID` (`EmployeeID`),
  CONSTRAINT `auditlogs_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`),
  CONSTRAINT `auditlogs_ibfk_2` FOREIGN KEY (`InventoryID`) REFERENCES `Inventory` (`InventoryID`),
  CONSTRAINT `auditlogs_ibfk_3` FOREIGN KEY (`EmployeeID`) REFERENCES `Employees` (`EmployeeID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AuditLogs`
--

LOCK TABLES `AuditLogs` WRITE;
/*!40000 ALTER TABLE `AuditLogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `AuditLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Employees`
--

DROP TABLE IF EXISTS `Employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Employees` (
  `EmployeeID` int NOT NULL,
  `FirstName` varchar(255) DEFAULT NULL,
  `LastName` varchar(255) DEFAULT NULL,
  `CurrentPosition` varchar(255) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Username` varchar(50) NOT NULL,
  `Password_hash` varchar(255) NOT NULL,
  `Role` enum('admin','user') NOT NULL,
  PRIMARY KEY (`EmployeeID`),
  UNIQUE KEY `username` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Employees`
--

LOCK TABLES `Employees` WRITE;
/*!40000 ALTER TABLE `Employees` DISABLE KEYS */;
INSERT INTO `Employees` VALUES (1,'Joshua','Hur','Aircraft Maintenance Technician','jhur1@umbc.edu','(301) 787-9455','employee_1','$2b$12$web02jNxFJqjD/AtByVw0ei7nR92O5X8BogvwHlguhr.4hWA2WyCa','admin'),(2,'Matthew','Dyson','Colonel','mdyson2@umbc.edu','(301) 131-2342','employee_2','$2b$12$LS1GqydL7e/CG7fnFOLaMeqefqY9c4SvHvRNbtZo1/5Ua7gRkHBz2','admin'),(3,'Jon','Woods','Captain','jwoods6@umbc.edu','(240) 564-3556','employee_3','$2b$12$3MUweVh0kGOXb59nrARPG.xkY7pcVDW9yj9nbzAvrBee9PISiUoZO','user'),(4,'Alexander','Gudat','Lieutenant','agudat1@umbc.edu','(443) 612-1364','employee_4','$2b$12$m7JYFxNOr3fkt2ucAOHpeue.3AnsoQDgiGxds5KW7juJ5prcOzpwK','user'),(5,'Ben','Maher','Weapons Specialist','bmaher1@umbc.edu','(301) 311-2542','employee_5','$2b$12$6UvqAGA9drSMELXoH9tnW.UyYUblriyIFwhZMtmnkscFQnH.VhBl2','user');
/*!40000 ALTER TABLE `Employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Inventory`
--

DROP TABLE IF EXISTS `Inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Inventory` (
  `InventoryID` int NOT NULL,
  `ProductID` int DEFAULT NULL,
  `CurrentQuantity` int NOT NULL,
  `AssignedLocation` varchar(255) DEFAULT NULL,
  `LocationState` varchar(10) DEFAULT NULL,
  `MaxCapacity` int DEFAULT NULL,
  `Threshold` float DEFAULT NULL,
  PRIMARY KEY (`InventoryID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Inventory`
--

LOCK TABLES `Inventory` WRITE;
/*!40000 ALTER TABLE `Inventory` DISABLE KEYS */;
INSERT INTO `Inventory` VALUES (1,1,9,'Fort Bragg','NC',12,0.2),(2,2,10,'Edwards AFB','CA',24,0.25),(3,3,45,'Naval Base San Diego','CA',125,0.1),(4,4,195,'Fort Benning','GA',200,0.3),(5,5,3,'Norfolk Naval Shipyard','VA',3,0.1),(6,6,50,'Fort Hood','TX',60,0.2),(7,7,75,'Fort Bliss','TX',100,0.3),(8,8,120,'Fort Campbell','KY',150,0.25),(9,9,40,'Camp Lejeune','NC',50,0.2),(10,10,35,'Fort Sill','OK',40,0.25),(11,11,30,'Fort Lee','VA',40,0.25),(12,12,25,'Fort Knox','KY',35,0.2),(13,13,90,'Fort McClellan','AL',100,0.15),(14,14,80,'Fort Meade','MD',90,0.15),(15,15,45,'Fort Bragg','NC',50,0.2),(16,16,50,'Fort Hood','TX',60,0.2),(17,17,85,'Fort Benning','GA',100,0.15),(18,18,100,'Camp Pendleton','CA',120,0.15),(19,19,60,'Fort Campbell','KY',70,0.15),(20,20,50,'Fort Polk','LA',60,0.2),(21,21,200,'Fort Bliss','TX',250,0.2),(22,22,180,'Fort Drum','NY',200,0.15),(23,23,140,'Fort Leonard Wood','MO',150,0.15),(24,24,160,'Fort Stewart','GA',200,0.2),(25,25,90,'Fort Lee','VA',100,0.2),(26,26,110,'Fort Belvoir','VA',150,0.15),(27,27,130,'Fort Carson','CO',200,0.15),(28,28,60,'Fort Detrick','MD',80,0.15),(29,29,50,'Fort Riley','KS',60,0.2),(30,30,40,'Fort A.P. Hill','VA',50,0.2),(31,31,50,'Fort Greely','AK',60,0.15),(32,32,70,'Camp Shelby','MS',80,0.15),(33,33,15,'Naval Air Station Oceana','VA',20,0.2),(34,34,30,'Naval Base Kitsap','WA',50,0.3),(35,35,50,'Naval Amphibious Base Little Creek','VA',60,0.15),(36,36,20,'Naval Base San Diego','CA',25,0.2),(37,37,15,'Naval Air Station Jacksonville','FL',20,0.2),(38,38,10,'Naval Base Kitsap','WA',15,0.1),(39,39,40,'Camp Pendleton','CA',50,0.25),(40,40,60,'Camp Lejeune','NC',80,0.15),(41,41,35,'Camp Pendleton','CA',50,0.2),(42,42,70,'Fort Meade','MD',100,0.15),(43,43,90,'Fort Hood','TX',120,0.15),(44,44,40,'Fort Campbell','KY',60,0.2),(45,45,20,'Fort Knox','KY',30,0.15),(46,46,25,'Naval Base Coronado','CA',30,0.15),(47,47,5,'Naval Station Norfolk','VA',5,0.1),(48,48,90,'Fort Drum','NY',100,0.2),(49,49,20,'Fort McCoy','WI',25,0.15),(50,50,35,'Camp Shelby','MS',50,0.15),(51,51,25,'Fort Bliss','TX',40,0.2),(52,52,20,'Fort Benning','GA',30,0.15),(53,53,12,'Fort Lewis','WA',20,0.2),(54,54,10,'Fort Carson','CO',15,0.2),(55,55,8,'Eglin AFB','FL',10,0.15),(56,56,7,'Fort Greely','AK',10,0.15),(57,57,10,'Fort Devens','MA',15,0.2),(58,58,6,'Fort Richardson','AK',10,0.15),(59,59,8,'Fort Stewart','GA',10,0.15),(60,60,4,'Fort A.P. Hill','VA',5,0.1),(61,61,30,'Fort Richardson','AK',40,0.15),(62,62,15,'Fort Belvoir','VA',20,0.2),(63,63,10,'Fort Devens','MA',15,0.2),(64,64,8,'Camp Shelby','MS',10,0.1),(65,65,7,'Naval Base Coronado','CA',10,0.15),(66,66,12,'Naval Base Coronado','CA',15,0.1),(67,67,5,'Naval Submarine Base Kings Bay','GA',10,0.1),(68,68,4,'Naval Station Norfolk','VA',5,0.1),(69,69,15,'Naval Base Pearl Harbor','HI',20,0.15),(70,70,500,'Fort Leonard Wood','MO',600,0.15),(71,71,300,'Fort McCoy','WI',400,0.1),(72,72,200,'Fort Leonard Wood','MO',300,0.15),(73,73,25,'Camp Lejeune','NC',30,0.2),(74,74,20,'Naval Air Station Oceana','VA',25,0.15),(75,75,10,'Naval Base Coronado','CA',15,0.2),(76,76,10,'Naval Base Kitsap','WA',15,0.2),(77,77,4,'Naval Station Pearl Harbor','HI',5,0.1),(78,78,7,'Naval Base Guam','GU',10,0.15),(79,79,3,'Naval Base San Diego','CA',5,0.1),(80,80,2,'Naval Air Station Oceana','VA',5,0.1),(81,81,100,'Fort Riley','KS',120,0.2),(82,82,15,'Fort Polk','LA',20,0.15),(83,83,10,'Fort Benning','GA',15,0.1),(84,84,10,'Naval Base San Diego','CA',15,0.15),(85,85,8,'Naval Base Pearl Harbor','HI',10,0.1),(86,86,5,'Naval Air Station Jacksonville','FL',8,0.1),(87,87,8,'Naval Station Norfolk','VA',10,0.1),(88,88,12,'Naval Base Coronado','CA',15,0.15),(89,89,8,'Fort Bragg','NC',10,0.1),(90,90,500,'Fort Hood','TX',600,0.15),(91,91,300,'Fort Benning','GA',400,0.1),(92,92,200,'Fort Polk','LA',300,0.15),(93,93,50,'Eglin AFB','FL',60,0.2),(94,94,35,'Andrews AFB','MD',45,0.15),(95,95,20,'Fort Lee','VA',30,0.1),(96,96,25,'Edwards AFB','CA',30,0.15),(97,97,20,'Langley AFB','VA',25,0.15),(98,98,15,'Eglin AFB','FL',20,0.1),(99,99,10,'Naval Air Station Oceana','VA',15,0.1),(100,100,12,'Naval Station Norfolk','VA',15,0.1),(101,101,8,'Naval Submarine Base Kings Bay','GA',10,0.1),(102,102,5,'Naval Base Coronado','CA',7,0.1),(103,103,4,'Naval Base Kitsap','WA',5,0.1),(104,104,3,'Naval Base San Diego','CA',5,0.1),(105,105,20,'Naval Base Pearl Harbor','HI',25,0.15),(106,106,15,'Fort Rucker','AL',20,0.15),(107,107,18,'Fort Campbell','KY',20,0.15),(108,108,10,'Fort Leonard Wood','MO',12,0.1),(109,109,12,'Fort Knox','KY',15,0.1),(110,110,8,'Fort Benning','GA',10,0.1),(111,111,6,'Langley AFB','VA',8,0.1),(112,112,10,'Edwards AFB','CA',12,0.15),(113,1,17,'Fort Hood','TX',20,0.15),(114,2,20,'Langley AFB','VA',30,0.2),(115,11,20,'Fort Riley','KS',30,0.15),(116,70,400,'Fort Bliss','TX',500,0.1),(117,55,6,'Edwards AFB','CA',8,0.15),(118,50,20,'Fort Benning','GA',30,0.2),(120,12,15,'Fort A.P. Hill','VA',20,0.2),(121,112,8,'Eglin AFB','FL',10,0.15),(122,111,16,'Eglin AFB','FL',20,0.15),(123,72,100,'Fort McCoy','WI',150,0.15),(124,68,4,'Naval Air Station Oceana','VA',5,0.1),(125,42,90,'Fort Hood','TX',120,0.15),(126,40,35,'Camp Pendleton','CA',50,0.2),(127,64,10,'Fort Devens','MA',15,0.2),(128,107,15,'Fort Rucker','AL',20,0.15),(129,109,15,'Fort Rucker','AL',20,0.15),(130,112,5,'Andrews AFB','MD',6,0.15),(131,32,15,'Naval Air Station Oceana','VA',20,0.2),(132,29,40,'Fort A.P. Hill','VA',50,0.2),(133,21,90,'Fort Lee','VA',100,0.2),(134,23,90,'Fort Lee','VA',100,0.2),(135,27,90,'Fort Lee','VA',100,0.2),(136,110,12,'Fort Knox','KY',15,0.1),(137,106,12,'Fort Knox','KY',15,0.1),(138,109,12,'Fort Leonard Wood','MO',15,0.1),(139,86,8,'Naval Station Norfolk','VA',10,0.1),(140,83,10,'Fort Riley','KS',12,0.2),(141,74,10,'Naval Base Kitsap','WA',15,0.2),(142,59,4,'Fort A.P. Hill','VA',5,0.1),(143,53,10,'Fort Carson','CO',15,0.2);
/*!40000 ALTER TABLE `Inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `OrderDetails`
--

DROP TABLE IF EXISTS `OrderDetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OrderDetails` (
  `OrderID` int NOT NULL,
  `ProductID` int NOT NULL,
  `Quantity` int DEFAULT NULL,
  `UnitPrice` float DEFAULT NULL,
  `TotalAmount` float DEFAULT NULL,
  `InventoryID` int DEFAULT NULL,
  PRIMARY KEY (`OrderID`,`ProductID`),
  KEY `ProductID` (`ProductID`),
  KEY `fk_inventory` (`InventoryID`),
  CONSTRAINT `fk_inventory` FOREIGN KEY (`InventoryID`) REFERENCES `Inventory` (`InventoryID`),
  CONSTRAINT `orderdetails_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`),
  CONSTRAINT `orderdetails_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OrderDetails`
--

LOCK TABLES `OrderDetails` WRITE;
/*!40000 ALTER TABLE `OrderDetails` DISABLE KEYS */;
/*!40000 ALTER TABLE `OrderDetails` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `add_inventory_after_order` AFTER INSERT ON `orderdetails` FOR EACH ROW BEGIN
    DECLARE current_stock INT;
    DECLARE inventory_id INT;

    -- Get the current stock level (CurrentQuantity) and InventoryID for the ordered product
    SELECT CurrentQuantity, InventoryID
    INTO current_stock, inventory_id
    FROM Inventory
    WHERE ProductID = NEW.ProductID;

    -- Update the inventory quantity by adding the ordered amount
    IF current_stock IS NOT NULL THEN
        UPDATE Inventory
        SET CurrentQuantity = current_stock + NEW.Quantity
        WHERE ProductID = NEW.ProductID;
    END IF;
    
    -- Log the transaction in AuditLogs with the correct InventoryID
    INSERT INTO AuditLogs (ProductID, InventoryID, TransactionDate, TransactionType, QuantityChanged)
    VALUES (NEW.ProductID, inventory_id, NOW(), 'Restock', NEW.Quantity);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Orders` (
  `OrderID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int DEFAULT NULL,
  `OrderDate` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`OrderID`),
  KEY `EmployeeID` (`EmployeeID`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `Employees` (`EmployeeID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Orders`
--

LOCK TABLES `Orders` WRITE;
/*!40000 ALTER TABLE `Orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `Orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Products`
--

DROP TABLE IF EXISTS `Products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Products` (
  `ProductID` int NOT NULL AUTO_INCREMENT,
  `Category` varchar(255) DEFAULT NULL,
  `UnitPrice` float DEFAULT NULL,
  `ProductName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Products`
--

LOCK TABLES `Products` WRITE;
/*!40000 ALTER TABLE `Products` DISABLE KEYS */;
INSERT INTO `Products` VALUES (1,'Transport Helicopter',39000000,'CH-47 Chinook'),(2,'Air Superiority Fighter Jet',100000000,'F-35 Lightning II'),(3,'Surface to Surface Missile',1870000,'BGM-109 Tomahawk'),(4,'Anti-Tank Missile',240000,'FGM-148 Javelin'),(5,'Attack Helicopter',4500000,'AH-1Z Viper'),(6,'Pistol',2101.63,'Heckler & Koch Mk 23'),(7,'Pistol',642.98,'Heckler & Koch P30'),(8,'Pistol',675.52,'SIG Sauer P320'),(9,'Pistol',1700,'Colt M45A1 CQBP'),(10,'Pistol',2052.49,'Colt M1911'),(11,'Pistol',528.73,'Smith & Wesson M&P'),(12,'Pistol',957.19,'SIG Sauer P220'),(13,'Pistol',1505.61,'SIG Sauer P226'),(14,'Pistol',1223.71,'Heckler & Koch HK 45'),(15,'Pistol',4283.58,'Heckler & Koch P7'),(16,'Pistol',2225,'Heckler & Koch P9'),(17,'Pistol',1021.92,'FN FNX-45 Tactical'),(18,'Pistol',1995,'Heckler & Koch SFP9'),(19,'Pistol',841.17,'FN Five-seveN'),(20,'Pistol',1888.95,'Desert Eagle'),(21,'Pistol',540.89,'Glock 17'),(22,'Pistol',535.81,'Glock 19'),(23,'Pistol',981,'Beretta M951'),(24,'Pistol',974.25,'Heckler & Koch HK 4'),(25,'Pistol',1445.41,'Heckler & Koch USP Tactical'),(26,'Pistol',702.7,'Beretta Px4 Storm'),(27,'Pistol',992.8,'SIG Sauer P229'),(28,'Pistol',1129,'SIG Sauer P225'),(29,'Pistol',790.46,'Ruger Security-Six'),(30,'Pistol',780.84,'Smith & Wesson Model 686'),(31,'Pistol',550,'Smith & Wesson Model 10 Military & Police'),(32,'Pistol',799.25,'Ruger GP100'),(33,'Sub Machine Gun',4546.21,'Heckler & Koch MP5/10'),(34,'Sub Machine Gun',2300,'Heckler & Koch UMP'),(35,'Sub Machine Gun',675,'FN P90'),(36,'Sub Machine Gun',1925,'Colt 9mm SMG'),(37,'Sub Machine Gun',1099,'Colt M4 Commando'),(38,'Sub Machine Gun',4000,'Heckler & Koch HK 53'),(39,'Shotgun',2002.99,'Benelli M4 Super 90'),(40,'Shotgun',499.99,'Remington M11-87'),(41,'Shotgun',1349.99,'FN SLP'),(42,'Shotgun',1049,'Beretta Tx4 Storm'),(43,'Shotgun',438.99,'Mossberg 590'),(44,'Shotgun',678.99,'Kel-Tec KSG'),(45,'Shotgun',499.99,'Remington M870'),(46,'Shotgun',2255,'Remington M870 MCS'),(47,'Shotgun',5399,'M26 MASS'),(48,'Assault Rifle',567.99,'Remington R5 RGP'),(49,'Assault Rifle',918.85,'Colt CAR-15'),(50,'Assault Rifle',2635,'Colt M16A1'),(51,'Assault Rifle',1036.99,'Colt M4'),(52,'Assault Rifle',1581.97,'Colt M16A2'),(53,'Assault Rifle',4239,'FN SCAR-H'),(54,'Sniper Rifle',5700,'Desert Tech HTI'),(55,'Sniper Rifle',8049,'Barrett M82'),(56,'Sniper Rifle',11670,'McMillan TAC-50'),(57,'Sniper Rifle',4385,'Barrett M95'),(58,'Sniper Rifle',4985,'Barrett M99'),(59,'Sniper Rifle',3999.95,'Remington M24 SWS'),(60,'Sniper Rifle',17000,'Remington M2010 ESR'),(61,'Sniper Rifle',1900,'Remington M700 Police'),(62,'Sniper Rifle',6478,'McMillan TAC-338'),(63,'Sniper Rifle',3175,'Mk 14 EBR'),(64,'Machine Gun',14316,'FN Minimi 7.62'),(65,'Machine Gun',4087,'FN M249 SAW'),(66,'Machine Gun',11094,'FN M249 Para'),(67,'Machine Gun',45500,'Dillon Aero M134D'),(68,'Machine Gun',50000,'Dillon Aero M134H'),(69,'Machine Gun',6600,'FN M240'),(70,'Hand Grenade',46,'M67'),(71,'Hand Grenade',25,'40mm M433 HEDP'),(72,'Hand Grenade',15,'M26'),(73,'Grenade Launcher',1082,'M203A1'),(74,'Grenade Launcher',2050.5,'MK13 EGLM'),(75,'Grenade Launcher',15000,'M32A1'),(76,'Grenade Launcher',1050.99,'M203PI'),(77,'Heavy Machine Gun',45587,'FN M3M GAU-21'),(78,'Heavy Machine Gun',22658,'FN M2HB'),(79,'Heavy Machine Gun',27206,'FN M240L'),(80,'Heavy Machine Gun',22040,'GAU-19/B'),(81,'Rocket Launcher',1484.64,'M136 AT4'),(82,'Rocket Launcher',17867.8,'M141 BDM'),(83,'Anti-Tank Missile',54956,'BGM-71 TOW'),(84,'Multiple Rocket Launcher',4700000,'M270 MLRS'),(85,'Multiple Rocket Launcher',4901860,'M142 HIMARS'),(86,'Towed Howitzer',3738000,'155mm M777'),(87,'Self-Propelled Mortar',252600,'M1064A3'),(88,'Self-Propelled Mortar',312601,'AMS II'),(89,'Man-Portable Air Defense System',150000,'FIM-92 Stinger'),(90,'Rifle Cartridge',2.5,'5.56x45mm NATO'),(91,'Rifle Cartridge',2.5,'5.7x28mm FN'),(92,'Surface to Air Missile',950000,'RIM-162 ESSM'),(93,'Surface to Air Missile',165400,'RIM-7 Sea Sparrow'),(94,'Surface to Air Missile',905000,'RIM-116 RAM'),(95,'Surface to Surface Missile',100000,'MGM-140 ATACMS'),(96,'Air to Air Missile',399500,'AIM-9X Sidewinder'),(97,'Air to Air Missile',125000,'AIM-7 Sparrow'),(98,'Air to Ground Missile',284000,'AGM-88 HARM'),(99,'Aviation Bomb',16000,'Mark 84'),(100,'Aviation Bomb',21000,'GBU-15'),(101,'Surface to Air Missile',905000,'RIM-116 RAM'),(102,'Naval SAM system',110000000,'Mark 41 VLS'),(103,'Surface to Air Missile',900000,'SeaRAM'),(104,'Lightweight Torpedo',839000,'Mark 54'),(105,'Lightweight Torpedo',1406810,'RGM-84 Harpoon Block II'),(106,'Attack Helicopter',5200000,'Boeing AH-64 Apache'),(107,'Utility Helicopter',7000000,'Bell 429 GlobalRanger'),(108,'Utility Helicopter',4700000,'Bell UH-1N Twin Huey'),(109,'Utility Helicopter',5900000,'UH-60 Black Hawk'),(110,'Utility Helicopter',10200000,'HH-60G Pave Hawk'),(111,'Air Superiority Fighter Jet',350000000,'F-22 Raptor'),(112,'Air Superiority Fighter Jet',29900000,'F-15C Eagle');
/*!40000 ALTER TABLE `Products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductSuppliers`
--

DROP TABLE IF EXISTS `ProductSuppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProductSuppliers` (
  `ProductID` int NOT NULL,
  `SupplierID` int NOT NULL,
  PRIMARY KEY (`ProductID`,`SupplierID`),
  KEY `SupplierID` (`SupplierID`),
  CONSTRAINT `productsuppliers_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`),
  CONSTRAINT `productsuppliers_ibfk_2` FOREIGN KEY (`SupplierID`) REFERENCES `Suppliers` (`SupplierID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductSuppliers`
--

LOCK TABLES `ProductSuppliers` WRITE;
/*!40000 ALTER TABLE `ProductSuppliers` DISABLE KEYS */;
INSERT INTO `ProductSuppliers` VALUES (1,1),(105,1),(106,1),(112,1),(2,2),(4,2),(84,2),(85,2),(95,2),(102,2),(109,2),(110,2),(111,2),(3,5),(4,5),(83,5),(89,5),(92,5),(93,5),(94,5),(96,5),(97,5),(98,5),(100,5),(103,5),(104,5),(8,6),(12,6),(13,6),(27,6),(28,6),(9,7),(10,7),(36,7),(37,7),(49,7),(50,7),(51,7),(52,7),(73,7),(11,8),(30,8),(31,8),(17,9),(19,9),(35,9),(41,9),(53,9),(64,9),(65,9),(66,9),(69,9),(74,9),(77,9),(78,9),(79,9),(90,9),(91,9),(6,10),(7,10),(14,10),(15,10),(16,10),(18,10),(24,10),(25,10),(33,10),(34,10),(38,10),(20,11),(21,12),(22,12),(23,13),(26,13),(42,13),(29,14),(32,14),(39,15),(40,16),(45,16),(46,16),(48,16),(59,16),(60,16),(61,16),(43,17),(44,18),(47,19),(54,20),(55,21),(57,21),(58,21),(56,22),(62,22),(63,23),(67,24),(68,24),(70,25),(71,25),(71,26),(75,27),(76,28),(80,29),(89,29),(93,29),(99,29),(101,29),(81,30),(82,30),(86,31),(87,31),(88,31),(5,32),(107,32),(108,32);
/*!40000 ALTER TABLE `ProductSuppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Suppliers`
--

DROP TABLE IF EXISTS `Suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Suppliers` (
  `SupplierID` int NOT NULL AUTO_INCREMENT,
  `SupplierName` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `State` varchar(10) DEFAULT NULL,
  `Zipcode` varchar(10) DEFAULT NULL,
  `City` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`SupplierID`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Suppliers`
--

LOCK TABLES `Suppliers` WRITE;
/*!40000 ALTER TABLE `Suppliers` DISABLE KEYS */;
INSERT INTO `Suppliers` VALUES (1,'Boeing','929 Long Bridge Drive','(703) 465-3500','David.Calhoun@boeing.com','VA','22202','Arlington'),(2,'Lockheed Martin','6801 Rockledge Drive','(301) 897-6000','jim.taiclet@lmco.com','MD','20817','Bethesda'),(3,'Leonardo DRS','2345 Crystal Drive Suite 1000','(703) 416-8000','stephen.vather@drs.com','VA','22202','Arlington'),(4,'Northrop Grumman','2980 Fairview Park Drive','(703) 280-2900','Kathy.Warden@ngc.com','VA','22042','Falls Church'),(5,'RTX','1000 Wilson Blvd','(860) 728-7000','Gregory.Hayes@rtx.com','VA','22209','Arlington'),(6,'Sig Sauer','72 Pease Boulevard','(603) 610-3000','john.adams@sigsauer.com','NH','03801','Newington'),(7,'Colt\'s Manufacturing Company','545 New Park Avenue','(603) 610-3000','william.jay@colt.com','CT','06110','West Hartford'),(8,'Smith & Wesson','1852 Proffitt Springs Rd','(413) 781-8300','becky.cruz@smith-wesson.com','TN','37801','Maryville'),(9,'FN America','7950 Jones Branch Dr','(703) 288-3500','edward.larson@fnamerica.com','VA','22102','McLean'),(10,'Heckler & Koch USA','5675 Transport Boulevard','(706) 701-5554','amber.lord@heckler-koch-us.com','GA','31907','Columbus'),(11,'Magnum Research','12602 33rd Avenue SW','(218) 746-4597','stephen.leander@kahr.com','MN','56473','Pillager'),(12,'Glock','6000 Highlands Pkwy SE','(770) 432-1202','benjamin.state@glock.us','GA','30082','Smyrna'),(13,'Beretta USA','17601 Beretta Dr','(800) 237-3882','sandy.wolf@beretta.com','MD','20607','Accokeek'),(14,'Sturm, Ruger & Company','1 Lacey Pl','(203) 259-7843','christopher.killoy@beretta.com','CT','06890','Southport'),(15,'Benelli USA','17603 Indian Head Hwy','(301) 283-2185','marian.council@benelliusa.com','MD','20607','Accokeek'),(16,'Remington Firearms','600 Sewon Blvd','(706) 302-5858','randy.arnolds@remarms.com','GA','30240','LaGrange'),(17,'Mossberg','7 Grasso Ave','(203) 230-5300','christopher.white@mossberg.com','CT','06473','North Haven'),(18,'Kel-Tec','1505 Cox Rd','(321) 631-0068','joel.kelly@keltecweapons.com','FL','32926','Cocoa'),(19,'C-MORE Competition','680C Industrial Rd','(540) 347-4683','jonathan.gay@cmorecomp.com','VA','20186','Warrenton'),(20,'Desert Tech','1995 W Alexander St','(801) 975-7272','linda.black@deserttech.com','UT','84119','West Valley City'),(21,'Barrett','15 Freedom Way','(508) 553-8800','rebecca.howards@barrett.net','MA','02038','Franklin'),(22,'McMillan Firearms','1638 W. Knudsen Dr','(623) 582-9635','alejandra.fields@mcmillanusa.com','AZ','85027','Phoenix'),(23,'Smith Enterprise, Inc.','1701 West 10th Street','(623) 582-9635','jenny.misty@smith-enterprises.com','AZ','85281','Tempe'),(24,'Dillion Aero','21615 North 7th Avenue','(800) 881-4231','william.sandburg@dillonaero.com','AZ','85027','Phoenix'),(25,'Elbit Systems of America','4700 Marine Creek Parkway','(817) 234-6600','matthew.bench@elbitsystems.com','TX','76179','Fort Worth'),(26,'AMTEC Corporation','4230 Capital Cir','(608) 752-2699','aliyah.hassan@amtec-corp.com','WI','53546','Janesville'),(27,'Milkor USA','3735 N. Romero Road','(520) 888-0203','jacquelin.redwoods@milkorusainc.com','AZ','85705','Tucson'),(28,'RM Equipment Inc.','6975 NW 43 Street','(305) 477-9312','jarrod.kim@40mm.com','FL','33166','Miami'),(29,'General Dynamics Ordinance and Tactical Systems','11399 16th Court North','(727) 578-8100','andrew.lee@gd-ots.com','FL','33716','St.Petersburg'),(30,'Nammo Defense Systems','4051 North Higley Road','(480) 898 2200','veronica.grosvenor@nammo.us','AZ','85215','Mesa'),(31,'BAE Systems','2941 Fairview Park Dr','(571) 461 6000','christopher.davis@baesystems.com','VA','22042','Falls Church'),(32,'Bell Helicopter','3255 Bell Flight Boulevard','(817) 280-2011','sandy.rodriguez@bh.com','TX','76118','Fort Worth');
/*!40000 ALTER TABLE `Suppliers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-16 20:42:50
