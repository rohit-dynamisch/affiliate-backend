// File: src/app.js


// const express = require('express');
// const cors = require('cors');
// const linkRoutes = require('./routes/linkRoutes');
// const debugRoutes = require('./routes/debugRoutes');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ No /api prefix
// app.use(linkRoutes);
// app.use(debugRoutes);

// module.exports = app;
const express = require('express');
const cors = require('cors');
const linkRoutes = require('./routes/linkRoutes');
const debugRoutes = require('./routes/debugRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Trust proxy for proper IP detection on Vercel
app.set('trust proxy', true);

// Root route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Affiliate Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /create-link': 'Create a new affiliate link',
      'GET /link/:linkId': 'Handle link redirect',
      'POST /check-deferred-link': 'Check for deferred deep link',
      'GET /analytics/:linkId': 'Get link analytics',
      'GET /get-fingerprint': 'Get device fingerprint',
      'GET /debug/links': 'Debug: List all links',
      'POST /debug/clear-data': 'Debug: Clear all data'
    }
  });
});


// API routes
app.use(linkRoutes);
app.use(debugRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message
  });
});

module.exports = app;