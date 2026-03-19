/* ============================================
   USUARIO — Cambiar contraseña (protegido)
   POST { current_password, new_password }
   ============================================ */
const bcrypt = require('bcryptjs');
const { query } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido.' });

  const user = requireAuth(req, res);
  if (!user) return;

  const { current_password, new_password } = req.body || {};

  if (!current_password || !new_password) {
    return res.status(400).json({ ok: false, error: 'Ambos campos son obligatorios.' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const rows = await query('SELECT password FROM usuarios WHERE id = ?', [user.id]);
    const row = rows[0];

    if (!row || !bcrypt.compareSync(current_password, row.password)) {
      return res.status(400).json({ ok: false, error: 'La contraseña actual no es correcta.' });
    }

    const hash = bcrypt.hashSync(new_password, 10);
    await query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, user.id]);

    return res.status(200).json({ ok: true, message: 'Contraseña cambiada correctamente.' });
  } catch (err) {
    console.error('Error cambiando contraseña:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
};
