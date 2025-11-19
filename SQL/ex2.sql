CREATE TABLE Salesperson (
    SIN VARCHAR(15) PRIMARY KEY,
    fName VARCHAR(255) NOT NULL,
    lName VARCHAR(255) NOT NULL,
    commission DECIMAL(4, 2) NOT NULL,
    salary INT NOT NULL
);

CREATE TABLE Manager (
    SIN VARCHAR(15) PRIMARY KEY,
    fName VARCHAR(255) NOT NULL,
    lName VARCHAR(255) NOT NULL,
    salary INT NOT NULL,
    bonus INT NOT NULL
);

CREATE TABLE Customer (
    driverLicenseNumber VARCHAR(255) PRIMARY KEY,
    fName VARCHAR(255) NOT NULL,
    lName VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    postalCode VARCHAR(255) NOT NULL,
    birthday DATE NOT NULL,
    eFlag BOOLEAN NOT NULL,
    tFlag BOOLEAN NOT NULL,
    pFlag BOOLEAN NOT NULL
);

CREATE TABLE PhoneNumber (
    phoneNumber VARCHAR(15) PRIMARY KEY,
    driverLicenseNumber VARCHAR(255) NOT NULL REFERENCES Customer(driverLicenseNumber)
);

CREATE TABLE Email (
    emailAddress VARCHAR(255) PRIMARY KEY,
    driverLicenseNumber VARCHAR(255) NOT NULL REFERENCES Customer(driverLicenseNumber)
);

CREATE TABLE Vehicle (
    VIN VARCHAR(255) PRIMARY KEY,
    stockNumber VARCHAR(255) UNIQUE NOT NULL,
    modelYear INT NOT NULL,
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    trim VARCHAR(255) NOT NULL,
    mileage INT NOT NULL,
    colour VARCHAR(255) NOT NULL,
    inventoryStatus VARCHAR(255) NOT NULL,
    acquisitionCost INT NOT NULL,
    basePrice INT NOT NULL
);

CREATE TABLE TestDrive (
    testDriveID INT PRIMARY KEY,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    testDriveStatus VARCHAR(255) NOT NULL,
    driverLicenseNumber VARCHAR(255) NOT NULL REFERENCES Customer(driverLicenseNumber),
    SIN VARCHAR(15) NOT NULL REFERENCES Salesperson(SIN),
    VIN VARCHAR(255) NOT NULL REFERENCES Vehicle(VIN)
);

CREATE TABLE Photo (
    photoID INT PRIMARY KEY,
    photoURL VARCHAR(255) NOT NULL,
    VIN VARCHAR(255) NOT NULL REFERENCES Vehicle(VIN)
);

CREATE TABLE Sale (
    saleID INT PRIMARY KEY,
    saleType VARCHAR(255) NOT NULL,
    downPayment INT NOT NULL,
    salePrice INT NOT NULL,
    saleDate DATE NOT NULL,
    driverLicenseNumber VARCHAR(255) NOT NULL REFERENCES Customer(driverLicenseNumber),
    eSIN VARCHAR(15) NOT NULL REFERENCES Salesperson(SIN),
    mSIN VARCHAR(15) NOT NULL REFERENCES Manager(SIN),
    VIN VARCHAR(255) NOT NULL REFERENCES Vehicle(VIN)
);

CREATE TABLE PaymentSchedule (
    scheduleID INT PRIMARY KEY,
    totalLoanAmount DECIMAL(10, 2) NOT NULL,
    interestRate DECIMAL(4, 2) NOT NULL,
    termDurationMonths INT NOT NULL,
    monthlyPayment DECIMAL(10, 2) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    paymentStatus VARCHAR(255) NOT NULL,
    saleID INT UNIQUE NOT NULL REFERENCES Sale(saleID)
);

CREATE TABLE Invoice (
    invoiceNumber VARCHAR(255) PRIMARY KEY,
    dateGenerated DATETIME NOT NULL,
    paymentDueDate DATE NOT NULL,
    totalAmountDue DECIMAL(10, 2) NOT NULL,
    invoiceStatus VARCHAR(255) NOT NULL,
    saleID INT UNIQUE NOT NULL REFERENCES Sale(saleID)
);

CREATE TABLE LineItem (
    itemID INT PRIMARY KEY,
    itemName VARCHAR(255) NOT NULL,
    itemDescription VARCHAR(1000) DEFAULT '',
    amount DECIMAL(10, 2) NOT NULL,
    invoiceNumber VARCHAR(255) UNIQUE NOT NULL REFERENCES Invoice(invoiceNumber)
);

DELIMITER $$

CREATE TRIGGER prevent_overlapping_testdrives
BEFORE INSERT ON TestDrive
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM TestDrive t
        WHERE t.VIN = NEW.VIN
          AND (
                (NEW.startTime < t.endTime)
                AND (NEW.endTime > t.startTime)
              )
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Overlapping test drives not allowed for the same vehicle.';
    END IF;
END$$

CREATE TRIGGER prevent_duplicate_sale
BEFORE INSERT ON Sale
FOR EACH ROW
BEGIN
    DECLARE currentStatus VARCHAR(50);

    SELECT inventoryStatus INTO currentStatus
    FROM Vehicle
    WHERE VIN = NEW.VIN;

    IF currentStatus = 'Sold' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Vehicle has already been sold.';
    END IF;
END$$

CREATE TRIGGER update_vehicle_status_on_sale
AFTER INSERT ON Sale
FOR EACH ROW
BEGIN
    UPDATE Vehicle
    SET inventoryStatus = 'Sold'
    WHERE VIN = NEW.VIN;
END$$

CREATE TRIGGER invoice_sum_after_insert
AFTER INSERT ON LineItem
FOR EACH ROW
BEGIN
    UPDATE Invoice
    SET totalAmountDue = (
        SELECT COALESCE(SUM(amount), 0)
        FROM LineItem
        WHERE invoiceNumber = NEW.invoiceNumber
    )
    WHERE invoiceNumber = NEW.invoiceNumber;
END$$

CREATE TRIGGER invoice_sum_after_delete
AFTER DELETE ON LineItem
FOR EACH ROW
BEGIN
    UPDATE Invoice
    SET totalAmountDue = (
        SELECT COALESCE(SUM(amount), 0)
        FROM LineItem
        WHERE invoiceNumber = OLD.invoiceNumber
    )
    WHERE invoiceNumber = OLD.invoiceNumber;
END$$

DELIMITER ;