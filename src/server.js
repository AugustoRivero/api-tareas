/**
 * server.js
 * ---------
 * Punto de entrada: carga el .env, verifica la configuración, conecta a
 * SQL Server y recién entonces abre el puerto.
 *
 * 'dotenv/config' va en la PRIMERA línea: así el .env se lee antes de que
 * los demás archivos usen process.env.
 */

import 'dotenv/config';
import app from './app.js';
import { conectar } from './config/db.js';

const PORT = process.env.PORT || 3000;

try {
  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en el archivo .env');
  }

  await conectar();

  app.listen(PORT, () =>
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
  );
} catch (error) {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
}