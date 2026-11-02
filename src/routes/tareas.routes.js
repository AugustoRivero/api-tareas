/**
 * tareas.routes.js
 * ----------------
 * Mapa de rutas de las tareas. router.use(requiereAutenticacion) protege
 * TODAS las rutas de este archivo: cualquier ruta que se agregue acá en
 * el futuro queda protegida sin tener que acordarse.
 */

import { Router } from 'express';
import { requiereAutenticacion } from '../middlewares/requiereAutenticacion.js';
import { buscarTareaPorId } from '../middlewares/buscarTareaPorId.js';
import * as tareasController from '../controllers/tareas.controller.js';

const router = Router();

router.use(requiereAutenticacion);

router.get('/', tareasController.listar);
router.get('/:id', buscarTareaPorId, tareasController.obtener);
router.post('/', tareasController.crear);
router.patch('/:id/completar', buscarTareaPorId, tareasController.completar);
router.patch('/:id/texto', buscarTareaPorId, tareasController.editarTexto);
router.delete('/:id', buscarTareaPorId, tareasController.eliminar);

export default router;