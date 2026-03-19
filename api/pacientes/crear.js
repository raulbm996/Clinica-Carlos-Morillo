/* ============================================
   PACIENTES — Crear (admin, protegido)
   POST { nombre, telefono, email?, fecha_nacimiento?, notas? }
   ============================================ */
const { query } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido.' });

  const user = requireAuth(req, res);
  if (!user) return;

  const { nombre, telefono, email, fecha_nacimiento, notas } = req.body || {};

  if (!nombre?.trim()) {
    return res.status(400).json({ ok: false, error: 'El nombre es obligatorio.' });
  }

  try {
    const result = await query(
      'INSERT INTO pacientes (nombre, telefono, email, fecha_nacimiento, notas) VALUES (?, ?, ?, ?, ?)',
      [nombre.trim(), (telefono || '').trim(), (email || '').trim(), fecha_nacimiento || null, notas || null]
    );

    return res.status(200).json({
      ok: true,
      message: 'Paciente creado correctamente.',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Error creando paciente:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
};
