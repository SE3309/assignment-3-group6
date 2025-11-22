-- Modification 1: Update commission for top-performing salespeople
-- Increase commission by 0.01 (up to max 0.99) for salespeople whose total sales exceed 100000

SET SQL_SAFE_UPDATES = 0;

UPDATE Salesperson s
SET commission =
    CASE
        WHEN commission + 0.01 > 0.99 THEN 0.99
        ELSE commission + 0.01
    END
WHERE s.SIN IN (
    SELECT eSIN
    FROM Sale
    GROUP BY eSIN
    HAVING SUM(salePrice) > 100000
);

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
    'INV-' || CAST(s.saleID AS CHAR),
    CURRENT_TIMESTAMP,
    (s.saleDate + INTERVAL '14' DAY),
    s.salePrice,
    'Pending',
    s.saleID
FROM Sale AS s
WHERE NOT EXISTS (
    SELECT 1
    FROM Invoice AS i
    WHERE i.saleID = s.saleID
    OR i.invoiceNumber = 'INV-' || CAST(s.saleID AS CHAR)
);

-- Modification 3 (ISO Standard):
-- Delete completed test drives older than 1 year with no associated sale.

DELETE FROM TestDrive td
WHERE td.testDriveStatus = 'Completed'
  AND td.endTime < (CURRENT_DATE - INTERVAL '1' YEAR)
  AND NOT EXISTS (
        SELECT 1
        FROM Sale s
        WHERE s.driverLicenseNumber = td.driverLicenseNumber
          AND s.VIN = td.VIN
    );

