/* ============================================
   DB Connection — TiDB Cloud (MySQL compatible)
   ============================================ */
const mysql = require('mysql2/promise');

let pool = null;
let setupPool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.DATABASE_HOST,
      port:     parseInt(process.env.DATABASE_PORT || '4000', 10),
      user:     process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl:      { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * Pool sin database seleccionada — para crear la BD en setup.
 */
function getSetupPool() {
  if (!setupPool) {
    setupPool = mysql.createPool({
      host:     process.env.DATABASE_HOST,
      port:     parseInt(process.env.DATABASE_PORT || '4000', 10),
      user:     process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl:      { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 2,
      queueLimit: 0,
    });
  }
  return setupPool;
}

async function query(sql, params = []) {
  const db = getPool();
  const [rows] = await db.execute(sql, params);
  return rows;
}

async function setupQuery(sql, params = []) {
  const db = getSetupPool();
  const [rows] = await db.execute(sql, params);
  return rows;
}

module.exports = { getPool, getSetupPool, query, setupQuery };

