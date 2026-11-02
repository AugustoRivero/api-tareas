/**
 * buscarTareaPorId.js
 * -------------------
 * Middleware para rutas con :id en la URL. Busca la tarea UNA sola vez
 * y la deja en req.tarea, para no repetir ese código en cada ruta.
 *
 * Busca por id Y por dueño: si la tarea existe pero es de otro usuario,
 * responde igual 404. Así nadie puede descubrir (ni tocar) tareas ajenas.
 */

import * as Tareas from '../models/tareas.model.js';

// El número más grande que cabe en una columna INT de SQL Server.
const ID_MAXIMO = 2147483647;

export async function buscarTareaPorId(req, res, next) {
  try {
    const id = Number(req.params.id);

    // Si el id no es un entero válido (por ejemplo "hola"), ni se consulta la base.
    if (!Number.isInteger(id) || id < 1 || id > ID_MAXIMO) {
      return res
        .status(404)
        .json({ error: `No existe una tarea con id ${req.params.id}` });
    }

    const tarea = await Tareas.buscarPorId(id, req.usuario.id);

    if (!tarea) {
      return res.status(404).json({ error: `No existe una tarea con id ${id}` });
    }

    req.tarea = tarea;
    next();
  } catch (error) {
    next(error);
  }
}