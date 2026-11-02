/**
 * manejarErrores.js
 * -----------------
 * Middleware de manejo de errores. Express lo reconoce porque tiene
 * exactamente 4 parámetros (error, req, res, next): no hay que sacarle
 * ninguno, aunque no use "next". Va SIEMPRE al final de app.js.
 */

export function manejarErrores(error, req, res, next) {
  // El cliente mandó un JSON mal escrito (por ejemplo, una coma de más).
  if (error.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }

  // Cualquier otro error: el detalle queda en la consola del servidor,
  // pero al cliente NO se le muestra nada interno.
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
}