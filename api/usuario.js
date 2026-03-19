/* ============================================
   USUARIO — Handler único para cambiar contraseña y guardar perfil
   ============================================ */
const bcrypt = require('bcryptjs');
const { query } = require('../lib/db');
const { requireAuth, createToken, setTokenCookie } = require('../lib/auth');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    // --- CAMBIAR CONTRASEÑA (protegido) ---
    if (req.method === 'POST' && req.body?.current_password && req.body?.new_password) {
        const user = requireAuth(req, res);
        if (!user) return;
        const { current_password, new_password } = req.body || {};
        if (!current_password || !new_password) {
            return res.status(400).json({ ok: false, error: 'Ambos campos son obligatorios.' });
        }
        if (new_password.length < 6) {
            return res.status(400).json({ ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }
        try {
            const rows = await query('SELECT password FROM usuarios WHERE id = ?', [user.id]);
            const row = rows[0];
            if (!row || !bcrypt.compareSync(current_password, row.password)) {
                return res.status(400).json({ ok: false, error: 'La contraseña actual no es correcta.' });
            }
            const hash = bcrypt.hashSync(new_password, 10);
            await query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, user.id]);
            return res.status(200).json({ ok: true, message: 'Contraseña cambiada correctamente.' });
        } catch (err) {
            console.error('Error cambiando contraseña:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    // --- GUARDAR PERFIL (protegido) ---
    if (req.method === 'POST' && req.body?.nombre) {
        const user = requireAuth(req, res);
        if (!user) return;
        const { nombre, apellidos, email, foto } = req.body || {};
        if (!nombre || nombre.trim().length < 3) {
            return res.status(400).json({ ok: false, error: 'El nombre debe tener al menos 3 letras.' });
        }
        try {
            await query(
                'UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, foto = ? WHERE id = ?',
                [nombre.trim(), (apellidos || '').trim(), (email || '').trim(), foto || null, user.id]
            );
            // Emitir un nuevo JWT con los datos actualizados
            const updatedUserRows = await query('SELECT id, username, nombre, apellidos, email, rol, foto FROM usuarios WHERE id = ?', [user.id]);
            const updatedUser = updatedUserRows[0] || {};
            const newToken = createToken(updatedUser);
            res.setHeader('Set-Cookie', setTokenCookie(newToken));
            return res.status(200).json({ ok: true, message: 'Perfil guardado correctamente.', user: updatedUser });
        } catch (err) {
            console.error('Error guardando perfil:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    // --- MÉTODO NO PERMITIDO ---
    return res.status(405).json({ ok: false, error: 'Método o datos no permitidos.' });
};
