// const crypto = require('crypto');

// const generateFingerprint = (req) => {
//   const { 'user-agent': userAgent} = req.headers;
//   const ip = req.ip || req.connection.remoteAddress;
//   const fingerprint = crypto.createHash('sha256')
//     .update(`${userAgent}:${ip}`)
//     .digest('hex');
//   console.log('Generated fingerprint:', fingerprint, 'Headers:', { userAgent, ip });
//   return fingerprint;
// };

// module.exports = { generateFingerprint };

const crypto = require('crypto');

const generateFingerprint = (req) => {
  const { 'user-agent': userAgent = 'unknown' } = req.headers;
  const ip = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  
  const fingerprint = crypto.createHash('sha256')
    .update(`${userAgent}:${ip}`)
    .digest('hex');
  
  console.log('Generated fingerprint:', fingerprint, 'Headers:', { userAgent, ip });
  return fingerprint;
};

module.exports = { generateFingerprint };