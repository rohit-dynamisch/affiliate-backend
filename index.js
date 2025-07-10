// index.js - Single-file Affiliate Backend for Vercel

const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

// In-memory storage
const links = new Map();
const sessions = new Map();

// Config
const sessionTTL = 24 * 60 * 60 * 1000; // 24 hours

// Helpers
const generateFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  return crypto.createHash('sha256').update(`${userAgent}:${ip}`).digest('hex');
};

const getBaseUrl = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${protocol}://${host}`;
};

const generateHtmlResponse = (appUrl, fallbackUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Opening App...</title>
  <style>
    body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; margin: 0; }
    .container { max-width: 400px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .loading { margin: 20px 0; font-size: 18px; color: #666; }
    .fallback-link { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    .fallback-link:hover { background: #0056b3; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Opening App...</h2>
    <div class="loading">Redirecting to the app...</div>
    ${fallbackUrl ? `<a href="${fallbackUrl}" class="fallback-link">Open in Browser</a>` : ''}
  </div>
  <script>
    try { window.location.href = "${appUrl}"; } catch(e) {}
    setTimeout(function() {
      ${fallbackUrl ? `window.location.href = "${fallbackUrl}";` : ''}
    }, 3000);
  </script>
</body>
</html>
`;

// Routes
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
      'POST /debug/clear-data': 'Debug: Clear all data',
      'GET /test': 'Test endpoint'
    }
  });
});

app.get('/test', (req, res) => {
  res.json({ message: '✅ Server is working', timestamp: new Date().toISOString() });
});

app.post('/create-link', (req, res) => {
  const { originalUrl, appScheme, fallbackUrl, campaign, source, medium, customData } = req.body;
  if (!originalUrl || !appScheme) return res.status(400).json({ error: 'originalUrl and appScheme are required' });

  const linkId = crypto.randomBytes(16).toString('hex');
  links.set(linkId, {
    originalUrl,
    appScheme,
    fallbackUrl,
    campaign,
    source,
    medium,
    customData,
    clicks: 0,
    installs: 0,
    createdAt: new Date()
  });

  const baseUrl = getBaseUrl(req);
  res.json({ linkId, trackableUrl: `${baseUrl}/link/${linkId}`, originalUrl, appScheme });
});

app.get('/link/:linkId', (req, res) => {
  const link = links.get(req.params.linkId);
  if (!link) return res.status(404).json({ error: 'Link not found' });

  link.clicks += 1;

  const fingerprint = generateFingerprint(req);
  const appUrl = `${link.appScheme}://open?url=${encodeURIComponent(link.originalUrl)}&campaign=${encodeURIComponent(link.campaign || '')}&source=${encodeURIComponent(link.source || '')}&medium=${encodeURIComponent(link.medium || '')}&linkId=${req.params.linkId}`;
  sessions.set(fingerprint, { linkId: req.params.linkId, data: link, timestamp: Date.now() });

  res.send(generateHtmlResponse(appUrl, link.fallbackUrl));
});

app.post('/check-deferred-link', (req, res) => {
  const { customFingerprint } = req.body;
  const fingerprint = customFingerprint || generateFingerprint(req);
  const session = sessions.get(fingerprint);

  if (session && Date.now() - session.timestamp < sessionTTL) {
    sessions.delete(fingerprint);
    if (links.has(session.linkId)) links.get(session.linkId).installs += 1;
    return res.json({ hasDeepLink: true, deepLinkData: session.data, timestamp: new Date() });
  }
  res.json({ hasDeepLink: false });
});

app.get('/analytics/:linkId', (req, res) => {
  const link = links.get(req.params.linkId);
  if (!link) return res.status(404).json({ error: 'Link not found' });

  res.json({
    linkId: req.params.linkId,
    clicks: link.clicks,
    installs: link.installs,
    conversionRate: link.clicks > 0 ? ((link.installs / link.clicks) * 100).toFixed(2) : '0.00',
    createdAt: link.createdAt,
  });
});

app.get('/get-fingerprint', (req, res) => {
  const fingerprint = generateFingerprint(req);
  res.json({ fingerprint });
});

app.get('/debug/links', (req, res) => {
  res.json(Array.from(links.entries()).map(([id, data]) => ({ id, ...data })));
});

app.post('/debug/clear-data', (req, res) => {
  links.clear();
  sessions.clear();
  res.json({ message: 'All data cleared' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path, method: req.method });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Export handler for Vercel
module.exports = serverless(app);
