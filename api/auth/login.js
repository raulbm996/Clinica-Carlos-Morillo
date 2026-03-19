/* ============================================
   AUTH — Login
   POST { username, password }
   ============================================ */
const bcrypt = require('bcryptjs');
const { query } = require('../lib/db');
const { createToken, setTokenCookie } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido.' });

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'Usuario y contraseña son obligatorios.' });
  }

  try {
    const rows = await query(
      'SELECT id, username, nombre, apellidos, email, password, rol, foto FROM usuarios WHERE username = ? LIMIT 1',
      [username.trim().toLowerCase()]
    );

    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos.' });
    }

    const token = createToken(user);
    res.setHeader('Set-Cookie', setTokenCookie(token));

    return res.status(200).json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol,
        foto: user.foto,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
};
