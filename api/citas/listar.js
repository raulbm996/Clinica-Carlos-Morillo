/* ============================================
   CITAS — Listar (admin, protegido)
   GET ?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
   ============================================ */
const { query } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const { fecha_inicio, fecha_fin } = req.query || {};
    let citas;

    if (fecha_inicio && fecha_fin) {
      citas = await query(
        'SELECT * FROM citas WHERE fecha BETWEEN ? AND ? ORDER BY fecha ASC, hora ASC',
        [fecha_inicio, fecha_fin]
      );
    } else {
      citas = await query('SELECT * FROM citas ORDER BY fecha DESC, hora ASC LIMIT 100');
    }

    return res.status(200).json({ ok: true, citas });
  } catch (err) {
    console.error('Error listando citas:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
};
