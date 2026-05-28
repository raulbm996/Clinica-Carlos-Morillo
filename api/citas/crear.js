const { query } = require('../../lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido.' });

    const { paciente_nombre, telefono, servicio, fecha, hora, mensaje, usuario_id } = req.body || {};
    const errors = [];
    if (!paciente_nombre || !paciente_nombre.trim()) errors.push('El nombre es obligatorio.');
    if (!telefono || !telefono.trim()) errors.push('El teléfono es obligatorio.');
    if (!servicio || !servicio.trim()) errors.push('El servicio es obligatorio.');
    if (!fecha) errors.push('La fecha es obligatoria.');
    if (!hora) errors.push('La hora es obligatoria.');

    if (errors.length) return res.status(400).json({ ok: false, errors });

    try {
        // Buscar paciente por teléfono; si no existe, crear ficha mínima
        const tel = telefono.trim();
        const existing = await query('SELECT id FROM pacientes WHERE telefono = ? LIMIT 1', [tel]);
        let pacienteId = null;
        if (!existing || existing.length === 0) {
            try {
                const r = await query('INSERT INTO pacientes (nombre, telefono, ultima_visita) VALUES (?, ?, ?)', [paciente_nombre.trim(), tel, fecha]);
                pacienteId = r.insertId;
            } catch (e) {
                console.warn('No se pudo crear paciente automáticamente:', e);
                pacienteId = null;
            }
        } else {
            pacienteId = existing[0].id;
        }

        const result = await query('INSERT INTO citas (paciente_nombre, telefono, servicio, fecha, hora, mensaje, estado, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [paciente_nombre.trim(), tel, servicio.trim(), fecha, hora, mensaje || '', 'confirmada', usuario_id || null]
        );

        return res.status(200).json({ ok: true, message: 'Cita confirmada correctamente.', id: result.insertId, pacienteId });
    } catch (err) {
        console.error('Error creando cita:', err);
        return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
    }
};
