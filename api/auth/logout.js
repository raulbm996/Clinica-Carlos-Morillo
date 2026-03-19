/* ============================================
   AUTH — Logout
   POST → borra cookie JWT
   ============================================ */
const { clearTokenCookie } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  res.setHeader('Set-Cookie', clearTokenCookie());
  return res.status(200).json({ ok: true });
};
