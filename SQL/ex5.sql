-- Query 1: Salesperson Performance with Subquery
-- Find salespeople with above-average salaries and their commission rates
SELECT 
    fName,
    lName,
    salary,
    commission,
    ROUND((commission * 100), 1) AS commission_percentage,
    (SELECT AVG(salary) FROM Salesperson) AS company_avg_salary
FROM Salesperson
WHERE salary > (SELECT AVG(salary) FROM Salesperson)
ORDER BY salary DESC
-- LIMIT 10;

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
-- LIMIT 10;

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
-- LIMIT 10;

-- Query 5: Customer Distribution by Province with Aggregation
-- Count customers by province and show percentage of total
SELECT 
    province,
    COUNT(*) AS customer_count,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Customer)), 1) AS percentage_of_total,
    SUM(CASE WHEN eFlag = TRUE THEN 1 ELSE 0 END) AS eligible_customers,
    SUM(CASE WHEN tFlag = TRUE THEN 1 ELSE 0 END) AS test_drive_customers
FROM Customer
GROUP BY province
HAVING customer_count > 10
ORDER BY customer_count DESC;

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

-- LIMIT 15;

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