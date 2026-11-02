-- ============================================================
-- Proyecto Tareas - Script de creación de la base (SQL Server)
-- Ejecutar en SSMS, conectado como administrador (Windows Auth).
-- Antes de ejecutar: reemplazar CAMBIAR_POR_TU_PASSWORD por una
-- contraseña propia, y usar la MISMA en el archivo .env (DB_PASSWORD).
-- Se puede ejecutar más de una vez sin romper nada.
-- ============================================================

-- 1) Base de datos
IF DB_ID('tareas_db') IS NULL
    CREATE DATABASE tareas_db;
GO

-- 2) Login del servidor: el usuario con el que se conecta Node
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'tareas_app')
    CREATE LOGIN tareas_app
        WITH PASSWORD = 'CAMBIAR_POR_TU_PASSWORD',
             CHECK_POLICY = ON,
             CHECK_EXPIRATION = OFF,
             DEFAULT_DATABASE = tareas_db;
GO

USE tareas_db;
GO

-- 3) Usuario dentro de la base, ligado al login
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'tareas_app')
    CREATE USER tareas_app FOR LOGIN tareas_app;
GO

-- 4) Tabla de usuarios
IF OBJECT_ID('dbo.usuarios', 'U') IS NULL
    CREATE TABLE dbo.usuarios (
        id            INT IDENTITY(1,1) PRIMARY KEY,
        email         NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        creado_en     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
    );
GO

-- 5) Tabla de tareas (cada tarea pertenece a un usuario)
IF OBJECT_ID('dbo.tareas', 'U') IS NULL
    CREATE TABLE dbo.tareas (
        id         INT IDENTITY(1,1) PRIMARY KEY,
        texto      NVARCHAR(500) NOT NULL,
        completada BIT           NOT NULL DEFAULT 0,
        usuario_id INT           NOT NULL,
        creado_en  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_tareas_usuarios
            FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id)
            ON DELETE CASCADE
    );
GO

-- 6) Permisos mínimos: solo leer y escribir datos, nada de borrar tablas
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO tareas_app;
GO