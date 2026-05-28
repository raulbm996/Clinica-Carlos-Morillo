/* ============================================
   OBSERVACIONES — CRUD para observaciones de paciente
   ============================================ */
const { query } = require('../lib/db');
const { requireAuth } = require('../lib/auth');

// Auto-create table if it doesn't exist
let tableChecked = false;
async function ensureTable() {
    if (tableChecked) return;
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS observaciones_paciente (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                paciente_id     INT NOT NULL,
                usuario_id      INT DEFAULT NULL,
                usuario_nombre  VARCHAR(150) NOT NULL DEFAULT '',
                contenido       TEXT NOT NULL,
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
            ) ENGINE=InnoDB;
        `);
        tableChecked = true;
    } catch (err) {
        console.warn('Auto-create observaciones_paciente:', err.message);
        tableChecked = true; // Don't retry on every request
    }
}

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    await ensureTable();

    // --- LISTAR OBSERVACIONES (GET, admin protegido) ---
    if (req.method === 'GET') {
        const user = requireAuth(req, res);
        if (!user) return;

        const pacienteId = req.query?.paciente_id;
        if (!pacienteId) {
            return res.status(400).json({ ok: false, error: 'paciente_id es obligatorio.' });
        }

        try {
            const observaciones = await query(
                `SELECT * FROM observaciones_paciente 
                 WHERE paciente_id = ? 
                 ORDER BY created_at DESC`,
                [pacienteId]
            );
            return res.status(200).json({ ok: true, observaciones });
        } catch (err) {
            console.error('Error listando observaciones:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    // --- CREAR OBSERVACIÓN (POST, admin protegido) ---
    if (req.method === 'POST') {
        const user = requireAuth(req, res);
        if (!user) return;

        const { paciente_id, contenido } = req.body || {};

        if (!paciente_id) {
            return res.status(400).json({ ok: false, error: 'paciente_id es obligatorio.' });
        }
        if (!contenido?.trim()) {
            return res.status(400).json({ ok: false, error: 'El contenido de la observación es obligatorio.' });
        }

        try {
            const usuarioNombre = ((user.nombre || '') + ' ' + (user.apellidos || '')).trim();

            const result = await query(
                `INSERT INTO observaciones_paciente (paciente_id, usuario_id, usuario_nombre, contenido) 
                 VALUES (?, ?, ?, ?)`,
                [paciente_id, user.id, usuarioNombre, contenido.trim()]
            );

            // Registrar en auditoría
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            const pRows = await query('SELECT nombre, apellidos FROM pacientes WHERE id = ? LIMIT 1', [paciente_id]);
            const pNombre = pRows.length > 0 ? ((pRows[0].nombre || '') + ' ' + (pRows[0].apellidos || '')).trim() : '';

            await query(
                `INSERT INTO registro_auditoria (usuario_id, usuario_nombre, paciente_id, paciente_nombre, accion, detalles, ip_address) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    user.id,
                    usuarioNombre,
                    paciente_id,
                    pNombre,
                    'AÑADIR_OBSERVACION',
                    `Nueva observación clínica añadida al historial del paciente.`,
                    clientIp
                ]
            );

            return res.status(200).json({
                ok: true,
                message: 'Observación guardada correctamente.',
                id: result.insertId,
                observacion: {
                    id: result.insertId,
                    paciente_id,
                    usuario_id: user.id,
                    usuario_nombre: usuarioNombre,
                    contenido: contenido.trim(),
                    created_at: new Date().toISOString()
                }
            });
        } catch (err) {
            console.error('Error guardando observación:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    // --- MÉTODO NO PERMITIDO ---
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
};
