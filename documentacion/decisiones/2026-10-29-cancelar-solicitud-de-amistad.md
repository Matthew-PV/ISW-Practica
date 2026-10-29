# El solicitante cancela su solicitud de amistad pendiente

**Fecha:** 2026-10-29 · **Historia:** CS-61 · **Decidió:** Joaquín, a propuesta de Claude

- **Contexto:** quien enviaba una solicitud no podía retirarla: `DELETE /api/amistades/:id` respondía 400 con las pendientes. Sin cancelar, un error al pulsar «Añadir amigo» no tenía vuelta atrás.
- **Decisión:** `DELETE /api/amistades/:id` borra una amistad pendiente solo si quien lo pide es el solicitante; el destinatario o un tercero reciben 403. El destinatario ya tenía `PATCH` para rechazar. Se reutiliza la ruta en lugar de crear otra.
- **Alternativas:** una ruta nueva `POST /amistades/:id/cancelar` (más superficie para lo mismo); un estado `CANCELADA` (necesita migración y deja filas que bloquean reenviar la solicitud).
- **Consecuencias:** sin migración. Cancelar borra la fila, así que se puede volver a enviar. La interfaz ofrece «Cancelar solicitud» en el perfil y en el buscador.
