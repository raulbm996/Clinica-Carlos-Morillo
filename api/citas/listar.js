const { query } = require('../../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Método no permitido.' });

  try {
    const { fecha_inicio, fecha_fin } = req.query || {};
    let rows;
    if (fecha_inicio && fecha_fin) {
      rows = await query('SELECT * FROM citas WHERE fecha BETWEEN ? AND ? ORDER BY fecha ASC, hora ASC', [fecha_inicio, fecha_fin]);
    } else {
      rows = await query('SELECT * FROM citas ORDER BY fecha DESC, hora ASC LIMIT 200');
    }
    return res.status(200).json({ ok: true, citas: rows });
  } catch (err) {
    console.error('Error listando citas:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
};
