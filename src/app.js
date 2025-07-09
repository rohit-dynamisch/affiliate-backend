const express = require('express');
const linkRoutes = require('./routes/linkRoutes');
const debugRoutes = require('./routes/debugRoutes');
const { config } = require('./config/config');
const cors = require('cors'); // 👈 import cors

const app = express();
app.use(cors({
  origin: '*', // 👈 React app's URL
  methods: ['GET', 'POST'],        // Allowed methods
  credentials: true                // If you're sending cookies or auth headers
}));
app.use(express.json());

// Mount routes
app.use('/api', linkRoutes);
app.use('/api', debugRoutes);

module.exports = app;