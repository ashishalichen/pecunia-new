const crypto = require('crypto');
const { SCOPE, configured, origin, cookie } = require('./_lib');

// Step 1: send the browser to Google. access_type=offline + prompt=consent guarantees a refresh token.
module.exports = (req, res) => {
  if (!configured()) {
    res.statusCode = 500;
    return res.end('Server not configured: set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and COOKIE_SECRET in Vercel.');
  }
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: origin(req) + '/api/google-callback',
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent select_account',
    include_granted_scopes: 'true',
    state,
  });
  res.setHeader('Set-Cookie', cookie('pecunia_state', state, 600));
  res.writeHead(302, { Location: 'https://accounts.google.com/o/oauth2/v2/auth?' + params });
  res.end();
};
