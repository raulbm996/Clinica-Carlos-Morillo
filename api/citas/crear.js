/* ============================================
   CITAS — Crear (público)
   POST { paciente_nombre, telefono, servicio, fecha, hora, mensaje? }
   ============================================ */
const { query } = require('../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido.' });

  const { paciente_nombre, telefono, servicio, fecha, hora, mensaje } = req.body || {};

  const errors = [];
  if (!paciente_nombre?.trim()) errors.push('El nombre es obligatorio.');
  if (!telefono?.trim())        errors.push('El teléfono es obligatorio.');
  if (!servicio?.trim())        errors.push('Selecciona un servicio.');
  if (!fecha?.trim())           errors.push('La fecha es obligatoria.');
  if (!hora?.trim())            errors.push('La hora es obligatoria.');

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
};
