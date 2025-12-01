const express = require('express');
const router = express.Router();
const db = require('../config/database');

//Normalize Invoice Values from inputted integer to form INV(number)
function normalizeInvoiceNumber(raw) {
  if (!raw) return null;

  if (raw.startsWith("INV")) return raw;

  return `INV${raw}`;
}

// Feature 7: Get Invoice & Line Items
router.get('/arjun/invoices/:invoiceNumber', async (req, res) => {
  try {
    
    let invoiceNumber = normalizeInvoiceNumber(req.params.invoiceNumber);
    if (!invoiceNumber) {
        return res.status(400).json({ ok: false, error: "Invalid invoiceNumber" });
    }

    if (!invoiceNumber) {
      return res.status(400).json({ ok: false, error: 'invoiceNumber is required' });
    }

    const [rows] = await db.execute(
      `
        SELECT 
          i.invoiceNumber,
          i.totalAmountDue,
          i.dateGenerated AS invoiceDate,
          c.driverLicenseNumber,
          c.fName,
          c.lName,
          s.saleID,
          s.salePrice,
          li.itemID,
          li.itemName,
          li.itemDescription,
          li.amount
        FROM Invoice i
        JOIN Sale s 
          ON i.saleID = s.saleID
        JOIN Customer c 
          ON s.driverLicenseNumber = c.driverLicenseNumber
        LEFT JOIN LineItem li 
          ON li.invoiceNumber = i.invoiceNumber
        WHERE i.invoiceNumber = ?
      `,
      [invoiceNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Invoice not found' });
    }

    //Seperates duplicated info into header to remove redundancy in displayed data
    const header = {
      invoiceNumber: rows[0].invoiceNumber,
      invoiceDate: rows[0].invoiceDate,
      customerName: `${rows[0].fName} ${rows[0].lName}`,
      driverLicenseNumber: rows[0].driverLicenseNumber,
      saleID: rows[0].saleID,
      salePrice: rows[0].salePrice,
      totalAmountDue: rows[0].totalAmountDue,
    };

    const lineItems = rows
      .filter(r => r.itemID != null)
      .map(r => ({
        itemID: r.itemID,
        itemName: r.itemName,
        itemDescription: r.itemDescription,
        amount: r.amount,
      }));

    return res.json({ ok: true, invoice: header, lineItems });
  } catch (err) {
    console.error('Error in GET /arjun/invoices/:invoiceNumber', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Feature 7: Add a new line item
router.post('/arjun/invoices/:invoiceNumber/line-items', async (req, res) => {
  
    let invoiceNumber = normalizeInvoiceNumber(req.params.invoiceNumber);
    if (!invoiceNumber) {
        return res.status(400).json({ ok: false, error: "Invalid invoiceNumber" });
    }

  const { itemName, description, amount } = req.body;

    if (!invoiceNumber || !description || !Number(amount)) {
    return res.status(400).json({
        ok: false,
        error: 'invoiceNumber, itemName, description, and numeric amount are required'
    });
    }

  const amountNum = Number(amount);

  try {
    // 1. Make sure the invoice exists
    const [invoiceRows] = await db.execute(
      'SELECT invoiceNumber FROM Invoice WHERE invoiceNumber = ?',
      [invoiceNumber]
    );
    if (invoiceRows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Invoice not found' });
    }

    // 2. Get next itemID (since itemID is NOT auto-increment)
    const [[maxRow]] = await db.execute(
      'SELECT IFNULL(MAX(itemID) + 1, 1) AS nextId FROM LineItem'
    );
    const nextItemID = Number(maxRow.nextId) || 1;

    // 3. Insert a NEW line item for this invoice
    await db.execute(
        `
            INSERT INTO LineItem (itemID, itemName, itemDescription, amount, invoiceNumber)
            VALUES (?, ?, ?, ?, ?)
        `,
        [nextItemID, itemName || 'Extra charge', description, amountNum, invoiceNumber]
    );

    // 4. Recalculate invoice total based on all line items
    await db.execute(
      `
        UPDATE Invoice
        SET totalAmountDue = (
          SELECT COALESCE(SUM(amount), 0)
          FROM LineItem
          WHERE invoiceNumber = ?
        )
        WHERE invoiceNumber = ?
      `,
      [invoiceNumber, invoiceNumber]
    );

    // 5. Re-fetch full invoice for validation (same query as GET)
    const [rows] = await db.execute(
      `
        SELECT 
          i.invoiceNumber,
          i.totalAmountDue,
          i.dateGenerated AS invoiceDate,
          c.driverLicenseNumber,
          c.fName,
          c.lName,
          s.saleID,
          s.salePrice,
          li.itemID,
          li.itemName,
          li.itemDescription,
          li.amount
        FROM Invoice i
        JOIN Sale s 
          ON i.saleID = s.saleID
        JOIN Customer c 
          ON s.driverLicenseNumber = c.driverLicenseNumber
        LEFT JOIN LineItem li 
          ON li.invoiceNumber = i.invoiceNumber
        WHERE i.invoiceNumber = ?
      `,
      [invoiceNumber]
    );

    const header = {
      invoiceNumber: rows[0].invoiceNumber,
      invoiceDate: rows[0].invoiceDate,
      customerName: `${rows[0].fName} ${rows[0].lName}`,
      driverLicenseNumber: rows[0].driverLicenseNumber,
      saleID: rows[0].saleID,
      salePrice: rows[0].salePrice,
      totalAmountDue: rows[0].totalAmountDue,
    };

    const lineItems = rows
      .filter(r => r.itemID != null)
      .map(r => ({
        itemID: r.itemID,
        itemName: r.itemName,
        itemDescription: r.itemDescription,
        amount: r.amount,
      }));

    return res.json({
      ok: true,
      message: 'Line item added and invoice total recomputed.',
      invoice: header,
      lineItems,
    });
  } catch (err) {
    console.error('Error in POST /arjun/invoices/:invoiceNumber/line-items', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Feature 8: Bulk Commission Adjustment
router.post('/arjun/commission-adjust', async (req, res) => {
  try {
    const { startDate, endDate, threshold, bump } = req.body;

    const thresholdNum = Number(threshold);
    const bumpNum = Number(bump);

    if (!startDate || !endDate || !thresholdNum || !bumpNum) {
      return res.status(400).json({
        ok: false,
        error: 'startDate, endDate, numeric threshold, and numeric bump are required',
      });
    }

    // 1. Values before change to commission
    const [beforeRows] = await db.execute(
      `
        SELECT 
          sp.SIN,
          sp.fName,
          sp.lName,
          sp.commission AS commissionBefore,
          SUM(sa.salePrice) AS totalRevenue
        FROM Salesperson sp
        JOIN Sale sa 
          ON sp.SIN = sa.eSIN
        WHERE sa.saleDate BETWEEN ? AND ?
        GROUP BY sp.SIN, sp.fName, sp.lName, sp.commission
        HAVING SUM(sa.salePrice) > ?
      `,
      [startDate, endDate, thresholdNum]
    );

    // 2. Bulk commission update
    const [updateResult] = await db.execute(
    `
        UPDATE Salesperson sp
        JOIN (
        SELECT s.SIN
        FROM Salesperson s
        JOIN Sale sa 
            ON sa.eSIN = s.SIN
        WHERE sa.saleDate BETWEEN ? AND ?
        GROUP BY s.SIN
        HAVING SUM(sa.salePrice) > ?
        ) AS topSellers
        ON sp.SIN = topSellers.SIN
        SET sp.commission = LEAST(sp.commission + ?, 0.99)
    `,
    [
        startDate,
        endDate,
        thresholdNum,
        bumpNum
    ]
    );

    const affectedCount = updateResult.affectedRows ?? 0;

    // 3. After commission update
    const [afterRows] = await db.execute(
      `
        SELECT 
          sp.SIN,
          sp.fName,
          sp.lName,
          sp.commission AS commissionAfter,
          SUM(sa.salePrice) AS totalRevenue
        FROM Salesperson sp
        JOIN Sale sa 
          ON sp.SIN = sa.eSIN
        WHERE sa.saleDate BETWEEN ? AND ?
        GROUP BY sp.SIN, sp.fName, sp.lName, sp.commission
        HAVING SUM(sa.salePrice) > ?
      `,
      [startDate, endDate, thresholdNum]
    );

    // 4. Merge before/after to display changes
    const merged = afterRows.map(after => {
      const before = beforeRows.find(b => b.SIN === after.SIN);
      return {
        SIN: after.SIN,
        fName: after.fName,
        lName: after.lName,
        totalRevenue: after.totalRevenue,
        commissionBefore: before ? before.commissionBefore : null,
        commissionAfter: after.commissionAfter,
      };
    });

    return res.json({
      ok: true,
      message: `Updated commission for ${affectedCount} salesperson(s).`,
      startDate,
      endDate,
      threshold: thresholdNum,
      bump: bumpNum,
      results: merged,
    });
  } catch (err) {
    console.error('Error in POST /arjun/commission-adjust', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

module.exports = router;
