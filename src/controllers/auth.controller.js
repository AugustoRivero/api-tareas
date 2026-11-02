/**
 * auth.controller.js
 * ------------------
 * Registro e inicio de sesión. Cada función hace, en orden:
 * 1) lee los datos, 2) los valida, 3) aplica la lógica (bcrypt / JWT),
 * 4) llama al modelo, 5) responde con el código HTTP que corresponda.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as Usuarios from '../models/usuarios.model.js';

// Cuánto trabajo exige bcrypt al hashear. 10 es un valor estándar.
const SALT_ROUNDS = 10;

// Validación básica de formato de email: algo@algo.algo, sin espacios.
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Códigos de error de SQL Server cuando se viola una restricción UNIQUE.
const ERRORES_UNIQUE = [2627, 2601];

export async function registro(req, res, next) {
  try {
    // "?? {}" evita un error si el cliente no mandó ningún body.
    const { email, password } = req.body ?? {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({ error: 'Faltan email o password' });
    }

    // Se guarda siempre en minúsculas y sin espacios sobrantes.
    const emailLimpio = email.trim().toLowerCase();

    if (emailLimpio.length > 255 || !EMAIL_VALIDO.test(emailLimpio)) {
      return res.status(400).json({ error: 'El email no tiene un formato válido' });
    }

    // bcrypt solo usa los primeros 72 bytes de la contraseña, por eso ese tope.
    if (password.length < 8 || Buffer.byteLength(password) > 72) {
      return res
        .status(400)
        .json({ error: 'La contraseña debe tener entre 8 y 72 caracteres' });
    }

    // Nunca se guarda la contraseña: solo su hash.
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      await Usuarios.crear(emailLimpio, hash);
    } catch (error) {
      if (ERRORES_UNIQUE.includes(error.number)) {
        return res.status(400).json({ error: 'Ese email ya está registrado' });
      }
      throw error; // cualquier otro error va al manejador global
    }

    // Se responde solo el email, nunca el hash.
    res.status(201).json({ email: emailLimpio });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({ error: 'Faltan email o password' });
    }

    const usuario = await Usuarios.buscarPorEmail(email.trim().toLowerCase());

    // Mismo mensaje si el email no existe o si la contraseña está mal:
    // así nadie puede averiguar qué emails están registrados.
    if (!usuario) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // El token lleva el id y el email, y vence a las 2 horas.
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
}