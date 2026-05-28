const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { query } = require('../lib/db');

async function main() {
  const schemaQuery = `
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
  `;

  try {
    console.log('Iniciando creación de tabla observaciones_paciente...');
    await query(schemaQuery);
    console.log('✅ Tabla observaciones_paciente creada/verificada con éxito.');
  } catch (err) {
    console.error('❌ Error creando tabla:', err);
  }
  process.exit(0);
}

main();
