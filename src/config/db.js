/**
 * db.js
 * -----
 * Configuración de la conexión a SQL Server.
 *
 * Crea un "pool" de conexiones: un grupo de conexiones ya abiertas que se
 * reutilizan. Abrir una conexión nueva en cada consulta sería lento, así
 * que se abren unas pocas al principio y se van prestando.
 *
 * Los datos de conexión NO se escriben acá: se leen de process.env, que
 * llena dotenv a partir del archivo .env.
 */

import sql from 'mssql';

const configuracion = {
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    // Necesario con SQL Server local: su certificado es autofirmado.
    // Es lo mismo que la casilla "Trust server certificate" de SSMS.
    trustServerCertificate: true,
  },
  pool: {
    max: 10, // máximo de conexiones abiertas a la vez
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Se crea el pool, pero todavía no se conecta (eso lo hace conectar()).
export const pool = new sql.ConnectionPool(configuracion);

// Se exporta también "sql" para poder usar sus tipos de datos
// (sql.Int, sql.NVarChar, etc.) en los modelos.
export { sql };

/**
 * Abre el pool y hace una consulta de prueba. Si algo está mal (servidor
 * apagado, contraseña incorrecta), lanza un error.
 */
export async function conectar() {
  await pool.connect();
  const resultado = await pool.request().query('SELECT 1 + 1 AS resultado');
  console.log('Conectado a SQL Server — 1 + 1 =', resultado.recordset[0].resultado);
}