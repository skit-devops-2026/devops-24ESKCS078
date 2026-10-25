require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const client = require('prom-client');

// Prometheus monitoring
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

app.use(express.json({ limit: '5mb' }));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/routines', require('./routes/routines'));
app.use('/api/checkins', require('./routes/checkins'));
app.use('/api/completions', require('./routes/completions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/data', require('./routes/data'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Required by the README: returns the commit SHA this build was made from
app.get('/health', (req, res) => {
  res.json({ status: 'ok', commit: process.env.GIT_SHA || 'unknown' });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);

  if (err.code === 11000) {
    return res.status(409).json({
      message: 'This record already exists. Edit the existing one instead.'
    });
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid data was sent to the server'
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Server error'
  });
});

// Export the app so tests can call it without starting the server
module.exports = app;

// Only connect to the database and listen when run directly (node server.js)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}
