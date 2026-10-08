/**
 * @jest-environment jsdom
 */
// CS-47: la foto en la pantalla de mi perfil (frontend/perfil.html y js/perfil.js) en un
// navegador simulado (jsdom). La foto se sube en cuanto se elige, sin pulsar ningún botón.
// Se simula el servidor (fetch), así que no hace falta arrancar nada.
const fs = require('node:fs');
const path = require('node:path');
const { cargarScripts } = require('../helpers/pantalla');

const FRONTEND = path.join(__dirname, '..', '..', '..', 'frontend');
const leer = (archivo) => fs.readFileSync(path.join(FRONTEND, archivo), 'utf8');
const HTML = leer('perfil.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/experiencias.js', 'js/shared/password.js', 'js/perfil.js'];
const FOTO_ANTERIOR = 'https://res.cloudinary.com/demo/image/upload/v1/planb/perfiles/usuario-1.png';
const FOTO_NUEVA = 'https://res.cloudinary.com/demo/image/upload/v2/planb/perfiles/usuario-1.jpg';
const PERFIL = { id: 1, nombreUsuario: 'ana', email: 'ana@ejemplo.com', foto: FOTO_ANTERIOR, ciudad: null };

// Respuesta de fetch con el código y el JSON indicados
const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const visible = (selector) => ($(selector).classList.contains('d-none') ? null : $(selector).textContent);
// Deja que terminen las promesas pendientes (la llamada a fetch y lo que viene después)
const terminar = () => new Promise((r) => setTimeout(r, 0));

// Simula que el usuario elige un archivo en el selector de la foto
function elegirFoto(archivo) {
  const campo = $('#foto');
  Object.defineProperty(campo, 'files', { value: [archivo], configurable: true });
  campo.dispatchEvent(new Event('change'));
}

beforeEach(async () => {
  // Página nueva en cada prueba: el HTML de perfil.html (sus <script> no se ejecutan así)
  // y después api.js y perfil.js en el ámbito global, como los carga el navegador
  document.documentElement.innerHTML = HTML;
  window.fetch = jest.fn()
    .mockReturnValueOnce(respuesta(200, PERFIL)) // GET /api/perfil al cargar
    .mockReturnValueOnce(respuesta(200, [])); // GET /api/amistades/solicitudes al cargar
  cargarScripts(SCRIPTS);
  await terminar();
});

test('al cargar se ve la foto guardada', () => {
  expect($('#foto-perfil').getAttribute('src')).toBe(FOTO_ANTERIOR);
});

test('al elegir una foto se sube sola, sin pulsar ningún botón, y se ve la nueva', async () => {
  window.fetch.mockReturnValueOnce(respuesta(200, { ...PERFIL, foto: FOTO_NUEVA }));
  const archivo = new File(['contenido'], 'nueva.jpg', { type: 'image/jpeg' });

  elegirFoto(archivo);
  await terminar();

  const [ruta, opciones] = window.fetch.mock.calls.at(-1);
  expect(ruta).toBe('/api/perfil/foto');
  expect(opciones.method).toBe('PUT');
  expect(opciones.body.get('foto')).toBe(archivo);
  expect($('#foto-perfil').getAttribute('src')).toBe(FOTO_NUEVA);
  expect(visible('#exito-foto')).toBe('Foto actualizada.');
  expect($('#foto').disabled).toBe(false);
});

test('mientras se sube, el campo está desactivado e indica que se está subiendo', async () => {
  window.fetch.mockReturnValueOnce(new Promise(() => {})); // el servidor no contesta todavía

  elegirFoto(new File(['contenido'], 'nueva.png', { type: 'image/png' }));
  await terminar();

  expect($('#foto').disabled).toBe(true);
  expect($('#ayuda-foto').textContent).toBe('Subiendo foto...');
});

test('si el servidor la rechaza, muestra el motivo y se queda la foto anterior', async () => {
  window.fetch.mockReturnValueOnce(respuesta(400, { error: 'La foto no puede superar los 5 MB' }));

  elegirFoto(new File(['contenido'], 'enorme.png', { type: 'image/png' }));
  await terminar();

  expect(visible('#error-foto')).toBe('La foto no puede superar los 5 MB');
  expect(visible('#exito-foto')).toBeNull();
  expect($('#foto-perfil').getAttribute('src')).toBe(FOTO_ANTERIOR);
  expect($('#foto').disabled).toBe(false);
  expect($('#ayuda-foto').textContent).toBe('Se guarda en cuanto la eliges.');
});
