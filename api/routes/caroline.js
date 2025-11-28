const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ----------------Archive Old Unsuccessful Test Drives----------------
// Preview: how many test drives would be deleted
router.get('/caroline/archive-test-drives/preview', async (req, res) => {
  try {
    const { cutoff } = req.query;

    if (!cutoff) {
      return res
        .status(400)
        .json({ ok: false, error: 'cutoff query parameter (YYYY-MM-DD) is required' });
    }

    const [rows] = await db.execute(
      `
      SELECT COUNT(*) AS toDeleteCount
      FROM TestDrive td
      WHERE td.endTime < ?
        AND NOT EXISTS (
          SELECT 1
          FROM Sale s
          WHERE s.driverLicenseNumber = td.driverLicenseNumber
            AND s.VIN = td.VIN
        )
      `,
      [cutoff]
    );

    return res.json({
      ok: true,
      cutoff,
      toDeleteCount: rows[0]?.toDeleteCount ?? 0,
    });
  } catch (err) {
    console.error('Error in GET /caroline/archive-test-drives/preview:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Delete: actually archive (delete) old unsuccessful test drives
router.delete('/caroline/archive-test-drives', async (req, res) => {
  try {
    const { cutoff } = req.body;

    if (!cutoff) {
      return res
        .status(400)
        .json({ ok: false, error: 'cutoff in request body (YYYY-MM-DD) is required' });
    }

    // Perform the DELETE with NOT EXISTS
    const [deleteResult] = await db.execute(
      `
      DELETE FROM TestDrive
      WHERE endTime < ?
        AND NOT EXISTS (
          SELECT 1
          FROM Sale s
          WHERE s.driverLicenseNumber = TestDrive.driverLicenseNumber
            AND s.VIN = TestDrive.VIN
        )
      `,
      [cutoff]
    );

    const deletedCount = deleteResult.affectedRows ?? 0;

    // Sanity check: any remaining old test drives after deletion?
    const [remainingRows] = await db.execute(
      `
      SELECT *
      FROM TestDrive
      WHERE endTime < ?
      ORDER BY endTime ASC
      `,
      [cutoff]
    );

    return res.json({
      ok: true,
      message: `Archived ${deletedCount} old unsuccessful test drives.`,
      cutoff,
      deletedCount,
      remainingOldTestDrives: remainingRows,
    });
  } catch (err) {
    console.error('Error in DELETE /caroline/archive-test-drives:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});


// ----------------Create/Recalc Payment Schedule for a Sale----------------

// Helper: standard amortization monthly payment
function calculateMonthlyPayment(loanAmount, annualInterestRate, termMonths) {
  const principal = Number(loanAmount);
  const n = Number(termMonths);
  const annualRate = Number(annualInterestRate);

  if (!Number.isFinite(principal) || !Number.isFinite(annualRate) || !Number.isFinite(n) || n <= 0) {
    return null;
  }

  const r = annualRate / 12 / 100; // monthly interest rate as decimal

  if (r === 0) {
    // No interest case
    return principal / n;
  }

  // payment = P * r / (1 - (1 + r)^(-n))
  const payment = principal * r / (1 - Math.pow(1 + r, -n));
  return payment;
}

// Create / recalc payment schedule
// POST /api/caroline/payment-schedule
// body: { "saleId": 123, "termMonths": 36, "annualInterestRate": 5.5 }
router.post('/caroline/payment-schedule', async (req, res) => {
  try {
    const saleId = Number(req.body.saleId);
    const termMonths = Number(req.body.termMonths);
    const annualInterestRate = Number(req.body.annualInterestRate);

    if (!saleId || !termMonths || !annualInterestRate) {
      return res.status(400).json({
        ok: false,
        error: 'saleId, termMonths, and annualInterestRate are required and must be numeric',
      });
    }

    // 1. Get sale details
    const [saleRows] = await db.execute(
      `
      SELECT saleID, salePrice, downPayment, saleDate
      FROM Sale
      WHERE saleID = ?
      `,
      [saleId]
    );

    if (saleRows.length === 0) {
      return res.status(404).json({ ok: false, error: `Sale with ID ${saleId} not found` });
    }

    const sale = saleRows[0];

    const loanAmount = Number(sale.salePrice) - Number(sale.downPayment);
    const startDate = sale.saleDate; // DATE

    const monthlyPaymentRaw = calculateMonthlyPayment(loanAmount, annualInterestRate, termMonths);
    if (monthlyPaymentRaw == null) {
      return res.status(400).json({
        ok: false,
        error: 'Could not calculate monthly payment with given inputs',
      });
    }

    // Round to 2 decimal places for storage as DECIMAL(10,2)
    const monthlyPayment = Number(monthlyPaymentRaw.toFixed(2));

    // 2. Check if a schedule already exists for this saleID
    const [existingScheduleRows] = await db.execute(
      `
      SELECT *
      FROM PaymentSchedule
      WHERE saleID = ?
      `,
      [saleId]
    );

    let message;

    if (existingScheduleRows.length > 0) {
      // 3a. UPDATE existing schedule
      await db.execute(
        `
        UPDATE PaymentSchedule
        SET
          totalLoanAmount = ?,
          interestRate = ?,
          termDurationMonths = ?,
          monthlyPayment = ?,
          startDate = ?,
          endDate = DATE_ADD(?, INTERVAL ? MONTH),
          paymentStatus = 'Active'
        WHERE saleID = ?
        `,
        [
          loanAmount,
          annualInterestRate,
          termMonths,
          monthlyPayment,
          startDate,
          startDate,
          termMonths,
          saleId,
        ]
      );

      message = 'Payment schedule updated.';
    } else {
      // 3b. INSERT new schedule
      const [[maxRow]] = await db.execute(
        `
        SELECT IFNULL(MAX(scheduleID) + 1, 1) AS nextScheduleID
        FROM PaymentSchedule
        `
      );
      const nextScheduleID = Number(maxRow.nextScheduleID) || 1;

      await db.execute(
        `
        INSERT INTO PaymentSchedule
          (scheduleID, totalLoanAmount, interestRate, termDurationMonths,
           monthlyPayment, startDate, endDate, paymentStatus, saleID)
        VALUES
          (?, ?, ?, ?, ?, ?, DATE_ADD(?, INTERVAL ? MONTH), 'Active', ?)
        `,
        [
          nextScheduleID,
          loanAmount,
          annualInterestRate,
          termMonths,
          monthlyPayment,
          startDate,
          startDate,
          termMonths,
          saleId,
        ]
      );

      message = 'Payment schedule created.';
    }

    // 4. Return the resulting schedule for validation display
    const [finalScheduleRows] = await db.execute(
      `
      SELECT *
      FROM PaymentSchedule
      WHERE saleID = ?
      `,
      [saleId]
    );

    return res.json({
      ok: true,
      message,
      schedule: finalScheduleRows[0] ?? null,
    });
  } catch (err) {
    console.error('Error in POST /caroline/payment-schedule:', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

module.exports = router;
