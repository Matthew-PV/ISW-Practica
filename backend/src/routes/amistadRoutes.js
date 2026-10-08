// Rutas de solicitudes y amistades, bajo /api/amistades.
// Capa: rutas (routes).
// Lo usa: routes/index.js.
// Usa: services/amistadService.js y middlewares/sesionMiddleware.js.
const express = require('express');
const amistadService = require('../services/amistadService');
const { requiereSesion } = require('../middlewares/sesionMiddleware');

const router = express.Router();

router.use(requiereSesion);

// POST /api/amistades → amistadService.enviarSolicitud
// Envía una solicitud. Cuerpo: { destinatarioId }.
router.post('/', async (req, res) => {
  const amistad = await amistadService.enviarSolicitud(req.session.usuarioId, req.body?.destinatarioId);
  res.status(201).json(amistad);
});

// GET /api/amistades/solicitudes → amistadService.listarSolicitudesRecibidas
// Solicitudes pendientes que ha recibido el usuario.
router.get('/solicitudes', async (req, res) => {
  const solicitudes = await amistadService.listarSolicitudesRecibidas(req.session.usuarioId);
  res.json(solicitudes);
});

// PATCH /api/amistades/:id → amistadService.responderSolicitud
// Acepta o rechaza una solicitud. Cuerpo: { aceptar }.
router.patch('/:id', async (req, res) => {
  const amistad = await amistadService.responderSolicitud(
    req.session.usuarioId,
    Number(req.params.id),
    req.body?.aceptar
  );
  res.json(amistad);
});

// DELETE /api/amistades/:id → amistadService.eliminarAmistad
// Elimina una amistad aceptada.
router.delete('/:id', async (req, res) => {
  await amistadService.eliminarAmistad(req.session.usuarioId, Number(req.params.id));
  res.status(204).send();
});

module.exports = router;
