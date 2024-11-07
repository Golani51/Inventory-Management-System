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
INSERT INTO `Inventory` VALUES (1,1,22,'Fort Bragg','NC',12,0.2),(2,2,35,'Edwards AFB','CA',24,0.25),(3,3,45,'Naval Base San Diego','CA',125,0.1),(4,4,195,'Fort Benning','GA',200,0.3),(5,5,3,'Norfolk Naval Shipyard','VA',3,0.1);
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
  PRIMARY KEY (`OrderID`,`ProductID`),
  KEY `ProductID` (`ProductID`),
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
  `ProductID` int NOT NULL,
  `Category` varchar(255) DEFAULT NULL,
  `UnitPrice` float DEFAULT NULL,
  `ProductName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Products`
--

LOCK TABLES `Products` WRITE;
/*!40000 ALTER TABLE `Products` DISABLE KEYS */;
INSERT INTO `Products` VALUES (1,'Transport Helicopter',39000000,'CH-47 Chinook'),(2,'Fighter Jet',77900000,'F-35 Lightning II'),(3,'Missile',1870000,'Tomahawk Cruise Missile'),(4,'Anti-Tank Missile',175000,'Javelin'),(5,'Propulsion System for Warships',5000000,'Hybrid Electric Drive');
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
INSERT INTO `ProductSuppliers` VALUES (1,1),(2,2),(4,2),(5,3),(3,5),(4,5);
/*!40000 ALTER TABLE `ProductSuppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Suppliers`
--

DROP TABLE IF EXISTS `Suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Suppliers` (
  `SupplierID` int NOT NULL,
  `SupplierName` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `State` varchar(10) DEFAULT NULL,
  `Zipcode` int DEFAULT NULL,
  `City` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`SupplierID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Suppliers`
--

LOCK TABLES `Suppliers` WRITE;
/*!40000 ALTER TABLE `Suppliers` DISABLE KEYS */;
INSERT INTO `Suppliers` VALUES (1,'Boeing','929 Long Bridge Drive','(703) 465-3500','David.Calhoun@boeing.com','VA',22202,'Arlington'),(2,'Lockheed Martin','6801 Rockledge Drive','(301) 897-6000','jim.taiclet@lmco.com','MD',20817,'Bethesda'),(3,'Leonardo DRS','2345 Crystal Drive Suite 1000','(703) 416-8000','stephen.vather@drs.com','VA',22202,'Arlington'),(4,'Northrop Grumman','2980 Fairview Park Drive','(703) 280-2900','Kathy.Warden@ngc.com','VA',22042,'Falls Church'),(5,'RTX','1000 Wilson Blvd','(860) 728-7000','Gregory.Hayes@rtx.com','VA',22209,'Arlington');
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

-- Dump completed on 2024-11-06 19:54:01
