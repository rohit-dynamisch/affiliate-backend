const crypto = require('crypto');

const generateFingerprint = (req) => {
  const { 'user-agent': userAgent} = req.headers;
  const ip = req.ip || req.connection.remoteAddress;
  const fingerprint = crypto.createHash('sha256')
    .update(`${userAgent}:${ip}`)
    .digest('hex');
  console.log('Generated fingerprint:', fingerprint, 'Headers:', { userAgent, ip });
  return fingerprint;
};

module.exports = { generateFingerprint };