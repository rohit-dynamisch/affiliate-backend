const express = require('express');
const router = express.Router();
const { createLink, handleLinkRedirect, checkDeferredLink, getAnalytics, getFingerprint } = require('../services/linkService');

router.post('/create-link', createLink);
router.get('/link/:linkId', handleLinkRedirect);
router.post('/check-deferred-link', checkDeferredLink);
router.get('/analytics/:linkId', getAnalytics);
router.get('/get-fingerprint', getFingerprint);
router.get('/test', (req, res) => {
  res.send('✅ Server is working');
});
module.exports = router;