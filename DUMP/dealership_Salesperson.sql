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
-- Table structure for table `Salesperson`
--

DROP TABLE IF EXISTS `Salesperson`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Salesperson` (
  `SIN` varchar(15) NOT NULL,
  `fName` varchar(255) NOT NULL,
  `lName` varchar(255) NOT NULL,
  `commission` decimal(4,2) NOT NULL,
  `salary` int NOT NULL,
  PRIMARY KEY (`SIN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Salesperson`
--

LOCK TABLES `Salesperson` WRITE;
/*!40000 ALTER TABLE `Salesperson` DISABLE KEYS */;
INSERT INTO `Salesperson` VALUES ('102242479','Simone','Marx',0.03,72765),('104048085','John','Rousseau',0.05,52371),('117396691','John','Foucault',0.11,60128),('129319676','Friedrich','de Beauvoir',0.06,55003),('129349895','Ludwig','Locke',0.08,45669),('150404261','Bertrand','de Beauvoir',0.15,78019),('150821601','Friedrich','Derrida',0.06,44620),('151974308','Thomas','Hobbes',0.13,37655),('152845016','David','Kant',0.02,40323),('156455460','Bertrand','Russell',0.06,77809),('158848119','Aristotle','de Beauvoir',0.08,44842),('160101384','Immanuel','Kant',0.15,73138),('165651330','Hypatia','Spinoza',0.01,70477),('166538082','Hypatia','Hobbes',0.07,73804),('177154835','Ludwig','Descartes',0.11,75176),('177414302','Socrates','Locke',0.10,59637),('183103505','Plato','Camus',0.12,35007),('184159012','Bertrand','de Beauvoir',0.03,38531),('184318014','Confucius','Locke',0.03,37148),('188924247','Simone','Nietzsche',0.05,34105),('190807649','Socrates','Russell',0.03,44688),('192679956','Hannah','Wittgenstein',0.13,51485),('194366865','Thomas','Schopenhauer',0.07,49323),('194869585','Karl','Hegel',0.09,78435),('201890362','Gautama','Kant',0.06,36876),('203868482','Confucius','Hegel',0.02,53366),('205241805','Jean-Jacques','Leibniz',0.15,77270),('218572309','John','Sartre',0.10,48656),('219805567','Ludwig','Schopenhauer',0.07,63386),('225876277','Socrates','Foucault',0.05,31618),('227024175','Confucius','Hobbes',0.08,38985),('230365808','David','Derrida',0.15,50389),('231809845','Aristotle','Kant',0.11,66474),('233723147','Ludwig','Sartre',0.14,31543),('236907921','René','Wittgenstein',0.02,44485),('243145144','Ludwig','Camus',0.06,38902),('255058659','Hannah','Marx',0.05,74907),('262616941','Karl','Marx',0.09,58575),('262732509','Thomas','Arendt',0.06,65312),('270526051','Friedrich','Derrida',0.13,78562),('271397996','René','Nietzsche',0.08,62735),('276130809','Sun','Spinoza',0.14,65264),('279146392','Sun','Wittgenstein',0.10,60271),('281786234','Thomas','de Beauvoir',0.10,53218),('285731605','Aristotle','Descartes',0.06,33545),('286688993','Jean-Jacques','Derrida',0.10,64429),('286701115','Aristotle','Marx',0.02,77744),('291529344','Bertrand','Sartre',0.05,30208),('292615061','Bertrand','Russell',0.03,78007),('299887377','Jean-Jacques','Kant',0.10,62166),('300347451','Jean-Jacques','Arendt',0.02,33192),('303016425','Karl','Hume',0.13,69760),('303656664','Hannah','Arendt',0.11,77912),('308827030','Sun','Spinoza',0.13,32122),('314069144','Sun','Hegel',0.14,34277),('322381500','Laozi','Hume',0.10,30813),('327162581','Gautama','Descartes',0.14,34348),('332928792','Jean-Jacques','Descartes',0.05,60580),('337945732','David','Kant',0.11,42874),('338344512','Hypatia','Locke',0.04,54040),('340814206','Simone','Sartre',0.08,71661),('346021199','Sun','Russell',0.12,46225),('347943856','Laozi','Hobbes',0.10,35675),('358960260','Bertrand','Rousseau',0.01,31575),('361028722','Plato','Leibniz',0.06,44635),('364134213','Jean-Jacques','Spinoza',0.11,46461),('366877496','Friedrich','Camus',0.15,64080),('370508092','Friedrich','de Beauvoir',0.12,43875),('378385893','Plato','Arendt',0.08,36437),('386420714','Karl','Kant',0.10,63912),('386538740','Simone','Spinoza',0.02,53235),('392518626','Socrates','Hegel',0.03,63020),('395792157','Hypatia','Derrida',0.10,58410),('402232970','René','Hume',0.15,60277),('405731717','Hannah','Spinoza',0.07,53216),('408692611','Aristotle','Sartre',0.13,72886),('410822093','Jean-Jacques','Hobbes',0.08,56471),('411864099','Ludwig','Spinoza',0.02,45971),('412741201','Jean-Jacques','Foucault',0.12,71035),('417990823','Sun','Leibniz',0.03,52964),('419896007','Thomas','Hobbes',0.04,77912),('426161925','Immanuel','Spinoza',0.03,58543),('432996174','Karl','Rousseau',0.06,73388),('451196150','Immanuel','Wittgenstein',0.13,36807),('454275298','John','Nietzsche',0.14,52779),('455043516','Bertrand','de Beauvoir',0.06,64353),('461009473','Plato','Descartes',0.12,64430),('463336656','Gautama','de Beauvoir',0.08,30476),('468869804','David','Descartes',0.10,48623),('469584158','Plato','Hume',0.02,77166),('473377914','Sun','Locke',0.02,53965),('477560329','Immanuel','Wittgenstein',0.11,64241),('480452123','Bertrand','Schopenhauer',0.12,50662),('489275708','Ludwig','Leibniz',0.05,50145),('496388454','Socrates','Hobbes',0.10,67989),('497369847','Simone','Arendt',0.14,56555),('499368892','Gautama','Arendt',0.10,50201),('500580709','Laozi','Hobbes',0.02,55301),('506746673','Hypatia','Hegel',0.13,54135),('525076672','Ludwig','Nietzsche',0.09,78901),('551684517','Simone','Wittgenstein',0.11,74492),('557181452','René','Hume',0.06,65985),('559404338','Confucius','Arendt',0.02,40449),('559433249','René','Derrida',0.13,41045),('564186944','Confucius','Rousseau',0.03,39594),('567386649','David','Marx',0.12,66343),('568202921','Jean-Jacques','Marx',0.06,57067),('568620250','Immanuel','Hobbes',0.04,74030),('573705886','Immanuel','Derrida',0.02,40276),('578425651','Jean-Jacques','Hobbes',0.14,43922),('578880246','Thomas','Russell',0.14,48723),('581474912','Ludwig','Wittgenstein',0.09,67517),('588143393','Ludwig','Descartes',0.03,43850),('590083587','René','Leibniz',0.09,60640),('592637717','Sun','Wittgenstein',0.01,52350),('593200710','Hannah','Hobbes',0.11,57285),('593443473','Friedrich','Hegel',0.12,76328),('594419732','Simone','Leibniz',0.08,64623),('595955784','Sun','Foucault',0.03,56311),('607822874','Jean-Jacques','Marx',0.13,48349),('607883501','Bertrand','Hobbes',0.08,63955),('609142277','John','Derrida',0.13,55502),('610782715','Plato','Descartes',0.03,70544),('613931226','Aristotle','Wittgenstein',0.08,77175),('632343085','René','Kant',0.05,78332),('632429806','Socrates','Hobbes',0.11,50211),('637894316','Immanuel','Spinoza',0.12,46253),('639374454','Ludwig','Locke',0.10,42691),('660667080','Friedrich','Leibniz',0.13,76785),('661217325','David','Locke',0.04,75108),('663495293','Plato','Spinoza',0.08,32837),('667634253','Thomas','Hegel',0.13,60159),('669558759','David','Spinoza',0.03,66778),('673165258','Thomas','Derrida',0.07,56207),('673767901','Plato','Spinoza',0.07,57914),('680534690','Hannah','Wittgenstein',0.10,72000),('686571871','Thomas','Nietzsche',0.05,62784),('687822285','Jean-Jacques','Leibniz',0.04,60424),('693852743','Confucius','Hegel',0.13,37184),('695483469','Hannah','Camus',0.09,65800),('696419010','Thomas','Russell',0.06,50927),('699424169','David','Spinoza',0.05,31392),('709403057','Jean-Jacques','Marx',0.06,70213),('713383800','Confucius','Russell',0.12,48643),('717569602','Socrates','Descartes',0.07,31437),('728675680','Aristotle','Descartes',0.08,60292),('744122426','Thomas','Marx',0.04,52051),('752437336','Plato','Kant',0.09,45959),('753320577','Jean-Jacques','Marx',0.02,59896),('756703907','David','Marx',0.08,66610),('762517836','Thomas','Sartre',0.11,34159),('763471749','Confucius','Locke',0.10,50134),('766279845','Hypatia','Wittgenstein',0.03,37389),('769014487','Aristotle','Derrida',0.06,37656),('770345557','Ludwig','Spinoza',0.03,77391),('775246080','Gautama','Hegel',0.13,58944),('780280290','Friedrich','Derrida',0.05,46779),('781336880','Sun','Descartes',0.15,76614),('783816093','Socrates','Hegel',0.07,66122),('784249141','Gautama','Wittgenstein',0.11,62909),('784979053','Immanuel','Hume',0.07,67749),('788724135','John','Derrida',0.10,31228),('798853538','Friedrich','Marx',0.05,60607),('800098730','Thomas','Locke',0.09,33003),('807474560','Ludwig','Nietzsche',0.09,49173),('808331374','Bertrand','Russell',0.01,63390),('819956792','Plato','Leibniz',0.07,46247),('821773423','René','Locke',0.05,30582),('830295857','Hannah','Schopenhauer',0.02,65834),('830506979','John','Hobbes',0.02,52630),('831373753','Confucius','Descartes',0.14,41827),('838229454','Jean-Jacques','Nietzsche',0.07,67866),('839823894','Friedrich','Foucault',0.05,31120),('844856588','Hypatia','Locke',0.12,77764),('854299833','Sun','Russell',0.15,72055),('856204491','David','de Beauvoir',0.03,76841),('868907965','Gautama','Camus',0.06,47908),('888649809','Hannah','Sartre',0.06,43023),('888791233','Ludwig','Arendt',0.11,57077),('892522622','Bertrand','Foucault',0.01,70702),('904547145','Thomas','Descartes',0.13,62288),('905069467','Thomas','Hobbes',0.05,71176),('922827119','Bertrand','Hobbes',0.05,59078),('946804420','John','Kant',0.06,60734),('947640919','Plato','Sartre',0.15,51435),('950303884','Socrates','Hegel',0.13,58246),('953104085','Ludwig','Foucault',0.11,34144),('953667904','Hypatia','Camus',0.15,66878),('960000451','Karl','Leibniz',0.05,30818),('960854955','David','Locke',0.11,68493),('972341361','Ludwig','Foucault',0.04,39549),('973012024','Aristotle','Arendt',0.03,44550),('973381941','Karl','de Beauvoir',0.02,74820),('977028237','Plato','Hegel',0.04,54670),('980620286','Hypatia','Schopenhauer',0.03,64350),('983847547','Hypatia','Schopenhauer',0.11,31405),('991262510','Thomas','Hegel',0.01,62168),('991415761','Hannah','Locke',0.02,74336),('995193601','Plato','Locke',0.13,74819),('999884730','Bertrand','Nietzsche',0.08,60826);
/*!40000 ALTER TABLE `Salesperson` ENABLE KEYS */;
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
