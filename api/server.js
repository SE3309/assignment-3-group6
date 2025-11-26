const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;


//  middleware


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const db = require('./config/database');

// import routes
const robert = require('./routes/robert');
const shiven = require('./routes/shiven');
const freda = require('./routes/freda');
const caroline = require('./routes/caroline');
const arjun = require('./routes/arjun');

// call routes
app.use('/api', robert);
app.use('/api', shiven);
app.use('/api', freda);
app.use('/api', caroline);
app.use('/api', arjun);

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});