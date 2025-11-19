-- MySQL dump 10.13  Distrib 8.0.44, for macos15 (arm64)
--
-- Host: localhost    Database: dealership
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '52b132d4-c56f-11f0-9d28-c24e3f52e06c:1-173322';

--
-- Table structure for table `Manager`
--

DROP TABLE IF EXISTS `Manager`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Manager` (
  `SIN` varchar(15) NOT NULL,
  `fName` varchar(255) NOT NULL,
  `lName` varchar(255) NOT NULL,
  `salary` int NOT NULL,
  `bonus` int NOT NULL,
  PRIMARY KEY (`SIN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Manager`
--

LOCK TABLES `Manager` WRITE;
/*!40000 ALTER TABLE `Manager` DISABLE KEYS */;
INSERT INTO `Manager` VALUES ('122476959','Socrates','Schopenhauer',71403,11769),('150095282','Laozi','Hobbes',119733,9970),('164579364','Immanuel','Russell',67297,18439),('178684648','Plato','Locke',70609,5551),('181782653','Karl','de Beauvoir',69215,19527),('224434071','Immanuel','Spinoza',71711,8341),('244802576','Jean-Jacques','Schopenhauer',115405,16598),('246433657','John','Schopenhauer',64430,16723),('279963453','Ludwig','Foucault',72175,8468),('292620175','Friedrich','Marx',75056,9166),('351839858','Hannah','Hobbes',99827,14232),('359199599','Sun','Hobbes',63118,13563),('361633846','Sun','de Beauvoir',89204,12540),('367995704','Karl','Descartes',105814,7307),('384016782','Thomas','Marx',61688,12308),('388861558','Hannah','Leibniz',70769,8823),('399914970','Ludwig','Russell',92375,18638),('405084389','Gautama','de Beauvoir',76707,9801),('412897487','Friedrich','Schopenhauer',95592,10194),('414059743','Simone','Schopenhauer',95491,5801),('417698691','Hypatia','Arendt',102380,7921),('432847945','Hannah','de Beauvoir',80138,11777),('459355963','Gautama','Leibniz',61209,8113),('462234748','Socrates','Locke',78170,10848),('462929837','René','Rousseau',60848,14030),('467053603','Laozi','Marx',77828,7330),('487685315','Hypatia','Hegel',113693,16148),('503117598','Immanuel','Arendt',63587,11336),('527412291','Confucius','Sartre',62692,16092),('610705500','Aristotle','Locke',99720,11534),('631756135','Aristotle','Foucault',94437,14547),('670205348','Hypatia','Leibniz',75318,11972),('685373325','Friedrich','Foucault',98895,17247),('704510638','Sun','Spinoza',82780,16304),('730572375','Karl','Russell',95907,18524),('730833696','René','Marx',94833,5360),('743799502','Laozi','Hobbes',116432,10441),('753973095','Thomas','Locke',68564,13332),('757109456','Gautama','Kant',71066,12450),('796812146','Socrates','Rousseau',93621,13868),('809291035','Bertrand','Derrida',103782,11894),('824986747','John','Descartes',112083,11383),('865500436','Thomas','Hobbes',76272,6689),('866566728','Gautama','Descartes',65098,19014),('880015583','Hypatia','Rousseau',78059,8928),('894517245','Bertrand','de Beauvoir',95404,19060),('898078996','Laozi','Russell',65511,16245),('916935514','Simone','Hobbes',69124,11334),('976205259','David','Marx',118338,8576),('990171611','Plato','Wittgenstein',62186,5043);
/*!40000 ALTER TABLE `Manager` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-19 14:02:19
