/**
 * app.js
 * ------
 * Arma la aplicación Express: middlewares globales y rutas.
 * No abre ningún puerto: eso lo hace server.js.
 */

import express from 'express';
import { registrarPedido } from './middlewares/registrarPedido.js';
import { manejarErrores } from './middlewares/manejarErrores.js';
import authRoutes from './routes/auth.routes.js';
import tareasRoutes from './routes/tareas.routes.js';

const app = express();

app.use(express.json()); // permite leer req.body cuando llega JSON
app.use(registrarPedido); // se registra ANTES de las rutas, para que corra en todas

// Ruta de prueba: confirma que la API está viva. También da una página
// "normal" desde donde abrir la consola del navegador (la página de error
// de Express trae una política de seguridad que bloquea los fetch).
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de tareas funcionando' });
});

app.use(authRoutes); // /registro y /login
app.use('/tareas', tareasRoutes); // todo lo que empiece con /tareas

// El manejador de errores va SIEMPRE al final.
app.use(manejarErrores);

export default app;