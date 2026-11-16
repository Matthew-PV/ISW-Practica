// Landing (index.html): si ya hay sesión iniciada lleva a Inicio; si no, se queda como está.
// Usa `api` de shared/api.js.

api('/auth/yo')
  .then(() => window.location.replace('/paginas/cuenta/bienvenida.html'))
  .catch(() => {
    // Sin sesión (o el servidor no responde): la landing se queda tal cual
  });
