/* ============================================
   AUTH — Session check
   GET → devuelve datos del usuario FRESCOS de la BD
   ============================================ */
const { query } = require('../lib/db');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verificar que existe un JWT válido
  let tokenData;
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies['clinica_token'];
    if (!token) return res.status(401).json({ ok: false, error: 'No autenticado.' });
    tokenData = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
  } catch {
    return res.status(401).json({ ok: false, error: 'Sesión expirada.' });
  }

  // Leer datos FRESCOS de la base de datos
  try {
    const rows = await query(
      'SELECT id, username, nombre, apellidos, email, rol, foto FROM usuarios WHERE id = ? LIMIT 1',
      [tokenData.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, error: 'Usuario no encontrado.' });
    }

    const user = rows[0];
    return res.status(200).json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        apellidos: user.apellidos || '',
        email: user.email || '',
        rol: user.rol,
        foto: user.foto || null,
      },
    });
  } catch (err) {
    console.error('Session DB error:', err);
    return res.status(500).json({ ok: false, error: 'Error interno.' });
  }
};
