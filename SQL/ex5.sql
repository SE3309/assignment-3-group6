-- Query 1: Multiple Relations + JOIN
-- Find salespeople and their managers with sales count
SELECT 
    s.fName AS salesperson_first,
    s.lName AS salesperson_last,
    m.fName AS manager_first, 
    m.lName AS manager_last,
    COUNT(sale.saleID) AS total_sales
FROM Salesperson s
JOIN Sale sale ON s.SIN = sale.eSIN
JOIN Manager m ON sale.mSIN = m.SIN
GROUP BY s.SIN, m.SIN
HAVING total_sales > 0
LIMIT 10;

-- Query 2: Subquery + EXISTS
-- Customers with test drives but no purchases
SELECT 
    c.fName, 
    c.lName, 
    c.city
FROM Customer c
WHERE EXISTS (
    SELECT 1 
    FROM TestDrive td 
    WHERE td.driverLicenseNumber = c.driverLicenseNumber
)
AND NOT EXISTS (
    SELECT 1 
    FROM Sale s 
    WHERE s.driverLicenseNumber = c.driverLicenseNumber
)
LIMIT 10;

-- Query 3: GROUP BY + Aggregation
-- Vehicle statistics by make
SELECT 
    make,
    COUNT(*) AS vehicle_count,
    AVG(basePrice) AS avg_price,
    MAX(basePrice) AS max_price,
    MIN(basePrice) AS min_price
FROM Vehicle
WHERE inventoryStatus = 'Available'
GROUP BY make
HAVING vehicle_count > 0
ORDER BY avg_price DESC;

-- Query 4: Correlated Subquery
-- Salespeople with above-average commission in their salary range
SELECT 
    fName,
    lName,
    commission,
    salary
FROM Salesperson s1
WHERE commission > (
    SELECT AVG(commission) 
    FROM Salesperson s2
    WHERE s2.salary BETWEEN s1.salary - 10000 AND s1.salary + 10000
)
ORDER BY commission DESC
LIMIT 10;

-- Query 5: Multiple JOINs + Date Functions
-- Recent sales with details
SELECT 
    c.fName AS customer_first,
    c.lName AS customer_last,
    v.make,
    v.model,
    s.salePrice,
    s.saleDate
FROM Sale s
JOIN Customer c ON s.driverLicenseNumber = c.driverLicenseNumber
JOIN Vehicle v ON s.VIN = v.VIN
WHERE s.saleDate > '2024-01-01'
ORDER BY s.saleDate DESC
LIMIT 10;

-- Query 6: UNION
-- High-value customers/multiple test drives
(SELECT 
    c.fName,
    c.lName,
    'High Value Purchase' AS reason
FROM Customer c
JOIN Sale s ON c.driverLicenseNumber = s.driverLicenseNumber
WHERE s.salePrice > 20000)

UNION

(SELECT 
    c.fName,
    c.lName,
    'Multiple Test Drives' AS reason
FROM Customer c
JOIN TestDrive td ON c.driverLicenseNumber = td.driverLicenseNumber
GROUP BY c.driverLicenseNumber
HAVING COUNT(*) > 1)

LIMIT 15;

-- Query 7: Window Function/GROUP BY alternative
-- Salesperson rankings
SELECT 
    s.fName,
    s.lName,
    COALESCE(SUM(sale.salePrice), 0) AS total_sales
FROM Salesperson s
LEFT JOIN Sale sale ON s.SIN = sale.eSIN
GROUP BY s.SIN
ORDER BY total_sales DESC
LIMIT 10;