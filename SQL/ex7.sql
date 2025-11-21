CREATE VIEW HighCommissionSalespeople AS
SELECT
    SIN,
    fName,
    lName,
    commission,
    salary
FROM Salesperson
WHERE commission >= 0.10;

CREATE VIEW InvoiceMonthlySummary AS
SELECT
    EXTRACT(YEAR  FROM dateGenerated) AS invoiceYear,
    EXTRACT(MONTH FROM dateGenerated) AS invoiceMonth,
    COUNT(*)                           AS numberOfInvoices,
    SUM(totalAmountDue)                AS totalInvoicedAmount
FROM Invoice
GROUP BY
    EXTRACT(YEAR  FROM dateGenerated),
    EXTRACT(MONTH FROM dateGenerated);invoicemonthlysummary