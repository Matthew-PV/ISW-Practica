/**
 * @jest-environment jsdom
 */

// Formulario de crear y editar una experiencia en Mis planes (C1-C9 del replanteamiento):
// ciudad con autocompletado (C1), categoría (CS-55) y momento (CS-56) como etiquetas, visibilidad
// en tarjetas (C4), vista previa (C5), contador (C6), aviso al descartar (C7), vuelta al detalle (C8)
// y aviso tras crear (C9). Se simula el navegador con jsdom y el servidor con fetch.

const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('cuenta/mis-planes.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/mis-planes.js'];

const PERFIL = { id: 1, nombreUsuario: 'ana', ciudad: 'Madrid' };
const CIUDADES = [
  { id: 1, nombre: 'Algiers', pais: 'Argelia' },
  { id: 2, nombre: 'Lisbon', pais: 'Portugal' },
  { id: 3, nombre: 'Madrid', pais: 'España' },
  { id: 4, nombre: 'Paris', pais: 'Francia' },
];
const OPCIONES = {
  categorias: ['Gastronomía', 'Cultura', 'Naturaleza', 'Noche', 'Deporte', 'Rincones'],
  momentos: [
    { grupo: 'Franja del día', valores: ['Por la mañana', 'Atardecer'] },
    { grupo: 'Estación', valores: ['Verano'] },
  ],
};
const EXPERIENCIA = {
  id: 10, titulo: 'Paseo en barca', descripcion: 'Una hora por el Tajo', ciudadId: 2,
  ciudad: { id: 2, nombre: 'Lisbon', pais: 'Portugal' }, tipo: 'Naturaleza', momentoAdecuado: 'Atardecer', visibilidad: 'AMIGOS',
};

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const terminar = () => new Promise((resolve) => { setTimeout(resolve, 0); });
const marcado = (nombre) => $(`input[name="${nombre}"]:checked`)?.value;
const escribir = (selector, texto) => {
  $(selector).value = texto;
  $(selector).dispatchEvent(new Event('input', { bubbles: true }));
};
const elegir = (nombre, valor) => {
  const opcion = $(`input[name="${nombre}"][value="${valor}"]`);
  opcion.checked = true;
  opcion.dispatchEvent(new Event('change', { bubbles: true }));
};
const enviar = () => $('#form-experiencia').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

let creada;

// Carga la página con `busqueda` en la URL (?nuevo=1, ?editar=10...)
async function abrir(busqueda = '') {
  window.history.replaceState({}, '', `/cuenta/mis-planes.html${busqueda}`);
  document.documentElement.innerHTML = HTML;
  // jsdom no implementa <dialog>: se simula abrir y cerrar con el atributo open
  for (const dialogo of document.querySelectorAll('dialog')) {
    dialogo.showModal = jest.fn(() => { dialogo.open = true; });
    dialogo.close = jest.fn(() => { dialogo.open = false; });
  }
  creada = { ...EXPERIENCIA, id: 99, titulo: 'Mercadillo', ciudadId: 3, ciudad: CIUDADES[2], tipo: 'Rincones' };
  window.fetch = jest.fn((ruta, opciones = {}) => {
    if (ruta === '/api/perfil') return respuesta(200, PERFIL);
    if (ruta === '/api/ciudades') return respuesta(200, CIUDADES);
    if (ruta === '/api/experiencias/opciones') return respuesta(200, OPCIONES);
    if (ruta === '/api/experiencias?autor=ana') return respuesta(200, { experiencias: [EXPERIENCIA], siguiente: null });
    if (ruta === '/api/experiencias/10' && !opciones.method) return respuesta(200, EXPERIENCIA);
    if (ruta === '/api/experiencias/10') return respuesta(200, { ...EXPERIENCIA, ...JSON.parse(opciones.body) });
    if (ruta === '/api/experiencias') return respuesta(201, creada);
    throw new Error(`Petición inesperada: ${ruta}`);
  });
  cargarScripts(SCRIPTS);
  await terminar();
  await terminar();
  await terminar();
}

const cuerpoEnviado = () => JSON.parse(window.fetch.mock.calls.find(([, opciones]) => opciones?.method)[1].body);

