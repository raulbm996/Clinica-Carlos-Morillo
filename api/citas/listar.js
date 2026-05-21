const { query } = require('../../lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Método no permitido.' });

    try {
        const { fecha_inicio, fecha_fin, telefono, paciente_id, paciente_nombre } = req.query || {};
        let rows;
        if (telefono) {
            rows = await query('SELECT * FROM citas WHERE telefono = ? ORDER BY fecha ASC, hora ASC', [telefono]);
        } else if (paciente_id) {
            // buscar por paciente_id -> necesitamos la ficha para obtener nombre completo
            const p = await query('SELECT nombre, apellidos FROM pacientes WHERE id = ? LIMIT 1', [paciente_id]);
            if (p && p.length > 0) {
                const full = (p[0].nombre + ' ' + (p[0].apellidos || '')).trim();
                rows = await query('SELECT * FROM citas WHERE paciente_nombre = ? ORDER BY fecha ASC, hora ASC', [full]);
            } else {
                rows = [];
            }
        } else if (paciente_nombre) {
            rows = await query('SELECT * FROM citas WHERE paciente_nombre LIKE ? ORDER BY fecha ASC, hora ASC', ['%' + paciente_nombre + '%']);
        } else if (fecha_inicio && fecha_fin) {
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
