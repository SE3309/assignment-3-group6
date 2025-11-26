const express = require('express');
const router = express.Router();
const db = require('../config/database');

// creating a customer
router.post('/create-customer', async (req, res) => {
    try {
        const { driverLicenseNumber, fName, lName, street, city, province, 
                postalCode, birthday, eFlag, tFlag, pFlag } = req.body;

        await db.query(
            `INSERT INTO Customer VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [driverLicenseNumber, fName, lName, street, city, province, postalCode, 
            birthday, eFlag || false, tFlag || false, pFlag || false]
        );

        res.status(201).json({ message: 'Customer created', driverLicenseNumber });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// getting top 10 customers with most purchases
router.get('/customers', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM Customer  LIMIT 10');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;