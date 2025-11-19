# Population script explanation

For this assignment, I wrote a Python program called `populate_data.py` to generate the data for our dealership database. I chose to write a custom script because it gave me full control over the data relationships and allowed me to generate a large volume of realistic-looking data easily.

## How the program works

The script uses the Python `random` library to generate random but plausible values for each column in our database tables. It runs through a series of functions, each responsible for generating data for a specific table (like `generate_customer`, `generate_vehicle`, etc.).

### Generating large amounts of data
The script is set up to generate:
- **2,500 Customers**
- **2,500 Vehicles**
- **3,000 Test Drives**
- **2,000 Sales**
- **3,000 Phone Numbers**
- And hundreds of other records like Salespeople, Managers, and Invoices.

This meets the requirement of having multiple relations with thousands of tuples.

### Ensuring unique keys
To make sure we don't get any "duplicate key" errors, the script keeps track of the primary keys it has already generated. For example, when creating a new Customer, it generates a random Driver's License number. It then checks a list of already used license numbers. If the generated one is already in the list, it throws it away and generates a new one until it finds a unique one.

### Ensuring joinability (referential integrity)
This was the most important part. To make sure our tables can join together properly (like linking a Sale to a Customer), the script generates data in a specific order:
1. First, it generates the independent entities like **Salespeople**, **Managers**, **Customers**, and **Vehicles**.
2. As it generates these, it saves their primary keys (like SINs, Driver's License numbers, and VINs) into lists in memory.
3. Then, when it generates dependent entities like **Sales** or **Test Drives**, it randomly picks IDs from those saved lists.

For example, when creating a **Sale** record, the script randomly picks a `driverLicenseNumber` from the list of existing customers and a `VIN` from the list of available vehicles. This guarantees that every foreign key in the `Sale` table points to a real, existing record in the `Customer` and `Vehicle` tables, so our joins will always work and return results.

### Realistic data logic
I also added some logic to make the data make sense:
- **Vehicle availability:** Only vehicles marked as "Available" can be sold. The script tracks which VINs are available and only creates Sales for those.
- **Dates:** Test drives and sales are generated with dates in a realistic range (mostly in 2024).
- **Test Drive overlaps:** The script tries to avoid scheduling two test drives for the same car at the same time

This approach gives us a robust dataset that is perfect for testing our queries and performance.

## Sample data

Here are a few examples of the records generated for each table:

### Customer
driverLicenseNumber, fName, lName, street, city, province, postalCode, birthday, eFlag, tFlag, pFlag
'DL1003638','David','Derrida','194 Brick Ln','Vancouver','QC','B4J 0Z5','1957-08-26','1','1','0'
'DL1012050','Thomas','Hegel','255 Oxford St','Toronto','MB','K5W 2T2','1992-11-27','1','1','1'
'DL1014976','Bertrand','Locke','645 Victoria St','Montreal','ON','E3X 8R7','1971-01-12','1','0','1'
'DL1017898','Simone','Derrida','269 Portobello Rd','Calgary','NL','F5M 3W9','2003-07-05','0','0','1'
'DL1025867','Aristotle','Marx','1 Regent St','Edmonton','NB','O8J 9M8','1957-09-12','1','0','0'

### Vehicle
VIN, stockNumber, modelYear, make, model, trim, mileage, colour, inventoryStatus, acquisitionCost, basePrice
'VIN1002993791','STK79561','2019','Audi','R8','S','137465','White','Available','38541','42597'
'VIN1004019054','STK83767','2017','Bugatti','La Voiture Noire','GT3 RS','19800','Brown','Sold','28543','32582'
'VIN1005718948','STK72444','2018','Ferrari','Daytona SP3','GT3','15101','Black','Sold','20735','25197'
'VIN1006819054','STK13393','2021','Rolls-Royce','Ghost','GT3','95538','Gray','Sold','26491','31944'
'VIN1017100199','STK77534','2023','Maserati','GranTurismo','S','82760','White','Sold','14585','18256'

### Photo
photoID, photoURL, VIN
'1','http://example.com/photos/1.jpg','VIN8839039320'
'22','http://example.com/photos/22.jpg','VIN7840623269'
'47','http://example.com/photos/47.jpg','VIN2033823011'
'56','http://example.com/photos/56.jpg','VIN6322761163'
'91','http://example.com/photos/91.jpg','VIN6191600435'
'120','http://example.com/photos/120.jpg','VIN9911430116'

### Manager
SIN, fName, lName, salary, bonus
'122476959','Socrates','Schopenhauer','71403','11769'
'150095282','Laozi','Hobbes','119733','9970'
'164579364','Immanuel','Russell','67297','18439'
'178684648','Plato','Locke','70609','5551'
'181782653','Karl','de Beauvoir','69215','19527'

### Salesperson
SIN, fName, lName, commission, salary
'102242479','Simone','Marx','0.03','72765'
'104048085','John','Rousseau','0.05','52371'
'117396691','John','Foucault','0.11','60128'
'129319676','Friedrich','de Beauvoir','0.06','55003'
'129349895','Ludwig','Locke','0.08','45669'

### TestDrive
testDriveID, startTime, endTime, testDriveStatus, driverLicenseNumber, SIN, VIN
'74', '2024-12-29 12:00:00', '2024-12-29 12:22:00', 'Scheduled', 'DL7409592', '525076672', 'VIN2020537674'
'79', '2024-12-23 15:00:00', '2024-12-23 15:20:00', 'Cancelled', 'DL6286564', '201890362', 'VIN7713357849'
'92', '2024-01-12 12:00:00', '2024-01-12 12:46:00', 'Cancelled', 'DL3146989', '303016425', 'VIN1462066773'
'104', '2024-07-10 11:00:00', '2024-07-10 11:19:00', 'Cancelled', 'DL8607780', '639374454', 'VIN9472958179'
'137', '2024-05-15 16:00:00', '2024-05-15 17:00:00', 'Cancelled', 'DL5474292', '231809845', 'VIN5948205892'

### Sale
saleID, saleType, downPayment, salePrice, saleDate, driverLicenseNumber, eSIN, mSIN, VIN
'29', 'Finance', '3576', '20295', '2024-12-05', 'DL3306480', '551684517', '610705500', 'VIN9034573009'
'77', 'Cash', '12234', '43235', '2024-05-30', 'DL6334969', '285731605', '414059743', 'VIN9831243504'
'126', 'Cash', '2999', '19451', '2024-07-10', 'DL9678893', '281786234', '246433657', 'VIN6182674021'
'135', 'Cash', '12078', '50790', '2024-12-26', 'DL8590036', '983847547', '487685315', 'VIN9063306743'
'136', 'Lease', '14563', '51825', '2024-11-27', 'DL1883796', '150821601', '359199599', 'VIN3647854678'
'199', 'Finance', '6640', '59364', '2024-05-05', 'DL1953344', '496388454', '610705500', 'VIN1650021822'

### Email
emailAddress, driverLicenseNumber
'john.descartes66@example.com','DL1003638'
'karl.nietzsche375@example.com','DL1014976'
'john.sartre316@example.com','DL1017898'
'socrates.locke221@example.com','DL1017898'
'john.descartes310@example.com','DL1025867'

### Phone Number
phoneNumber, driverLicenseNumber
'1539865772','DL1003638'
'1641991292','DL1012050'
'3218319099','DL1017898'
'8253074477','DL1025867'
'5446528998','DL1030019'

### Invoice
invoiceNumber, dateGenerated, paymentDueDate, totalAmountDue, invoiceStatus, saleID
'INV100471','2024-05-17 00:00:00','2024-06-16','561.60','Paid','37351'
'INV100636','2024-02-08 00:00:00','2024-03-09','402.17','Unpaid','60122'
'INV101028','2024-01-29 00:00:00','2024-02-28','163.45','Paid','49946'
'INV101076','2024-08-03 00:00:00','2024-09-02','517.14','Paid','30948'
'INV101832','2024-08-22 00:00:00','2024-09-21','246.79','Unpaid','73893'

### LineItem
itemID, itemName, itemDescription, amount, invoiceNumber
'159','Service Fee','Standard charge','750.29','INV126702'
'1080','Parts','Standard charge','55.14','INV565797'
'1301','Registration','Standard charge','102.45','INV161356'
'1746','Registration','Standard charge','910.92','INV517678'
'1783','Warranty','Standard charge','318.43','INV567990'

### PaymentSchedule
scheduleID, totalLoanAmount, interestRate, termDurationMonths, monthlyPayment, startDate, endDate, paymentStatus, saleID
'46','36450.00','2.54','48','778.66','2024-02-25','2028-02-04','Active','2302'
'58','24754.00','5.25','48','542.78','2024-04-13','2028-03-23','Active','99445'
'80','35001.00','2.75','36','998.99','2024-03-10','2027-02-23','Active','39325'
'228','42989.00','2.42','72','611.52','2024-01-08','2029-12-07','Active','85974'
'251','32688.00','5.57','36','958.58','2024-04-16','2027-04-01','Active','47078'








