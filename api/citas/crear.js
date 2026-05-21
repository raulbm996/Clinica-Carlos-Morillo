const { query } = require('../../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido.' });

  const { paciente_nombre, telefono, servicio, fecha, hora, mensaje } = req.body || {};
  const errors = [];
  if (!paciente_nombre || !paciente_nombre.trim()) errors.push('El nombre es obligatorio.');
  if (!telefono || !telefono.trim()) errors.push('El teléfono es obligatorio.');
  if (!servicio || !servicio.trim()) errors.push('El servicio es obligatorio.');
  if (!fecha) errors.push('La fecha es obligatoria.');
  if (!hora) errors.push('La hora es obligatoria.');

  if (errors.length) return res.status(400).json({ ok: false, errors });

  try {
    // Evitar solapamientos: si ya existe una cita en la misma fecha y hora con estado pendiente/confirmada
    const conflict = await query('SELECT COUNT(*) as cnt FROM citas WHERE fecha = ? AND hora = ? AND estado IN ("pendiente","confirmada")', [fecha, hora]);
    if (conflict[0] && conflict[0].cnt > 0) {
      return res.status(409).json({ ok: false, error: 'La hora seleccionada ya está ocupada. Elige otra hora.' });
    }

    const result = await query('INSERT INTO citas (paciente_nombre, telefono, servicio, fecha, hora, mensaje, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [paciente_nombre.trim(), telefono.trim(), servicio.trim(), fecha, hora, mensaje || '', 'pendiente']
    );

    return res.status(200).json({ ok: true, message: 'Cita solicitada correctamente.', id: result.insertId });
  } catch (err) {
    console.error('Error creando cita:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
};
