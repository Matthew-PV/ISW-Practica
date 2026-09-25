const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');

const SALT_ROUNDS = 10;

async function registrar({ nombreUsuario, email, password }) {
  const existente = await usuarioRepository.buscarPorEmail(email);
  if (existente) {
    const error = new Error('El email ya está registrado');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const usuario = await usuarioRepository.crear({
    nombreUsuario,
    email,
    passwordHash,
  });

  return { id: usuario.id, nombreUsuario: usuario.nombreUsuario, email: usuario.email };
}

async function iniciarSesion({ email, password }) {
  const usuario = await usuarioRepository.buscarPorEmail(email);
  if (!usuario) {
    const error = new Error('Email o contraseña incorrectos');
    error.status = 401;
    throw error;
  }

  const coincide = await bcrypt.compare(password, usuario.passwordHash);
  if (!coincide) {
    const error = new Error('Email o contraseña incorrectos');
    error.status = 401;
    throw error;
  }

  return { id: usuario.id, nombreUsuario: usuario.nombreUsuario, email: usuario.email };
}

module.exports = { registrar, iniciarSesion };
