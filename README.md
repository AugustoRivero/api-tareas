# API de Tareas

API REST para gestionar tareas personales. Cada usuario se registra, inicia sesión y administra **solo sus propias tareas**. Está hecha con Node.js, Express y SQL Server, con consultas SQL escritas a mano, contraseñas hasheadas con bcrypt y autenticación con JWT.

Proyecto académico de Programación IV (UTN-FRT).

## Qué hace

- Registro de usuarios y login, con contraseñas **hasheadas** (nunca se guardan en texto plano).
- Autenticación **stateless** con JSON Web Tokens (el token dura 2 horas).
- CRUD completo de tareas: crear, listar, buscar por texto, ver una, marcar como completada, editar el texto y eliminar.
- **Aislamiento por usuario**: cada consulta filtra por dueño. Si una tarea es de otra persona, la API responde 404, igual que si no existiera.
- Validación de los datos de entrada y manejo centralizado de errores.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Entorno | Node.js (módulos ES) |
| Servidor web | Express |
| Base de datos | SQL Server (driver `mssql`, SQL con parámetros) |
| Contraseñas | `bcrypt` |
| Sesiones | `jsonwebtoken` (JWT) |
| Configuración | `dotenv` |
| Desarrollo | `nodemon` |

## Estructura del proyecto

```
.
├── database/
│   └── schema.sql                  # Crea la base, el usuario y las tablas
├── src/
│   ├── app.js                      # Arma Express: middlewares y rutas
│   ├── server.js                   # Punto de entrada: conecta a la base y abre el puerto
│   ├── config/
│   │   └── db.js                   # Pool de conexiones a SQL Server
│   ├── routes/                     # Qué ruta va a qué controlador
│   │   ├── auth.routes.js
│   │   └── tareas.routes.js
│   ├── controllers/                # Validan la entrada y arman la respuesta HTTP
│   │   ├── auth.controller.js
│   │   └── tareas.controller.js
│   ├── middlewares/
│   │   ├── requiereAutenticacion.js  # Verifica el token JWT
│   │   ├── buscarTareaPorId.js       # Busca la tarea y comprueba que sea del usuario
│   │   ├── registrarPedido.js        # Log de cada pedido
│   │   └── manejarErrores.js         # Manejador global de errores
│   └── models/                     # Único lugar con SQL
│       ├── usuarios.model.js
│       └── tareas.model.js
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

Cada capa tiene una sola responsabilidad: las **rutas** despachan, los **controladores** validan y responden, los **modelos** hablan con la base y los **middlewares** protegen y manejan errores.

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- SQL Server (alcanza con la edición Express) y SQL Server Management Studio (SSMS)
- Git

## Instalación y puesta en marcha

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/AugustoRivero/api-tareas.git
cd api-tareas
npm install
```

### 2. Preparar SQL Server

La API se conecta con un usuario y contraseña de SQL Server, por lo que hay que dejar la instancia lista:

1. **Activar el modo mixto de autenticación.** En SSMS: clic derecho sobre el servidor → *Properties* → *Security* → *SQL Server and Windows Authentication mode*.
2. **Activar TCP/IP con puerto fijo.** Abrir *SQL Server Configuration Manager* (`SQLServerManager16.msc` para SQL Server 2022) → *SQL Server Network Configuration* → *Protocols for SQLEXPRESS* → *TCP/IP*: poner *Enabled = Yes*; en la pestaña *IP Addresses*, sección *IPAll*, dejar vacío *TCP Dynamic Ports* y escribir `1433` en *TCP Port*.
3. **Reiniciar el servicio** *SQL Server (SQLEXPRESS)* para aplicar los dos cambios.
4. **Crear la base de datos.** Abrir `database/schema.sql` en SSMS, reemplazar `CAMBIAR_POR_TU_PASSWORD` por una contraseña propia (con mayúsculas, minúsculas, números y símbolos; sin `#`, comillas ni espacios) y ejecutarlo con F5. Crea la base `tareas_db`, el usuario `tareas_app` con permisos mínimos y las tablas `usuarios` y `tareas`.

### 3. Configurar las variables de entorno

Copiar la plantilla y completarla:

```bash
cp .env.example .env        # en Windows (CMD): copy .env.example .env
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `JWT_SECRET` | Clave para firmar los tokens. Debe ser larga y aleatoria |
| `DB_HOST` | Servidor de SQL Server (`localhost`) |
| `DB_PORT` | Puerto de SQL Server (`1433`) |
| `DB_USER` | `tareas_app` |
| `DB_PASSWORD` | La contraseña elegida en `schema.sql` |
| `DB_NAME` | `tareas_db` |

Para generar un `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Ejecutar

