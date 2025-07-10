const express = require('express');
const linkRoutes = require('./routes/linkRoutes');
const debugRoutes = require('./routes/debugRoutes');
const { config } = require('./config/config');
const cors = require('cors'); // 👈 import cors

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use(linkRoutes);
app.use(debugRoutes);

module.exports = app;