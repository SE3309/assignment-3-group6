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
