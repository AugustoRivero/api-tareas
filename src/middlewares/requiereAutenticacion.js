/**
 * requiereAutenticacion.js
 * ------------------------
 * Middleware que PROTEGE rutas: exige un token JWT válido.
 *
 * Espera un header así:  Authorization: Bearer <token>
 *
 * Si el token es correcto, deja los datos del usuario en req.usuario
 * ({ id, email }) para que los pasos siguientes sepan quién es.
 */

import jwt from 'jsonwebtoken';

export function requiereAutenticacion(req, res, next) {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token de autenticación' });
  }

  // "Bearer abc123" -> se queda con la parte de después del espacio.
  const token = encabezado.split(' ')[1];

  try {
    // verify comprueba la firma y que el token no haya vencido.
    // Si algo falla, lanza un error y se cae al catch.
    req.usuario = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}