/* ============================================
   PACIENTES — Listar (admin, protegido)
   GET ?buscar=texto
   ============================================ */
const { query } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const buscar = (req.query?.buscar || '').trim();
    let pacientes;

    if (buscar) {
      const like = '%' + buscar + '%';
      pacientes = await query(
        'SELECT * FROM pacientes WHERE nombre LIKE ? OR telefono LIKE ? OR email LIKE ? ORDER BY nombre ASC LIMIT 50',
        [like, like, like]
      );
    } else {
      pacientes = await query('SELECT * FROM pacientes ORDER BY id DESC LIMIT 100');
    }

    // Formatear fecha
    pacientes.forEach(p => {
      if (p.ultima_visita) {
        const d = new Date(p.ultima_visita);
        p.ultima_visita_fmt = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } else {
        p.ultima_visita_fmt = '—';
      }
    });

    return res.status(200).json({ ok: true, pacientes });
  } catch (err) {
    console.error('Error listando pacientes:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
};
