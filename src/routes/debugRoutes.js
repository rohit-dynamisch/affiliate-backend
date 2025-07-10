// File: src/routes/debugRoutes.js
const express = require('express');
const router = express.Router();
const { debugLinks, debugClearData } = require('../services/linkService');

router.get('/debug/links', debugLinks);
router.post('/debug/clear-data', debugClearData);

module.exports = router;