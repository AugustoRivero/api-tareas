/**
 * tareas.model.js
 * ---------------
 * Capa de DATOS de las tareas. Acá vive el SQL; no sabe nada de HTTP.
 *
 * Todas las consultas filtran por usuario_id: cada usuario solo puede
 * leer o modificar SUS tareas.
 *
 * Nota: en SQL Server la columna BIT llega a JavaScript como true/false,
 * así que no hace falta convertirla.
 */

import { pool, sql } from '../config/db.js';

// En un LIKE, los símbolos % _ [ tienen significado especial. Se escapan
// para que si alguien busca "50%" se busque literalmente "50%".
function escaparLike(texto) {
  return texto.replace(/[[%_]/g, '[$&]');
}

/**
 * Devuelve las tareas de un usuario, ordenadas por id.
 * Si se pasa "buscar", solo las que contengan ese texto.
 */
export async function listarPorUsuario(usuarioId, buscar) {
  const peticion = pool.request().input('usuarioId', sql.Int, usuarioId);

  let consulta =
    'SELECT id, texto, completada FROM dbo.tareas WHERE usuario_id = @usuarioId';

  if (buscar !== undefined) {
    consulta += ' AND texto LIKE @buscar';
    peticion.input('buscar', sql.NVarChar, `%${escaparLike(buscar)}%`);
  }

  consulta += ' ORDER BY id ASC';

  const resultado = await peticion.query(consulta);
  return resultado.recordset;
}

/**
 * Busca UNA tarea por id, solo si es del usuario. Devuelve undefined si no existe.
 */
export async function buscarPorId(id, usuarioId) {
  const resultado = await pool
    .request()
    .input('id', sql.Int, id)
    .input('usuarioId', sql.Int, usuarioId)
    .query(
      'SELECT id, texto, completada FROM dbo.tareas WHERE id = @id AND usuario_id = @usuarioId'
    );

  return resultado.recordset[0];
}

/**
 * Crea una tarea (nace con completada = 0) y devuelve la tarea creada.
 */
export async function crear(texto, usuarioId) {
  const resultado = await pool
    .request()
    .input('texto', sql.NVarChar(500), texto)
    .input('usuarioId', sql.Int, usuarioId)
    .query(`
      INSERT INTO dbo.tareas (texto, usuario_id)
      OUTPUT INSERTED.id, INSERTED.texto, INSERTED.completada
      VALUES (@texto, @usuarioId)
    `);

  return resultado.recordset[0];
}

/**
 * Marca una tarea como completada y devuelve la tarea ya modificada.
 */
export async function marcarCompletada(id, usuarioId) {
  const resultado = await pool
    .request()
    .input('id', sql.Int, id)
    .input('usuarioId', sql.Int, usuarioId)
    .query(`
      UPDATE dbo.tareas
      SET completada = 1
      OUTPUT INSERTED.id, INSERTED.texto, INSERTED.completada
      WHERE id = @id AND usuario_id = @usuarioId
    `);

  return resultado.recordset[0];
}

/**
 * Cambia el texto de una tarea y devuelve la tarea ya modificada.
 */
export async function actualizarTexto(id, texto, usuarioId) {
  const resultado = await pool
    .request()
    .input('id', sql.Int, id)
    .input('texto', sql.NVarChar(500), texto)
    .input('usuarioId', sql.Int, usuarioId)
    .query(`
      UPDATE dbo.tareas
      SET texto = @texto
      OUTPUT INSERTED.id, INSERTED.texto, INSERTED.completada
      WHERE id = @id AND usuario_id = @usuarioId
    `);

  return resultado.recordset[0];
}

/**
 * Elimina una tarea. Devuelve true si borró algo, false si no.
 */
export async function eliminar(id, usuarioId) {
  const resultado = await pool
    .request()
    .input('id', sql.Int, id)
    .input('usuarioId', sql.Int, usuarioId)
    .query('DELETE FROM dbo.tareas WHERE id = @id AND usuario_id = @usuarioId');

  return resultado.rowsAffected[0] > 0;
}