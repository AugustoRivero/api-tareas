/**
 * registrarPedido.js
 * ------------------
 * Middleware GLOBAL de logging. Se aplica a TODAS las rutas. Solo informa
 * por consola, nunca bloquea nada: siempre llama a next().
 */

export function registrarPedido(req, res, next) {
  const hora = new Date().toLocaleTimeString();
  console.log(`[${hora}] ${req.method} ${req.url}`);
  next();
}