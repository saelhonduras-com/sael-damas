// Crea (o actualiza la contraseña de) un usuario super_admin en
// usuarios_admin, con la contraseña correctamente encriptada.
//
// Uso:
//   1. Edita las 3 líneas de abajo (EMAIL, PASSWORD, NOMBRE) con tus datos.
//   2. cd backend
//   3. node scripts/crear_admin.js

const EMAIL = 'sfl.honduras@gmail.com';       // <-- cambia esto por el correo que vas a usar para entrar
const PASSWORD = 'SFLFihnec2026#';    // <-- cambia esto por la contraseña que vas a usar
const NOMBRE = 'Carlos Marcía';           // <-- tu nombre completo

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('✖ No se encontró DATABASE_URL en backend/.env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const hash = await bcrypt.hash(PASSWORD, 10);

    const { rows } = await pool.query(
      `INSERT INTO usuarios_admin (email, password_hash, nombre_completo, rol, activo)
       VALUES ($1, $2, $3, 'super_admin', true)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id, email, nombre_completo, rol`,
      [EMAIL, hash, NOMBRE]
    );

    console.log('✓ Usuario listo:');
    console.log(rows[0]);
    console.log(`\nYa puedes iniciar sesión con:\n  Correo: ${EMAIL}\n  Contraseña: ${PASSWORD}`);
  } catch (err) {
    console.error('✖ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
