/* ============================================
   CITAS — Handler único para crear, listar y actualizar
   ============================================ */
const { query } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    // --- CREAR CITA (público) ---
    if (req.method === 'POST' && !req.body?.id && !req.body?.estado) {
        const { paciente_nombre, telefono, servicio, fecha, hora, mensaje } = req.body || {};
        const errors = [];
        if (!paciente_nombre?.trim()) errors.push('El nombre es obligatorio.');
        if (!telefono?.trim()) errors.push('El teléfono es obligatorio.');
        if (!servicio?.trim()) errors.push('Selecciona un servicio.');
        if (!fecha?.trim()) errors.push('La fecha es obligatoria.');
        if (!hora?.trim()) errors.push('La hora es obligatoria.');
        if (errors.length > 0) {
            return res.status(400).json({ ok: false, errors });
        }
        try {
            const result = await query(
                'INSERT INTO citas (paciente_nombre, telefono, servicio, fecha, hora, mensaje, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [paciente_nombre.trim(), telefono.trim(), servicio.trim(), fecha.trim(), hora.trim(), (mensaje || '').trim(), 'pendiente']
            );
            return res.status(200).json({
                ok: true,
                message: 'Cita solicitada correctamente. Nos pondremos en contacto contigo para confirmarla.',
                id: result.insertId,
            });
        } catch (err) {
            console.error('Error creando cita:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    // --- ACTUALIZAR ESTADO CITA (admin, protegido) ---
    if (req.method === 'POST' && req.body?.id && req.body?.estado) {
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
    }

    // --- LISTAR CITAS (admin, protegido) ---
    if (req.method === 'GET') {
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
    }

    // --- MÉTODO NO PERMITIDO ---
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
};
