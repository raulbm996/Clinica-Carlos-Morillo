/* ============================================
   CITAS — Actualizar estado (admin, protegido)
   POST { id, estado }
   ============================================ */
const { query } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido.' });

  const user = requireAuth(req, res);
  if (!user) return;

  const { id, estado } = req.body || {};
  const validStates = ['pendiente', 'confirmada', 'cancelada'];

  if (!id || !validStates.includes(estado)) {
    return res.status(400).json({ ok: false, error: 'ID o estado no válido.' });
  }

  try {
    const result = await query('UPDATE citas SET estado = ? WHERE id = ?', [estado, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'Cita no encontrada.' });
    }

    return res.status(200).json({ ok: true, message: 'Estado actualizado a ' + estado + '.' });
  } catch (err) {
    console.error('Error actualizando cita:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
};
