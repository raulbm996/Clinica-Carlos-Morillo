require('dotenv').config({ path: '../.env' });
const { query } = require('../lib/db');

async function main() {
  const alterQuery = `
    ALTER TABLE pacientes
    ADD COLUMN apellidos VARCHAR(150) DEFAULT '',
    ADD COLUMN tipo_documento VARCHAR(20) DEFAULT 'DNI/NIF/CIF/NIE',
    ADD COLUMN documento VARCHAR(50) DEFAULT '',
    ADD COLUMN sexo VARCHAR(20) DEFAULT '',
    ADD COLUMN ocupacion VARCHAR(150) DEFAULT '',
    ADD COLUMN direccion_facturacion VARCHAR(255) DEFAULT '',
    ADD COLUMN direccion_adicional VARCHAR(255) DEFAULT '',
    ADD COLUMN codigo_postal VARCHAR(20) DEFAULT '',
    ADD COLUMN localidad VARCHAR(100) DEFAULT '',
    ADD COLUMN provincia VARCHAR(50) DEFAULT '',
    ADD COLUMN pais VARCHAR(50) DEFAULT '',
    ADD COLUMN exclusivo_profesionales TEXT DEFAULT NULL,
    ADD COLUMN firmado_proteccion_datos BOOLEAN DEFAULT FALSE,
    ADD COLUMN recibir_publicidad BOOLEAN DEFAULT FALSE,
    ADD COLUMN recordatorios_automaticos BOOLEAN DEFAULT FALSE;
  `;

  try {
    console.log('Iniciando actualización de la tabla pacientes...');
    await query(alterQuery);
    console.log('Tabla pacientes actualizada con éxito.');
  } catch (err) {
    const fs = require('fs');
    fs.writeFileSync('db-error.log', err.message + '\\n' + err.stack);
    console.log('Error escrito en db-error.log');
  }
  process.exit(1);
}

main();
