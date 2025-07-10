const express = require('express');
const cors = require('cors');
const linkRoutes = require('./routes/linkRoutes');
const debugRoutes = require('./routes/debugRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ No /api prefix
app.use(linkRoutes);
app.use(debugRoutes);

module.exports = app;
