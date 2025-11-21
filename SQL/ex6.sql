-- Modification 1: Update commission for top-performing salespeople
-- Increase commission by 0.01 (up to max 0.99) for salespeople whose total sales exceed 100000

UPDATE Salesperson AS s
JOIN (
    SELECT eSIN AS SIN, SUM(salePrice) AS total_sales
    FROM Sale
    GROUP BY eSIN
) AS stats ON s.SIN = stats.SIN
SET s.commission = LEAST(s.commission + 0.01, 0.99)
WHERE stats.total_sales > 100000;

-- Modification 2: Insert invoices for sales that do not yet have an invoice
-- Creates an invoice per sale, only when Invoice.saleID does NOT already exist

INSERT INTO Invoice (
    invoiceNumber,
    dateGenerated,
    paymentDueDate,
    totalAmountDue,
    invoiceStatus,
    saleID
)
SELECT
    CONCAT('INV-', s.saleID) AS invoiceNumber,
    NOW() AS dateGenerated,
    DATE_ADD(s.saleDate, INTERVAL 14 DAY) AS paymentDueDate,
    s.salePrice AS totalAmountDue,
    'Pending' AS invoiceStatus,
    s.saleID
FROM Sale AS s
WHERE NOT EXISTS (
    SELECT 1
    FROM Invoice AS i
    WHERE i.saleID = s.saleID
);

-- Modification 3: Delete old completed test drives with no related sale
-- Deletes more than one but less than all test drives:
--  - status = 'Completed'
--  - older than 1 year
--  - customer/vehicle pair never resulted in a Sale

DELETE td
FROM TestDrive AS td
LEFT JOIN Sale AS s
    ON s.driverLicenseNumber = td.driverLicenseNumber
   AND s.VIN = td.VIN
WHERE td.testDriveStatus = 'Completed'
  AND td.endTime < DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
  AND s.saleID IS NULL;