describe('C1: ciudad con autocompletado', () => {
  beforeEach(() => abrir());

  test('una experiencia nueva propone la ciudad del perfil', () => {
    $('#boton-nueva').click();

    expect($('#ciudad').value).toBe('Madrid (España)');
  });

  test('la lista sugiere primero la ciudad del perfil y las ya usadas, y después el resto', () => {
    const sugerencias = [...document.querySelectorAll('#lista-ciudades option')].map((opcion) => opcion.value);

    expect(sugerencias).toEqual(['Madrid (España)', 'Lisbon (Portugal)', 'Algiers (Argelia)', 'Paris (Francia)']);
  });

  test('al enviar se manda el id de la ciudad escrita', async () => {
    $('#boton-nueva').click();
    escribir('#titulo', 'Mercadillo');
    escribir('#descripcion', 'Puestos de segunda mano');
    elegir('tipo', 'Rincones');
    escribir('#ciudad', 'Paris (Francia)');
    enviar();
    await terminar();

    expect(cuerpoEnviado()).toMatchObject({ ciudadId: 4, tipo: 'Rincones' });
  });

  test('una ciudad que no está en el catálogo se marca en el campo y no se envía nada', async () => {
    $('#boton-nueva').click();
    escribir('#ciudad', 'Atlántida');
    enviar();
    await terminar();

    expect($('#ciudad').getAttribute('aria-invalid')).toBe('true');
    expect($('#mensaje-ciudad').textContent).toMatch(/elige una ciudad de la lista/i);
    expect(window.fetch.mock.calls.some(([, opciones]) => opciones?.method)).toBe(false);
  });
});

describe('C2, C3 y C4: categoría, momento y visibilidad como opciones visibles', () => {
  beforeEach(() => abrir());

  test('hay una etiqueta por categoría, con su color, y es obligatorio elegir una', () => {
    const categorias = [...document.querySelectorAll('input[name="tipo"]')];

    expect(categorias.map((opcion) => opcion.value)).toEqual(OPCIONES.categorias);
    expect(categorias[0].closest('label').dataset.categoria).toBe('gastronomia');
    expect(categorias[0].required).toBe(true);
  });

  test('los momentos se agrupan por bloque, con «Sin indicar» marcado al crear', () => {
    $('#boton-nueva').click();
    const grupos = [...document.querySelectorAll('#opciones-momento .grupo-momento-titulo')].map((titulo) => titulo.textContent);

    expect(grupos).toEqual(['Franja del día', 'Estación']);
    expect(marcado('momentoAdecuado')).toBe('');
  });

  test('la visibilidad son tres opciones con quién la verá, Pública por defecto', () => {
    $('#boton-nueva').click();
    const opciones = [...document.querySelectorAll('input[name="visibilidad"]')];

    expect(opciones.map((opcion) => opcion.value)).toEqual(['PUBLICA', 'AMIGOS', 'PRIVADA']);
    expect(marcado('visibilidad')).toBe('PUBLICA');
    expect(opciones[2].closest('label').textContent).toContain('Solo tú');
  });

  test('al editar quedan marcados la categoría, el momento y la visibilidad guardados', () => {
    $('.tarjeta-experiencia .boton-editar').click();

    expect(marcado('tipo')).toBe('Naturaleza');
    expect(marcado('momentoAdecuado')).toBe('Atardecer');
    expect(marcado('visibilidad')).toBe('AMIGOS');
    expect($('#ciudad').value).toBe('Lisbon (Portugal)');
  });

  test('el orden de los campos es título, categoría, ciudad, descripción, momento y visibilidad', () => {
    const orden = [...document.querySelectorAll('#form-experiencia [data-campo]')].map((campo) => campo.dataset.campo);

    expect(orden).toEqual(['titulo', 'tipo', 'ciudad', 'descripcion', 'momentoAdecuado', 'visibilidad']);
  });
});

describe('C5 y C6: vista previa y descripción', () => {
  beforeEach(() => abrir());

  test('la vista previa muestra la tarjeta con lo que se va escribiendo', () => {
    $('#boton-nueva').click();
    escribir('#titulo', 'Escalada en la Pedriza');
    elegir('tipo', 'Deporte');

    const tarjeta = $('#vista-previa .tarjeta-experiencia');
    expect(tarjeta.querySelector('.card-title').textContent).toBe('Escalada en la Pedriza');
    expect(tarjeta.querySelector('.bloque-categoria').dataset.categoria).toBe('deporte');
    expect(tarjeta.querySelector('button')).toBeNull();
  });

  test('la descripción lleva una pista y un contador de caracteres', () => {
    $('#boton-nueva').click();
    escribir('#descripcion', 'Lleva agua');

    expect($('#contador-descripcion').textContent).toBe('10 caracteres');
    expect($('#descripcion').getAttribute('aria-describedby')).toContain('ayuda-descripcion');
  });
});

