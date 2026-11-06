const { configured, origin, seal, cookies, cookie } = require('./_lib');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Step 2: Google sends the user back here with a one-time code. Exchange it, keep the refresh token encrypted.
module.exports = async (req, res) => {
  try {
    if (!configured()) throw new Error('Server is not configured.');
    const url = new URL(req.url, origin(req));
    if (url.searchParams.get('error')) throw new Error(url.searchParams.get('error'));
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || !state || state !== cookies(req).pecunia_state) throw new Error('Invalid sign-in state. Please try again.');

    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: origin(req) + '/api/google-callback',
        grant_type: 'authorization_code',
      }),
    });
    const j = await r.json();
    if (!r.ok || !j.refresh_token) {
      throw new Error(j.error_description || 'Google did not return a refresh token. Remove PECUNIA at myaccount.google.com/permissions and try again.');
    }
    res.setHeader('Set-Cookie', [cookie('pecunia_rt', seal(j.refresh_token), 60 * 60 * 24 * 365), cookie('pecunia_state', '', 0)]);
    res.writeHead(302, { Location: '/' });
    res.end();
  } catch (e) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<body style="background:#0A0B0E;color:#F8FAFC;font-family:system-ui;padding:32px"><h3>Sign-in failed</h3><p style="color:#94A3B8">${esc(e.message)}</p><a style="color:#FFB599" href="/">Back to PECUNIA</a></body>`);
  }
};
