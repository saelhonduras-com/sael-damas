// Corre, en orden, todos los archivos .sql de la carpeta migrations/
// contra la base de datos indicada en DATABASE_URL (backend/.env).
//
// Uso:
//   cd backend
//   node scripts/correr_migraciones.js
//
// Es seguro volver a correrlo: si un archivo ya se aplicó antes y
// truena (por ejemplo "ya existe la columna"), el script se detiene
// ahí mismo y te dice exactamente en cuál archivo fue, para que
// decidas si lo saltas o revisas.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const CARPETA_MIGRACIONES = path.join(__dirname, '..', 'migrations');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('✖ No se encontró DATABASE_URL en backend/.env');
    process.exit(1);
  }

  const archivos = fs.readdirSync(CARPETA_MIGRACIONES)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // los nombres empiezan con 001_, 002_, etc. — el orden alfabético es el correcto

  if (archivos.length === 0) {
    console.error('✖ No se encontraron archivos .sql en', CARPETA_MIGRACIONES);
    process.exit(1);
  }

  console.log(`Encontrados ${archivos.length} archivos de migración. Conectando a la base de datos...`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query('SELECT 1'); // prueba de conexión
    console.log('✓ Conexión exitosa.\n');

    for (const archivo of archivos) {
      const rutaCompleta = path.join(CARPETA_MIGRACIONES, archivo);
      const sql = fs.readFileSync(rutaCompleta, 'utf8');
      process.stdout.write(`→ Aplicando ${archivo} ... `);
      try {
        await pool.query(sql);
        console.log('OK');
      } catch (err) {
        console.log('FALLÓ');
        console.error(`\n✖ Error en ${archivo}:\n${err.message}\n`);
        console.error('El script se detuvo aquí. Ningún archivo posterior a este se aplicó.');
        process.exit(1);
      }
    }

    console.log('\n✓ Todas las migraciones se aplicaron correctamente.');
  } finally {
    await pool.end();
  }
}

main();
