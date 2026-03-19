/* ============================================
   SETUP — Inicializar base de datos
   GET /api/setup → crea BD, tablas e inserta datos seed
   ⚠️ Ejecutar UNA VEZ. Borrar después en producción.
   ============================================ */
const bcrypt = require('bcryptjs');
const { query, setupQuery } = require('./lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const log = [];
  const addLog = (msg) => { log.push(msg); console.log(msg); };

  try {
    // 0. Crear la base de datos si no existe
    const dbName = process.env.DATABASE_NAME || 'clinica_carlos_morillo';
    await setupQuery(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    addLog('✅ Base de datos "' + dbName + '" creada/verificada');

    // 1. Crear tablas
    await query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        username    VARCHAR(50)  NOT NULL UNIQUE,
        nombre      VARCHAR(100) NOT NULL,
        apellidos   VARCHAR(150) NOT NULL DEFAULT '',
        email       VARCHAR(200) NOT NULL DEFAULT '',
        password    VARCHAR(255) NOT NULL,
        rol         VARCHAR(80)  NOT NULL DEFAULT 'Fisioterapeuta',
        foto        LONGTEXT     DEFAULT NULL,
        created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);
    addLog('✅ Tabla usuarios creada');

    await query(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        nombre          VARCHAR(200) NOT NULL,
        telefono        VARCHAR(30)  NOT NULL DEFAULT '',
        email           VARCHAR(200) NOT NULL DEFAULT '',
        fecha_nacimiento DATE        DEFAULT NULL,
        notas           TEXT         DEFAULT NULL,
        ultima_visita   DATE         DEFAULT NULL,
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);
    addLog('✅ Tabla pacientes creada');

    await query(`
      CREATE TABLE IF NOT EXISTS citas (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        paciente_nombre VARCHAR(200) NOT NULL,
        telefono        VARCHAR(30)  NOT NULL DEFAULT '',
        servicio        VARCHAR(100) NOT NULL DEFAULT '',
        fecha           DATE         NOT NULL,
        hora            VARCHAR(10)  NOT NULL,
        mensaje         TEXT         DEFAULT NULL,
        estado          ENUM('pendiente','confirmada','cancelada') NOT NULL DEFAULT 'pendiente',
        usuario_id      INT          DEFAULT NULL,
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);
    addLog('✅ Tabla citas creada');

    await query(`
      CREATE TABLE IF NOT EXISTS mensajes_contacto (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        nombre      VARCHAR(200) NOT NULL,
        email       VARCHAR(200) NOT NULL DEFAULT '',
        telefono    VARCHAR(30)  NOT NULL DEFAULT '',
        mensaje     TEXT         NOT NULL,
        leido       TINYINT(1)   NOT NULL DEFAULT 0,
        created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);
    addLog('✅ Tabla mensajes_contacto creada');

    // 2. Insertar usuarios si no existen
    const existingUsers = await query('SELECT COUNT(*) as cnt FROM usuarios');
    if (existingUsers[0].cnt === 0) {
      const hash = bcrypt.hashSync('CarlosCM2026!', 10);
      addLog('🔐 Contraseña por defecto: CarlosCM2026!');

      const usuarios = [
        ['carlos',     'Carlos',     'Morillo',    'carlos@clinicacarlosmorillo.com',    hash, 'Director / Fisioterapeuta'],
        ['javi',       'Javi',       'Lerate',     'javi@clinicacarlosmorillo.com',      hash, 'Fisioterapeuta'],
        ['andrea',     'Andrea',     'Galvarro',   'andrea@clinicacarlosmorillo.com',    hash, 'Psicóloga'],
        ['maite',      'Maite',      'Lozano',     'maite@clinicacarlosmorillo.com',     hash, 'Fisioterapeuta'],
        ['alejandro',  'Alejandro',  'Ríos',       'alejandro@clinicacarlosmorillo.com', hash, 'Fisioterapeuta'],
        ['codemetria', 'Codemetria', '',           'admin@clinicacarlosmorillo.com',     hash, 'Administrador'],
      ];

      for (const u of usuarios) {
        await query(
          'INSERT INTO usuarios (username, nombre, apellidos, email, password, rol) VALUES (?, ?, ?, ?, ?, ?)',
          u
        );
        addLog(`✅ Usuario '${u[0]}' creado`);
      }
    } else {
      addLog('⏭️ Usuarios ya existen (se omite inserción)');
    }

    // 3. Insertar pacientes si no existen
    const existingPatients = await query('SELECT COUNT(*) as cnt FROM pacientes');
    if (existingPatients[0].cnt === 0) {
      const pacientes = [
        ['Carlos López Fernández',  '600 111 222', 'clopez@mail.com',     '2026-03-10'],
        ['Elena Navarro Ruiz',      '600 222 333', 'elena.nr@mail.com',   '2026-03-12'],
        ['Marcos Jiménez',          '600 333 444', 'mjimenez88@mail.com', '2026-03-15'],
        ['Lucía Ortega',            '600 444 555', 'lu.ortega@mail.com',  '2026-03-16'],
      ];

      for (const p of pacientes) {
        await query(
          'INSERT INTO pacientes (nombre, telefono, email, ultima_visita) VALUES (?, ?, ?, ?)',
          p
        );
        addLog(`✅ Paciente '${p[0]}' creado`);
      }
    } else {
      addLog('⏭️ Pacientes ya existen');
    }

    // 4. Insertar citas de ejemplo
    const existingCitas = await query('SELECT COUNT(*) as cnt FROM citas');
    if (existingCitas[0].cnt === 0) {
      const hoy = new Date().toISOString().slice(0, 10);
      const citas = [
        ['Carlos López Fernández',  '600 111 222', 'fisioterapia', hoy, '10:00', 'Dolor lumbar crónico',       'confirmada'],
        ['Elena Navarro Ruiz',      '600 222 333', 'osteopatia',   hoy, '11:30', 'Revisión mensual',           'confirmada'],
        ['Marcos Jiménez',          '600 333 444', 'psicologia',   hoy, '16:00', 'Primera consulta',           'pendiente'],
        ['Lucía Ortega',            '600 444 555', 'nutricion',    hoy, '18:00', 'Plan alimenticio deportivo', 'pendiente'],
      ];

      for (const c of citas) {
        await query(
          'INSERT INTO citas (paciente_nombre, telefono, servicio, fecha, hora, mensaje, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
          c
        );
        addLog(`✅ Cita para '${c[0]}' creada`);
      }
    } else {
      addLog('⏭️ Citas ya existen');
    }

    addLog('');
    addLog('🎉 ¡SETUP COMPLETADO!');
    addLog('📋 Usuario: carlos | Contraseña: CarlosCM2026!');

    return res.status(200).json({ ok: true, log });
  } catch (err) {
    console.error('Setup error:', err);
    addLog('❌ ERROR: ' + err.message);
    return res.status(500).json({ ok: false, log, error: err.message });
  }
};
