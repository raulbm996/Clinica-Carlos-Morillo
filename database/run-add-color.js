const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { query } = require('../lib/db');

async function main() {
  try {
    // 1. Añadir columna color a usuarios
    console.log('Añadiendo columna color a tabla usuarios...');
    await query(`
      ALTER TABLE usuarios
      ADD COLUMN color VARCHAR(20) NOT NULL DEFAULT '#718096'
    `);
    console.log('✅ Columna color añadida.');

    // 2. Asignar colores por defecto a cada profesional
    const colors = [
      ['carlos',     '#2e9ea3'],
      ['javi',       '#6b8394'],
      ['andrea',     '#d4a017'],
      ['maite',      '#c05780'],
      ['alejandro',  '#5a7d4f'],
      ['codemetria', '#718096'],
    ];

    for (const [username, color] of colors) {
      await query('UPDATE usuarios SET color = ? WHERE username = ?', [color, username]);
      console.log(`✅ Color ${color} asignado a ${username}`);
    }

    console.log('\n🎉 Migración completada.');
  } catch (err) {
    if (err.message && err.message.includes('Duplicate column')) {
      console.log('⏭️ La columna color ya existe. No se necesita migración.');
    } else {
      console.error('❌ Error:', err.message);
      const fs = require('fs');
      fs.writeFileSync(path.resolve(__dirname, '../db-error.log'), err.message + '\n' + err.stack);
      console.log('Error escrito en db-error.log');
    }
  }
  process.exit(0);
}

main();
