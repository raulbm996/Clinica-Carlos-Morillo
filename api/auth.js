/* ============================================
   AUTH — Handler único para login, logout y session
   ============================================ */
const bcrypt = require('bcryptjs');
const { query } = require('../lib/db');
const { createToken, setTokenCookie, clearTokenCookie } = require('../lib/auth');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    // --- LOGIN ---
    if (req.method === 'POST' && req.body?.username && req.body?.password) {
        const { username, password } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ ok: false, error: 'Usuario y contraseña son obligatorios.' });
        }
        try {
            const rows = await query(
                'SELECT id, username, nombre, apellidos, email, password, rol, foto FROM usuarios WHERE username = ? LIMIT 1',
                [username.trim().toLowerCase()]
            );
            const user = rows[0];
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos.' });
            }
            const token = createToken(user);
            res.setHeader('Set-Cookie', setTokenCookie(token));
            return res.status(200).json({
                ok: true,
                user: {
                    id: user.id,
                    username: user.username,
                    nombre: user.nombre,
                    apellidos: user.apellidos,
                    email: user.email,
                    rol: user.rol,
                    foto: user.foto,
                },
            });
        } catch (err) {
            console.error('Login error:', err);
            return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
        }
    }

    // --- LOGOUT ---
    if (req.method === 'POST' && req.body?.logout) {
        res.setHeader('Set-Cookie', clearTokenCookie());
        return res.status(200).json({ ok: true });
    }

    // --- SESSION CHECK ---
    if (req.method === 'GET') {
        // Verificar que existe un JWT válido
        let tokenData;
        try {
            const cookies = cookie.parse(req.headers.cookie || '');
            const token = cookies['clinica_token'];
            if (!token) return res.status(401).json({ ok: false, error: 'No autenticado.' });
            tokenData = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
        } catch {
            return res.status(401).json({ ok: false, error: 'Sesión expirada.' });
        }
        // Leer datos FRESCOS de la base de datos
        try {
            const rows = await query(
                'SELECT id, username, nombre, apellidos, email, rol, foto FROM usuarios WHERE id = ? LIMIT 1',
                [tokenData.id]
            );
            if (rows.length === 0) {
                return res.status(401).json({ ok: false, error: 'Usuario no encontrado.' });
            }
            const user = rows[0];
            return res.status(200).json({
                ok: true,
                user: {
                    id: user.id,
                    username: user.username,
                    nombre: user.nombre,
                    apellidos: user.apellidos || '',
                    email: user.email || '',
                    rol: user.rol,
                    foto: user.foto || null,
                },
            });
        } catch (err) {
            console.error('Session DB error:', err);
            return res.status(500).json({ ok: false, error: 'Error interno.' });
        }
    }

    // --- MÉTODO NO PERMITIDO ---
    return res.status(405).json({ ok: false, error: 'Método o datos no permitidos.' });
};
