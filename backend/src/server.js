// Punto de entrada del backend: arranca el servidor HTTP.
// Capa: arranque (fuera de las capas).
// Lo ejecuta: `npm run dev` (se reinicia solo al guardar cambios) o `npm start`.
// Usa: app.js, donde está toda la configuración de Express.
//
// Este archivo solo pone el servidor a escuchar. Está separado de app.js para que las
// pruebas puedan usar la aplicación sin abrir ningún puerto.
const app = require('./app');

// Puerto: el de la variable de entorno PORT si existe, si no el 3000
const port = process.env.PORT || 3000;

// Empieza a aceptar peticiones (API y páginas del frontend) en ese puerto
app.listen(port, () => {
  console.log(`PlanB escuchando en http://localhost:${port}`);
});