```bash
npm run dev     # desarrollo: se reinicia solo al guardar cambios
npm start       # ejecución normal
```

Si todo está bien, la terminal muestra:

```
Conectado a SQL Server — 1 + 1 = 2
Servidor corriendo en http://localhost:3000
```

Abrir `http://localhost:3000` debe responder `{"mensaje":"API de tareas funcionando"}`.

## Uso de la API

Las rutas de `/tareas` requieren el header `Authorization: Bearer <token>`. El token se obtiene en `/login`.

### Autenticación

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/registro` | `{ "email", "password" }` | `201` `{ "email" }` |
| POST | `/login` | `{ "email", "password" }` | `200` `{ "token" }` |

### Tareas (requieren token)

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| GET | `/tareas` | — | `200` lista de tus tareas |
| GET | `/tareas?buscar=texto` | — | `200` tareas cuyo texto contiene `texto` |
| GET | `/tareas/:id` | — | `200` la tarea |
| POST | `/tareas` | `{ "texto" }` | `201` lista actualizada |
| PATCH | `/tareas/:id/completar` | — | `200` la tarea completada |
| PATCH | `/tareas/:id/texto` | `{ "texto" }` | `200` la tarea editada |
| DELETE | `/tareas/:id` | — | `200` lista actualizada |

Una tarea tiene esta forma: `{ "id": 1, "texto": "Estudiar Express", "completada": false }`.

### Códigos de error

| Código | Cuándo ocurre |
|---|---|
| `400` | Datos inválidos: falta un campo, email mal formado, contraseña fuera de 8–72 caracteres, texto vacío o de más de 500 caracteres, email ya registrado, JSON mal escrito |
| `401` | Token ausente, inválido o vencido; credenciales incorrectas en el login |
| `404` | La tarea no existe o pertenece a otro usuario |
| `500` | Error interno (el detalle queda en la consola del servidor, no se muestra al cliente) |

### Ejemplo rápido

Desde la consola del navegador (F12), en una pestaña abierta en `http://localhost:3000`:

```js
// 1. Registrarse
await fetch('http://localhost:3000/registro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'usuario@ejemplo.com', password: 'Clave12345' })
});

// 2. Iniciar sesión y guardar el token
const { token } = await (await fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'usuario@ejemplo.com', password: 'Clave12345' })
})).json();

// 3. Crear una tarea
const respuesta = await fetch('http://localhost:3000/tareas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
  body: JSON.stringify({ texto: 'Estudiar Express' })
});
console.log(await respuesta.json());
```

También se puede probar con Postman, Insomnia, Bruno o Thunder Client.

## Seguridad

- Contraseñas hasheadas con bcrypt (10 rondas), nunca en texto plano.
- Consultas SQL parametrizadas: los datos del usuario no se mezclan con el texto SQL (evita inyección SQL).
- Cada consulta de tareas filtra por `usuario_id`: nadie puede ver ni modificar tareas ajenas.
- El login responde igual si el email no existe o la contraseña es incorrecta (evita averiguar qué emails están registrados).
- Secretos y credenciales solo en `.env`, que no se versiona.
- El usuario de base de datos tiene permisos mínimos (leer y escribir filas, sin poder borrar ni modificar tablas).
- Los errores inesperados devuelven un mensaje genérico; el detalle técnico queda solo en el servidor.

## Solución de problemas

| Síntoma | Causa probable |
|---|---|
| `Login failed for user 'tareas_app'` | La contraseña de `.env` no coincide con la de `schema.sql` |
| `Failed to connect to localhost:1433` | TCP/IP desactivado, puerto distinto o servicio detenido |
| `Falta JWT_SECRET en el archivo .env` | No existe `.env` o falta esa variable |
| `ERR_MODULE_NOT_FOUND` | Un archivo no existe o su nombre no coincide exactamente (importan las mayúsculas) |
| `401` en `/tareas` | Falta el header `Authorization: Bearer <token>`, o el token venció (dura 2 horas) |
| Error de certificado al conectar con SSMS | Marcar *Trust server certificate* en la ventana de conexión |

## Limitaciones y mejoras posibles

- `trustServerCertificate: true` en `src/config/db.js` está pensado para desarrollo local con el certificado autofirmado de SQL Server. En producción conviene usar un certificado válido y quitarlo.
- No incluye limitación de intentos de login, cabeceras de seguridad (`helmet`) ni CORS configurado: se agregarían al conectar un frontend desde otro origen.
- No tiene pruebas automatizadas.
- La validación es básica y está en los controladores; podría migrarse a una librería de esquemas.

## Autor

AugustoRivero