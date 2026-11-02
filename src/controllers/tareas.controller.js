/**
 * tareas.controller.js
 * --------------------
 * Una función por cada acción sobre las tareas. En las rutas con :id, el
 * middleware buscarTareaPorId ya comprobó que la tarea existe y es del
 * usuario (la deja en req.tarea). El usuario autenticado está en req.usuario.
 */

import * as Tareas from '../models/tareas.model.js';

// Coincide con el tamaño de la columna "texto" en la base: NVARCHAR(500).
const LARGO_MAXIMO_TEXTO = 500;

/**
 * Valida el texto de una tarea. Devuelve un mensaje de error, o null si
 * está todo bien.
 */
function validarTexto(texto, mensajeFalta) {
  if (typeof texto !== 'string' || !texto.trim()) {
    return mensajeFalta;
  }
  if (texto.trim().length > LARGO_MAXIMO_TEXTO) {
    return `El texto no puede superar los ${LARGO_MAXIMO_TEXTO} caracteres`;
  }
  return null;
}

// GET /tareas  (opcional: ?buscar=texto)
export async function listar(req, res, next) {
  try {
    const { buscar } = req.query;

    if (buscar !== undefined && typeof buscar !== 'string') {
      return res.status(400).json({ error: 'El parámetro buscar debe ser un texto' });
    }

    const tareas = await Tareas.listarPorUsuario(req.usuario.id, buscar);
    res.json(tareas);
  } catch (error) {
    next(error);
  }
}

// GET /tareas/:id
export function obtener(req, res) {
  res.json(req.tarea);
}

// POST /tareas   Body: { "texto": "..." }
export async function crear(req, res, next) {
  try {
    const { texto } = req.body ?? {};

    const error = validarTexto(texto, 'Falta el texto de la tarea');
    if (error) {
      return res.status(400).json({ error });
    }

    // trim() saca los espacios sobrantes al principio y al final.
    await Tareas.crear(texto.trim(), req.usuario.id);

    const tareas = await Tareas.listarPorUsuario(req.usuario.id);
    res.status(201).json(tareas);
  } catch (error) {
    next(error);
  }
}

// PATCH /tareas/:id/completar
export async function completar(req, res, next) {
  try {
    const tarea = await Tareas.marcarCompletada(req.tarea.id, req.usuario.id);
    res.json(tarea);
  } catch (error) {
    next(error);
  }
}

// PATCH /tareas/:id/texto   Body: { "texto": "nuevo texto" }
export async function editarTexto(req, res, next) {
  try {
    const { texto } = req.body ?? {};

    const error = validarTexto(texto, 'Falta el nuevo texto de la tarea');
    if (error) {
      return res.status(400).json({ error });
    }

    const tarea = await Tareas.actualizarTexto(
      req.tarea.id,
      texto.trim(),
      req.usuario.id
    );
    res.json(tarea);
  } catch (error) {
    next(error);
  }
}

// DELETE /tareas/:id
export async function eliminar(req, res, next) {
  try {
    await Tareas.eliminar(req.tarea.id, req.usuario.id);

    const tareas = await Tareas.listarPorUsuario(req.usuario.id);
    res.json(tareas);
  } catch (error) {
    next(error);
  }
}