/* ============================================
   Auth Helpers — JWT + Cookies
   ============================================ */
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_NAME = 'clinica_token';
const TOKEN_MAX_AGE = 60 * 60 * 24; // 24 horas en segundos

/**
 * Crea un JWT con los datos del usuario.
 */
function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      apellidos: user.apellidos || '',
      email: user.email || '',
      rol: user.rol,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_MAX_AGE }
  );
}

/**
 * Verifica el JWT de la cookie y devuelve los datos del usuario.
 * Retorna null si no es válido.
 */
function verifyToken(req) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies[TOKEN_NAME];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Devuelve el header Set-Cookie para guardar el JWT.
 */
function setTokenCookie(token) {
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  return cookie.serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  });
}

/**
 * Devuelve el header Set-Cookie para borrar el JWT.
 */
function clearTokenCookie() {
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  return cookie.serialize(TOKEN_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Middleware: requiere autenticación o devuelve 401.
 * Retorna los datos del usuario si está autenticado.
 */
function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'No autenticado. Inicia sesión.' });
    return null;
  }
  return user;
}

module.exports = {
  createToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie,
  requireAuth,
};
