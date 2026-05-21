const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { query } = require('../lib/db');

async function main() {
  const schemaQuery = `
    CREATE TABLE IF NOT EXISTS registro_auditoria (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id      INT NOT NULL,
      usuario_nombre  VARCHAR(150) NOT NULL,
      paciente_id     INT DEFAULT NULL,
      paciente_nombre VARCHAR(200) DEFAULT NULL,
      accion          VARCHAR(100) NOT NULL,
      detalles        TEXT DEFAULT NULL,
      ip_address      VARCHAR(45) DEFAULT NULL,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;

  try {
    console.log('Iniciando creación de tabla de auditoría LOPD...');
    await query(schemaQuery);
    console.log('Tabla registro_auditoria creada/verificada con éxito.');
  } catch (err) {
    console.error('Error creando tabla:', err);
  }
  process.exit(0);
}

main();
