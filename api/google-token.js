const { configured, origin, open, cookies, cookie, json } = require('./_lib');

// Called by the app on every launch: trades the stored refresh token for a fresh 1-hour access token.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'method' });
  if (!configured()) return json(res, 500, { error: 'not_configured' });
  if (req.headers.origin !== origin(req)) return json(res, 403, { error: 'origin' });

  const sealed = cookies(req).pecunia_rt;
  const refresh = sealed && open(sealed);
  if (!refresh) return json(res, 401, { error: 'signin' });

  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refresh,
        grant_type: 'refresh_token',
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      if (j.error === 'invalid_grant') {
        res.setHeader('Set-Cookie', cookie('pecunia_rt', '', 0));
        return json(res, 401, { error: 'signin' });
      }
      return json(res, 502, { error: j.error || 'google' });
    }
    return json(res, 200, { access_token: j.access_token, expires_in: j.expires_in });
  } catch (e) {
    return json(res, 502, { error: 'network' });
  }
};
