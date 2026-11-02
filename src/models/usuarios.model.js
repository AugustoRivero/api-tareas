/**
 * usuarios.model.js
 * -----------------
 * Capa de DATOS de los usuarios. Acá vive el SQL. No sabe nada de HTTP
 * (nada de req/res): recibe datos simples y devuelve datos simples.
 *
 * Los valores (@email, @passwordHash) viajan como PARÁMETROS, separados
 * del texto SQL. Así un texto malicioso nunca puede modificar la consulta
 * (eso es lo que evita la "inyección SQL").
 */

import { pool, sql } from '../config/db.js';

/**
 * Busca un usuario por email. Devuelve el usuario (con password_hash,
 * porque el login lo necesita) o undefined si no existe.
 */
export async function buscarPorEmail(email) {
  const resultado = await pool
    .request()
    .input('email', sql.NVarChar(255), email)
    .query(
      'SELECT id, email, password_hash FROM dbo.usuarios WHERE email = @email'
    );

  return resultado.recordset[0];
}

/**
 * Crea un usuario nuevo y devuelve { id, email }.
 * Si el email ya existe, SQL Server lanza un error (por el UNIQUE de la
 * tabla) que se atrapa en el controlador.
 */
export async function crear(email, passwordHash) {
  const resultado = await pool
    .request()
    .input('email', sql.NVarChar(255), email)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .query(`
      INSERT INTO dbo.usuarios (email, password_hash)
      OUTPUT INSERTED.id, INSERTED.email
      VALUES (@email, @passwordHash)
    `);

  return resultado.recordset[0];
}