// File: src/config/config.js
const config = {
  port: process.env.PORT || 3000,
  sessionTTL: 24 * 60 * 60 * 1000, // 24 hours
};

module.exports = { config };