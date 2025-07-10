const serverless = require('serverless-http');
const app = require('../src/app'); // Import your existing Express app

module.exports = serverless(app); // Wrap with serverless-http
