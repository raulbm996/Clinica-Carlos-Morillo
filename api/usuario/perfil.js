/* ============================================
   USUARIO — Guardar perfil (protegido)
   POST { nombre, apellidos, email }
   ============================================ */
const { query } = require('../lib/db');
const { requireAuth, createToken, setTokenCookie } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido.' });

  const user = requireAuth(req, res);
  if (!user) return;

  const { nombre, apellidos, email } = req.body || {};

  if (!nombre || nombre.trim().length < 3) {
    return res.status(400).json({ ok: false, error: 'El nombre debe tener al menos 3 letras.' });
  }

  try {
    await query(
      'UPDATE usuarios SET nombre = ?, apellidos = ?, email = ? WHERE id = ?',
      [nombre.trim(), (apellidos || '').trim(), (email || '').trim(), user.id]
    );

    // Emitir un nuevo JWT con los datos actualizados
    const updatedUser = {
      id: user.id,
      username: user.username,
      nombre: nombre.trim(),
      apellidos: (apellidos || '').trim(),
      email: (email || '').trim(),
      rol: user.rol,
    };
    const newToken = createToken(updatedUser);
    res.setHeader('Set-Cookie', setTokenCookie(newToken));

    return res.status(200).json({ ok: true, message: 'Perfil guardado correctamente.' });
  } catch (err) {
    console.error('Error guardando perfil:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
};