describe('C7: no perder lo escrito', () => {
  beforeEach(() => abrir());

  test('sin cambios, Cancelar cierra sin preguntar', () => {
    $('#boton-nueva').click();
    $('#boton-cancelar').click();

    expect($('#dialogo-experiencia').close).toHaveBeenCalled();
    expect($('#dialogo-descartar').showModal).not.toHaveBeenCalled();
  });

  test('con cambios, Cancelar pregunta y «Seguir editando» conserva lo escrito', () => {
    $('#boton-nueva').click();
    escribir('#titulo', 'Algo a medias');
    $('#boton-cancelar').click();

    expect($('#dialogo-descartar').showModal).toHaveBeenCalled();
    expect($('#dialogo-experiencia').close).not.toHaveBeenCalled();
    $('#seguir-editando').click();
    expect($('#titulo').value).toBe('Algo a medias');
    expect($('#dialogo-experiencia').close).not.toHaveBeenCalled();
  });

  test('con cambios, Esc también pregunta en lugar de cerrar', () => {
    $('#boton-nueva').click();
    escribir('#titulo', 'Algo a medias');
    const esc = new Event('cancel', { cancelable: true });
    $('#dialogo-experiencia').dispatchEvent(esc);

    expect(esc.defaultPrevented).toBe(true);
    expect($('#dialogo-descartar').showModal).toHaveBeenCalled();
  });

  test('«Descartar» cierra el formulario', () => {
    $('#boton-nueva').click();
    escribir('#titulo', 'Algo a medias');
    $('#boton-cancelar').click();
    $('#confirmar-descartar').click();

    expect($('#dialogo-experiencia').close).toHaveBeenCalled();
  });
});

describe('C8: editar desde el detalle', () => {
  const locationReal = window.location;
  afterEach(() => {
    Object.defineProperty(window, 'location', { value: locationReal, configurable: true, writable: true });
  });

  // Sustituye location por un objeto simple para ver adónde va sin que jsdom navegue
  const vigilarNavegacion = () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/cuenta/mis-planes.html', search: '', href: 'http://localhost/cuenta/mis-planes.html' },
      configurable: true, writable: true,
    });
  };

  test('?editar= limpia la dirección y al guardar vuelve al detalle', async () => {
    await abrir('?editar=10');
    expect(window.location.search).toBe('');

    vigilarNavegacion();
    enviar();
    await terminar();

    expect(window.location.href).toBe('/experiencias/experiencia.html?id=10');
  });

  test('?editar= y cancelar sin cambios también vuelve al detalle', async () => {
    await abrir('?editar=10');
    vigilarNavegacion();
    $('#boton-cancelar').click();

    expect(window.location.href).toBe('/experiencias/experiencia.html?id=10');
  });

  test('?nuevo=1 abre el formulario y limpia la dirección para que recargar no lo reabra', async () => {
    await abrir('?nuevo=1');

    expect($('#dialogo-experiencia').showModal).toHaveBeenCalled();
    expect(window.location.search).toBe('');
  });
});

describe('C9: tras crear', () => {
  beforeEach(() => abrir());

  test('aparece un aviso con enlace a la experiencia y el foco va a él', async () => {
    $('#boton-nueva').click();
    escribir('#titulo', 'Mercadillo');
    escribir('#descripcion', 'Puestos de segunda mano');
    elegir('tipo', 'Rincones');
    enviar();
    await terminar();

    const aviso = $('#aviso-creada');
    expect(aviso.classList.contains('d-none')).toBe(false);
    const enlace = aviso.querySelector('a');
    expect(enlace.textContent).toBe('Ver plan');
    expect(enlace.getAttribute('href')).toBe('/experiencias/experiencia.html?id=99');
    expect(document.activeElement).toBe(enlace);
    expect($('#cargando').textContent).not.toContain('Cargando');
  });

  test('el botón de envío dice «Publicar plan» al crear y «Guardar cambios» al editar', () => {
    $('#boton-nueva').click();
    expect($('#form-experiencia button[type="submit"]').textContent.trim()).toBe('Publicar plan');

    $('.tarjeta-experiencia .boton-editar').click();
    expect($('#form-experiencia button[type="submit"]').textContent.trim()).toBe('Guardar cambios');
  });
});
