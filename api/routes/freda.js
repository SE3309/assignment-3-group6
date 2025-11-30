const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Functionality 5: Find Unconverted Test Drives (Warm Leads)
// Returns customers that completed test drives but have not made a purchase (no sale on that VIN/customer combo)
router.get('/freda/unconverted-test-drives', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: 'startDate and endDate query parameters are required (format: YYYY-MM-DD)' 
            });
        }

        const query = `
            SELECT
                c.driverLicenseNumber,
                c.fName,
                c.lName,
                v.VIN,
                v.make,
                v.model,
                v.modelYear,
                td.testDriveID,
                td.startTime,
                td.endTime,
                GROUP_CONCAT(DISTINCT e.emailAddress ORDER BY e.emailAddress SEPARATOR ', ') as emails
            FROM TestDrive td
            INNER JOIN Customer c ON td.driverLicenseNumber = c.driverLicenseNumber
            INNER JOIN Vehicle v ON td.VIN = v.VIN
            LEFT JOIN Email e ON c.driverLicenseNumber = e.driverLicenseNumber
            WHERE td.testDriveStatus = 'Completed'
                AND DATE(td.startTime) BETWEEN ? AND ?
                AND NOT EXISTS (
                    SELECT 1 
                    FROM Sale s 
                    WHERE s.driverLicenseNumber = td.driverLicenseNumber 
                        AND s.VIN = td.VIN
                )
            GROUP BY c.driverLicenseNumber, c.fName, c.lName, v.VIN, v.make, v.model, v.modelYear, td.testDriveID, td.startTime, td.endTime
            ORDER BY td.startTime DESC, c.lName, c.fName
        `;

        const [results] = await db.query(query, [startDate, endDate]);

        res.json(results);
    } catch (error) {
        console.error('Error fetching unconverted test drives:', error);
        res.status(500).json({ error: error.message });
    }
});

// Functionality 6: Inventory & Pricing Analytics by Make/Model
// Returns aggregated statistics for each make/model of available vehicles
router.get('/freda/inventory-analytics', async (req, res) => {
    try {
        const { minCount, groupByModel } = req.query;
        const minCountNum = minCount ? parseInt(minCount) : 0;
        const groupByModelFlag = groupByModel === 'true' || groupByModel === '1';

        let query;
        let params = [];

        if (groupByModelFlag) {
            // Group by both make and model
            query = `
                SELECT 
                    v.make,
                    v.model,
                    COUNT(*) as vehicleCount,
                    MIN(v.basePrice) as minPrice,
                    MAX(v.basePrice) as maxPrice,
                    ROUND(AVG(v.basePrice)) as avgPrice,
                    ROUND(AVG(v.mileage)) as avgMileage,
                    MIN(v.mileage) as minMileage,
                    MAX(v.mileage) as maxMileage
                FROM Vehicle v
                WHERE v.inventoryStatus = 'Available'
                GROUP BY v.make, v.model
                HAVING COUNT(*) >= ?
                ORDER BY v.make, v.model, COUNT(*) DESC
            `;
            params = [minCountNum];
        } else {
            // Group by make only
            query = `
                SELECT 
                    v.make,
                    NULL as model,
                    COUNT(*) as vehicleCount,
                    MIN(v.basePrice) as minPrice,
                    MAX(v.basePrice) as maxPrice,
                    ROUND(AVG(v.basePrice)) as avgPrice,
                    ROUND(AVG(v.mileage)) as avgMileage,
                    MIN(v.mileage) as minMileage,
                    MAX(v.mileage) as maxMileage
                FROM Vehicle v
                WHERE v.inventoryStatus = 'Available'
                GROUP BY v.make
                HAVING COUNT(*) >= ?
                ORDER BY v.make, COUNT(*) DESC
            `;
            params = [minCountNum];
        }

        const [results] = await db.query(query, params);

        res.json(results);
    } catch (error) {
        console.error('Error fetching inventory analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

// Functionality 6: Drill-down endpoint - Get available vehicles for a specific make/model
router.get('/freda/inventory-analytics/details', async (req, res) => {
    try {
        const { make, model } = req.query;

        if (!make) {
            return res.status(400).json({ 
                error: 'make query parameter is required' 
            });
        }

        let query;
        let params;

        if (model) {
            query = `
                SELECT 
                    VIN,
                    stockNumber,
                    modelYear,
                    make,
                    model,
                    trim,
                    mileage,
                    colour,
                    inventoryStatus,
                    basePrice,
                    acquisitionCost
                FROM Vehicle
                WHERE make = ? AND model = ? AND inventoryStatus = 'Available'
                ORDER BY basePrice ASC, mileage ASC
            `;
            params = [make, model];
        } else {
            query = `
                SELECT 
                    VIN,
                    stockNumber,
                    modelYear,
                    make,
                    model,
                    trim,
                    mileage,
                    colour,
                    inventoryStatus,
                    basePrice,
                    acquisitionCost
                FROM Vehicle
                WHERE make = ? AND inventoryStatus = 'Available'
                ORDER BY model, basePrice ASC, mileage ASC
            `;
            params = [make];
        }

        const [results] = await db.query(query, params);

        res.json(results);
    } catch (error) {
        console.error('Error fetching inventory details:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;