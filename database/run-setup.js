/* Ejecutar setup directamente: node database/run-setup.js */
require('dotenv').config();

// Simular req/res de Vercel
const setup = require('../api/setup');

const fakeReq = { method: 'GET' };
const fakeRes = {
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(data) {
    console.log('\n=== RESULTADO (HTTP ' + this.statusCode + ') ===');
    if (data.log) data.log.forEach(l => console.log(l));
    if (data.error) console.log('❌ Error:', data.error);
    console.log('\n' + (data.ok ? '✅ Setup completado con éxito' : '❌ Setup falló'));
    process.exit(data.ok ? 0 : 1);
  },
  end() { process.exit(0); }
};

setup(fakeReq, fakeRes).catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
