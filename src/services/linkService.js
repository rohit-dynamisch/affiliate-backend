const crypto = require('crypto');
const { generateFingerprint } = require('../middleware/deviceFingerprint');
const { generateHtmlResponse } = require('../utils/htmlTemplate');
const { saveSession, getSession, deleteSession } = require('./sessionService');
const { config } = require('../config/config');

// In-memory link storage (replace with database if needed)
const links = new Map();

const createLink = (req, res) => {
  const { originalUrl, appScheme, fallbackUrl, campaign, source, medium, customData } = req.body;
  if (!originalUrl || !appScheme) {
    return res.status(400).json({ error: 'originalUrl and appScheme are required' });
  }
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
    createdAt: new Date(),
  });
  res.json({ linkId, trackableUrl: `http://localhost:${process.env.PORT || 3000}/api/link/${linkId}`, originalUrl, appScheme });
};

const handleLinkRedirect = (req, res) => {
  const link = links.get(req.params.linkId);
  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }
  link.clicks += 1;
  const fingerprint = generateFingerprint(req);
  const appUrl = `${link.appScheme}://open?url=${encodeURIComponent(link.originalUrl)}&campaign=${encodeURIComponent(link.campaign || '')}&source=${encodeURIComponent(link.source || '')}&medium=${encodeURIComponent(link.medium || '')}&linkId=${req.params.linkId}`;
  saveSession(fingerprint, { linkId: req.params.linkId, data: link, timestamp: Date.now() });
  res.send(generateHtmlResponse(appUrl, link.fallbackUrl));
};

const checkDeferredLink = (req, res) => {
  const { customFingerprint } = req.body;
  const fingerprint = customFingerprint || generateFingerprint(req);
  const session = getSession(fingerprint);
  if (session && Date.now() - session.timestamp < config.sessionTTL) {
    deleteSession(fingerprint);
    links.get(session.linkId).installs += 1;
    return res.json({ hasDeepLink: true, deepLinkData: session.data, timestamp: new Date() });
  }
  return res.json({ hasDeepLink: false });
};

const getAnalytics = (req, res) => {
  const link = links.get(req.params.linkId);
  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }
  res.json({
    linkId: req.params.linkId,
    clicks: link.clicks,
    installs: link.installs,
    conversionRate: link.clicks > 0 ? ((link.installs / link.clicks) * 100).toFixed(2) : '0.00',
    createdAt: link.createdAt,
  });
};

const getFingerprint = (req, res) => {
  const fingerprint = generateFingerprint(req);
  res.json({ fingerprint });
};

const debugLinks = (req, res) => {
  res.json(Array.from(links.entries()).map(([id, data]) => ({ id, ...data })));
};

const debugClearData = (req, res) => {
  links.clear();
  require('./sessionService').clearSessions();
  res.json({ message: 'All data cleared' });
};

module.exports = {
  createLink,
  handleLinkRedirect,
  checkDeferredLink,
  getAnalytics,
  getFingerprint,
  debugLinks,
  debugClearData,
};

