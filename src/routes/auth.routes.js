/**
 * auth.routes.js
 * --------------
 * Solo responde a: "si llega este método a esta ruta, ¿a quién se la paso?"
 * No tiene lógica propia.
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/registro', authController.registro);
router.post('/login', authController.login);

export default router;