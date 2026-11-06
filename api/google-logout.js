const { origin, cookie, json } = require('./_lib');

module.exports = (req, res) => {
  if (req.method !== 'POST' || req.headers.origin !== origin(req)) return json(res, 403, { error: 'forbidden' });
  res.setHeader('Set-Cookie', cookie('pecunia_rt', '', 0));
  return json(res, 200, { ok: true });
};
