const express = require('express');
const router = express.Router();
const db = require('../config/database');

// fetch lightweight option lists for the scheduling form
router.get('/shiven/test-drive-options', async (_req, res) => {
    try {
        const [customers] = await db.query(
            `SELECT driverLicenseNumber, fName, lName
             FROM Customer
             ORDER BY lName, fName
             LIMIT 50`
        );

        const [salespeople] = await db.query(
            `SELECT SIN, fName, lName
             FROM Salesperson
             ORDER BY lName, fName
             LIMIT 50`
        );

        const [vehicles] = await db.query(
            `SELECT VIN, make, model, trim, modelYear, inventoryStatus
             FROM Vehicle
             WHERE inventoryStatus <> 'Sold'
             ORDER BY make, model, trim
             LIMIT 50`
        );

        res.json({ customers, salespeople, vehicles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// search helpers for large datasets (customers, salespeople, vehicles)
router.get('/shiven/search/customers', async (req, res) => {
    try {
        const term = req.query.q ? `%${req.query.q}%` : '%';
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const pageSize = 15;
        const offset = (page - 1) * pageSize;
        const [rows] = await db.query(
            `SELECT driverLicenseNumber, fName, lName
             FROM Customer
             WHERE driverLicenseNumber LIKE ?
                OR fName LIKE ?
                OR lName LIKE ?
             ORDER BY lName, fName
             LIMIT ? OFFSET ?`,
            [term, term, term, pageSize + 1, offset]
        );
        const results = rows.slice(0, pageSize);
        res.json({ results, hasMore: rows.length > pageSize });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/shiven/search/salespeople', async (req, res) => {
    try {
        const term = req.query.q ? `%${req.query.q}%` : '%';
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const pageSize = 15;
        const offset = (page - 1) * pageSize;
        const [rows] = await db.query(
            `SELECT SIN, fName, lName, salary, commission
             FROM Salesperson
             WHERE SIN LIKE ?
                OR fName LIKE ?
                OR lName LIKE ?
             ORDER BY lName, fName
             LIMIT ? OFFSET ?`,
            [term, term, term, pageSize + 1, offset]
        );
        const results = rows.slice(0, pageSize);
        res.json({ results, hasMore: rows.length > pageSize });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/shiven/search/vehicles', async (req, res) => {
    try {
        const term = req.query.q ? `%${req.query.q}%` : '%';
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const pageSize = 15;
        const offset = (page - 1) * pageSize;
        const [rows] = await db.query(
            `SELECT VIN, make, model, trim, modelYear, inventoryStatus
             FROM Vehicle
             WHERE (VIN LIKE ?
                OR make LIKE ?
                OR model LIKE ?
                OR trim LIKE ?)
               AND inventoryStatus <> 'Sold'
             ORDER BY modelYear DESC, make, model, trim
             LIMIT ? OFFSET ?`,
            [term, term, term, term, pageSize + 1, offset]
        );
        const results = rows.slice(0, pageSize);
        res.json({ results, hasMore: rows.length > pageSize });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get upcoming test drives for a specific vehicle and day (validation table)
router.get('/shiven/test-drives/upcoming', async (req, res) => {
    try {
        const { vin, date } = req.query;

        if (!vin || !date) {
            return res.status(400).json({ error: 'vin and date query params are required (YYYY-MM-DD)' });
        }

        const [rows] = await db.query(
            `SELECT 
                td.testDriveID,
                td.startTime,
                td.endTime,
                td.testDriveStatus,
                c.fName AS customerFirstName,
                c.lName AS customerLastName,
                s.fName AS salespersonFirstName,
                s.lName AS salespersonLastName,
                c.driverLicenseNumber,
                s.SIN,
                v.make,
                v.model,
                v.trim
            FROM TestDrive td
            JOIN Customer c ON c.driverLicenseNumber = td.driverLicenseNumber
            JOIN Salesperson s ON s.SIN = td.SIN
            JOIN Vehicle v ON v.VIN = td.VIN
            WHERE td.VIN = ?
              AND DATE(td.startTime) = DATE(?)
            ORDER BY td.startTime ASC`,
            [vin, date]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// schedule a conflict-free test drive using NOT EXISTS overlap guard
router.post('/shiven/test-drives', async (req, res) => {
    try {
        const { driverLicenseNumber, VIN, SIN, startTime, endTime, status } = req.body;

        if (!driverLicenseNumber || !VIN || !SIN || !startTime || !endTime || !status) {
            return res.status(400).json({ error: 'driverLicenseNumber, VIN, SIN, startTime, endTime, and status are required' });
        }

        // generate a simple next ID; table is non-AUTO_INCREMENT
        const [idRows] = await db.query('SELECT COALESCE(MAX(testDriveID), 0) + 1 AS nextId FROM TestDrive');
        const nextId = idRows[0]?.nextId;

        const [insertResult] = await db.query(
            `INSERT INTO TestDrive (testDriveID, startTime, endTime, testDriveStatus, driverLicenseNumber, SIN, VIN)
             SELECT ?, ?, ?, ?, ?, ?, ?
             FROM dual
             WHERE NOT EXISTS (
                SELECT 1 FROM TestDrive td
                WHERE td.VIN = ?
                  AND td.testDriveStatus <> 'Cancelled'
                  AND (? < td.endTime AND ? > td.startTime)
             )`,
            [nextId, startTime, endTime, status, driverLicenseNumber, SIN, VIN, VIN, startTime, endTime]
        );

        if (insertResult.affectedRows === 0) {
            return res.status(409).json({ error: 'Vehicle already has an overlapping test drive for that time range' });
        }

        const [upcoming] = await db.query(
            `SELECT 
                td.testDriveID,
                td.startTime,
                td.endTime,
                td.testDriveStatus,
                c.fName AS customerFirstName,
                c.lName AS customerLastName,
                s.fName AS salespersonFirstName,
                s.lName AS salespersonLastName,
                c.driverLicenseNumber,
                s.SIN,
                v.make,
                v.model,
                v.trim
            FROM TestDrive td
            JOIN Customer c ON c.driverLicenseNumber = td.driverLicenseNumber
            JOIN Salesperson s ON s.SIN = td.SIN
            JOIN Vehicle v ON v.VIN = td.VIN
            WHERE td.VIN = ?
              AND DATE(td.startTime) = DATE(?)
            ORDER BY td.startTime ASC`,
            [VIN, startTime]
        );

        res.status(201).json({
            message: 'Test drive scheduled',
            testDriveID: nextId,
            upcoming
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Promote a salesperson to manager and optionally update salary
router.post('/shiven/promote-salesperson', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { SIN, bonus, newSalary } = req.body;

        if (!SIN || bonus === undefined || bonus === null) {
            connection.release();
            return res.status(400).json({ error: 'SIN and bonus are required' });
        }

        await connection.beginTransaction();

        const [[salesperson]] = await connection.query(
            `SELECT SIN, fName, lName, salary, commission FROM Salesperson WHERE SIN = ?`,
            [SIN]
        );

        if (!salesperson) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: 'Salesperson not found' });
        }

        const suggestedManagerSalary = newSalary || (salesperson.salary + salesperson.salary * (salesperson.commission || 0));

        // Optional salary update on salesperson
        if (newSalary) {
            await connection.query(
                `UPDATE Salesperson SET salary = ? WHERE SIN = ?`,
                [newSalary, SIN]
            );
        }

        const [insertResult] = await connection.query(
            `INSERT INTO Manager (SIN, fName, lName, salary, bonus)
             SELECT s.SIN, s.fName, s.lName, COALESCE(?, s.salary), ?
             FROM Salesperson s
             WHERE s.SIN = ?
               AND NOT EXISTS (SELECT 1 FROM Manager m WHERE m.SIN = s.SIN)`,
            [suggestedManagerSalary, bonus, SIN]
        );

        if (insertResult.affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ error: 'Salesperson not found or already a manager' });
        }

        // Zero out salesperson pay/commission to reflect exclusive manager role
        await connection.query(
            `UPDATE Salesperson SET commission = 0, salary = 0 WHERE SIN = ?`,
            [SIN]
        );

        await connection.commit();
        connection.release();
        res.status(201).json({
            message: 'Salesperson promoted to manager',
            SIN,
            managerSalary: suggestedManagerSalary
        });
    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ error: error.message });
    }
});

// Employee roles overview: salesperson vs manager
router.get('/shiven/roles-overview', async (_req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                s.SIN,
                s.fName,
                s.lName,
                s.salary AS salespersonSalary,
                m.salary AS managerSalary,
                m.bonus,
                (s.salary + s.salary * COALESCE(s.commission, 0)) AS suggestedManagerSalary,
                CASE WHEN m.SIN IS NOT NULL THEN 'Manager' ELSE 'Salesperson' END AS role
             FROM Salesperson s
             LEFT JOIN Manager m ON m.SIN = s.SIN
             
             UNION
             
             SELECT 
                m.SIN,
                m.fName,
                m.lName,
                NULL AS salespersonSalary,
                m.salary AS managerSalary,
                m.bonus,
                m.salary AS suggestedManagerSalary,
                'Manager' AS role
             FROM Manager m
             WHERE NOT EXISTS (SELECT 1 FROM Salesperson s WHERE s.SIN = m.SIN)
             
             ORDER BY lName, fName`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Salesperson performance leaderboard with optional date/min sales filters
router.get('/shiven/sales-leaderboard', async (req, res) => {
    try {
        const { startDate, endDate, minSales } = req.query;

        const params = [];
        let dateFilter = '';

        if (startDate) {
            dateFilter += ' AND s.saleDate >= ?';
            params.push(startDate);
        }
        if (endDate) {
            dateFilter += ' AND s.saleDate <= ?';
            params.push(endDate);
        }

        const minSalesFilter = Number(minSales) || 0;

        const [rows] = await db.query(
            `SELECT 
                sp.SIN,
                sp.fName,
                sp.lName,
                COALESCE(SUM(s.salePrice), 0) AS totalRevenue,
                COUNT(s.saleID) AS vehiclesSold,
                AVG(s.salePrice) AS avgSalePrice,
                RANK() OVER (ORDER BY COALESCE(SUM(s.salePrice), 0) DESC) AS rankPosition
            FROM Salesperson sp
            LEFT JOIN Sale s ON s.eSIN = sp.SIN
                ${dateFilter}
            GROUP BY sp.SIN, sp.fName, sp.lName
            HAVING COUNT(s.saleID) >= ?
            ORDER BY totalRevenue DESC, vehiclesSold DESC`,
            [...params, minSalesFilter]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// High-value customers report (spend and recent test drives without purchases)
router.get('/shiven/high-value-customers', async (req, res) => {
    try {
        const { minSpend, tdStartDate, tdEndDate, minTestDrives } = req.query;
        const spendThreshold = Number(minSpend) || 20000;
        const minDrives = Number(minTestDrives) || 0;

        const startDate = tdStartDate || null;
        const endDate = tdEndDate || null;
        const dateStart = startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const dateEnd = endDate || new Date().toISOString().slice(0, 10);

        const [rows] = await db.query(
            `
            SELECT 
                c.driverLicenseNumber,
                c.fName,
                c.lName,
                c.province,
                spend.totalSpent,
                spend.totalSales,
                td.recentTestDrives,
                ph.phoneNumber,
                lt.lastTestDriveAt,
                lt.lastVIN,
                ls.fName AS lastSalespersonFirstName,
                ls.lName AS lastSalespersonLastName,
                lv.make AS lastVehicleMake,
                lv.model AS lastVehicleModel,
                lv.trim AS lastVehicleTrim,
                lv.inventoryStatus AS lastVehicleStatus,
                'High Spender' AS segment
            FROM Customer c
            JOIN (
                SELECT s.driverLicenseNumber, SUM(s.salePrice) AS totalSpent, COUNT(*) AS totalSales
                FROM Sale s
                GROUP BY s.driverLicenseNumber
                HAVING SUM(s.salePrice) > ?
            ) spend ON spend.driverLicenseNumber = c.driverLicenseNumber
            LEFT JOIN (
                SELECT driverLicenseNumber, COUNT(*) AS recentTestDrives
                FROM TestDrive
                WHERE DATE(startTime) BETWEEN ? AND ?
                GROUP BY driverLicenseNumber
            ) td ON td.driverLicenseNumber = c.driverLicenseNumber
            LEFT JOIN (
                SELECT driverLicenseNumber, MIN(phoneNumber) AS phoneNumber
                FROM PhoneNumber
                GROUP BY driverLicenseNumber
            ) ph ON ph.driverLicenseNumber = c.driverLicenseNumber
            LEFT JOIN (
                SELECT driverLicenseNumber, startTime AS lastTestDriveAt, VIN AS lastVIN, SIN AS lastSIN, 
                       ROW_NUMBER() OVER (PARTITION BY driverLicenseNumber ORDER BY startTime DESC) AS rn
                FROM TestDrive
            ) lt ON lt.driverLicenseNumber = c.driverLicenseNumber AND lt.rn = 1
            LEFT JOIN Salesperson ls ON ls.SIN = lt.lastSIN
            LEFT JOIN Vehicle lv ON lv.VIN = lt.lastVIN
            HAVING COALESCE(td.recentTestDrives, 0) >= ?
            
            UNION
            
            SELECT 
                c.driverLicenseNumber,
                c.fName,
                c.lName,
                c.province,
                spend.totalSpent,
                spend.totalSales,
                td.recentTestDrives,
                ph.phoneNumber,
                lt.lastTestDriveAt,
                lt.lastVIN,
                ls.fName AS lastSalespersonFirstName,
                ls.lName AS lastSalespersonLastName,
                lv.make AS lastVehicleMake,
                lv.model AS lastVehicleModel,
                lv.trim AS lastVehicleTrim,
                lv.inventoryStatus AS lastVehicleStatus,
                'Engaged Tester' AS segment
            FROM Customer c
            JOIN (
                SELECT s.driverLicenseNumber, SUM(s.salePrice) AS totalSpent, COUNT(*) AS totalSales
                FROM Sale s
                GROUP BY s.driverLicenseNumber
            ) spend ON spend.driverLicenseNumber = c.driverLicenseNumber
            JOIN (
                SELECT td.driverLicenseNumber, COUNT(*) AS recentTestDrives
                FROM TestDrive td
                WHERE DATE(td.startTime) BETWEEN ? AND ?
                GROUP BY td.driverLicenseNumber
            ) td ON td.driverLicenseNumber = c.driverLicenseNumber
            LEFT JOIN (
                SELECT driverLicenseNumber, MIN(phoneNumber) AS phoneNumber
                FROM PhoneNumber
                GROUP BY driverLicenseNumber
            ) ph ON ph.driverLicenseNumber = c.driverLicenseNumber
            LEFT JOIN (
                SELECT driverLicenseNumber, startTime AS lastTestDriveAt, VIN AS lastVIN, SIN AS lastSIN, 
                       ROW_NUMBER() OVER (PARTITION BY driverLicenseNumber ORDER BY startTime DESC) AS rn
                FROM TestDrive
            ) lt ON lt.driverLicenseNumber = c.driverLicenseNumber AND lt.rn = 1
            LEFT JOIN Salesperson ls ON ls.SIN = lt.lastSIN
            LEFT JOIN Vehicle lv ON lv.VIN = lt.lastVIN
            WHERE NOT EXISTS (
                SELECT 1 FROM Sale s2 WHERE s2.driverLicenseNumber = c.driverLicenseNumber
                  AND DATE(s2.saleDate) BETWEEN ? AND ?
            )
            HAVING COALESCE(td.recentTestDrives, 0) >= ?
            
            ORDER BY segment DESC, totalSpent DESC, COALESCE(recentTestDrives, 0) DESC
            `,
            [spendThreshold, dateStart, dateEnd, minDrives, dateStart, dateEnd, dateStart, dateEnd, minDrives]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// update status (and optionally times) for an existing test drive
router.patch('/shiven/test-drives/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, startTime, endTime } = req.body;

        if (!status && !startTime && !endTime) {
            return res.status(400).json({ error: 'Provide status and/or startTime/endTime to update' });
        }

        const [existingRows] = await db.query(
            `SELECT VIN, startTime, endTime FROM TestDrive WHERE testDriveID = ?`,
            [id]
        );

        if (!existingRows.length) {
            return res.status(404).json({ error: 'Test drive not found' });
        }

        const existing = existingRows[0];
        const nextStart = startTime || existing.startTime;
        const nextEnd = endTime || existing.endTime;

        // only block overlaps when the new state is not cancelled
        const nextStatus = status || null;
        const blockOverlap = nextStatus ? nextStatus !== 'Cancelled' : true;

        if (blockOverlap) {
            const [conflicts] = await db.query(
                `SELECT 1
                 FROM TestDrive td
                 WHERE td.VIN = ?
                   AND td.testDriveID <> ?
                   AND td.testDriveStatus <> 'Cancelled'
                   AND (? < td.endTime AND ? > td.startTime)
                 LIMIT 1`,
                [existing.VIN, id, nextStart, nextEnd]
            );

            if (conflicts.length) {
                return res.status(409).json({ error: 'Updated time overlaps another active test drive for this vehicle' });
            }
        }

        const fields = [];
        const params = [];

        if (status) {
            fields.push('testDriveStatus = ?');
            params.push(status);
        }
        if (startTime) {
            fields.push('startTime = ?');
            params.push(startTime);
        }
        if (endTime) {
            fields.push('endTime = ?');
            params.push(endTime);
        }

        params.push(id);

        const [result] = await db.query(
            `UPDATE TestDrive
             SET ${fields.join(', ')}
             WHERE testDriveID = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Test drive not found' });
        }

        res.json({ message: 'Test drive updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
