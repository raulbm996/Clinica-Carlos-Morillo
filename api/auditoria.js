/* ============================================
   AUDITORIA — Endpoint para consultar registro_auditoria
   ============================================ */
const { query } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = requireAuth(req, res);
    if (!user) return;

    if (req.method === 'GET') {
        try {
            const { pacienteId, usuarioId, accion, desde, hasta } = req.query || {};
            let page = parseInt(req.query.page || '1', 10);
            let perPage = parseInt(req.query.perPage || '50', 10);
            if (isNaN(page) || page < 1) page = 1;
            if (isNaN(perPage) || perPage < 1 || perPage > 1000) perPage = 50;

            const where = [];
            const params = [];
            if (pacienteId) {
                where.push('paciente_id = ?');
                params.push(pacienteId);
            }
            if (usuarioId) {
                where.push('usuario_id = ?');
                params.push(usuarioId);
            }
            if (accion) {
                where.push('accion = ?');
                params.push(accion);
            }
            if (desde) {
                where.push('created_at >= ?');
                params.push(desde);
            }
            if (hasta) {
                where.push('created_at <= ?');
                params.push(hasta);
            }

            const whereSql = where.length ? ('WHERE ' + where.join(' AND ')) : '';

            // total count
            const countRows = await query(`SELECT COUNT(*) as cnt FROM registro_auditoria ${whereSql}`, params);
            const total = countRows[0]?.cnt || 0;
            const totalPages = Math.max(1, Math.ceil(total / perPage));
            if (page > totalPages) page = totalPages;

            const offset = (page - 1) * perPage;
            const rows = await query(
                `SELECT * FROM registro_auditoria ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
                params.concat([perPage, offset])
            );

            return res.status(200).json({ ok: true, registros: rows, pagination: { page, perPage, total, totalPages } });
        } catch (err) {
            console.error('Error consultando auditoría:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
};
