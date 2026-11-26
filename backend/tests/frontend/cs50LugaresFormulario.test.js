/**
 * @jest-environment jsdom
 */

// CS-50: buscar lugares y añadirlos a un plan en el formulario de Mis planes.
// Navegador simulado con jsdom; el servidor y los ficheros de datos, con fetch.

const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('paginas/cuenta/mis-planes.html');
const SCRIPTS = ['js/shared/api.js', 'js/shared/pantalla.js', 'js/shared/lugares.js', 'js/shared/mapa.js', 'js/shared/planes.js', 'js/cuenta/mis-planes.js'];

const CIUDADES = [
  { id: 2, nombre: 'Lisbon', pais: 'Portugal' },
  { id: 3, nombre: 'Madrid', pais: 'España' },
];

const lugar = (clave, nombre, extra = {}) => ({
  proveedorId: clave,
  nombre,
  tipo: 'Monumento',
  direccion: `Calle de ${nombre}`,
  lat: 40.4,
  lon: -3.7,
  imagen: null,
  web: null,
  ...extra,
});

const PALACIO = lugar('p', 'Palacio Real', {
  imagen: 'https://upload.wikimedia.org/palacio.jpg',
  web: 'https://www.patrimonionacional.es',
});
const GRAN_VIA = lugar('g', 'Gran Vía', { tipo: 'Calle' });
const TRAMPA = lugar('t', '<img src=x onerror=alert(1)>', { web: 'javascript:alert(1)' });

const DATOS = { ciudad: { nombre: 'Madrid', pais: 'España' }, lugares: [PALACIO, GRAN_VIA, TRAMPA] };
const DE_PLANES = { 'Paseo por el centro': [{ ...GRAN_VIA, id: 1, nota: 'De noche' }] };

const PLAN = {
  id: 10,
  titulo: 'Paseo por el centro',
  descripcion: 'Andando',
  ciudadId: 3,
  ciudad: CIUDADES[1],
  tipo: 'Cultura',
  visibilidad: 'PUBLICA',
};

const respuesta = (status, cuerpo) => Promise.resolve({ ok: status < 400, status, json: async () => cuerpo });
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const terminar = async () => {
  for (let i = 0; i < 3; i++) await new Promise((resolve) => setTimeout(resolve, 0));
};
const escribir = (selector, texto) => {
  $(selector).value = texto;
  $(selector).dispatchEvent(new Event('input', { bubbles: true }));
};
const boton = (raiz, texto) => [...raiz.querySelectorAll('button')].find((b) => b.textContent === texto);
const resultados = () => $$('#resultados-lugares .ficha-lugar');
const elegidos = () => $$('#lugares-elegidos .ficha-lugar');
const nombres = (fichas) => fichas.map((ficha) => ficha.querySelector('.ficha-lugar-nombre').textContent);

async function abrir({ fallaPlanes = false } = {}) {
  window.history.replaceState({}, '', '/paginas/cuenta/mis-planes.html');
  document.documentElement.innerHTML = HTML;
  for (const dialogo of document.querySelectorAll('dialog')) {
    dialogo.showModal = jest.fn(() => { dialogo.open = true; });
    dialogo.close = jest.fn(() => { dialogo.open = false; });
  }
  window.fetch = jest.fn((ruta, opciones = {}) => {
    if (ruta === '/datos/lugares-madrid.json') return respuesta(200, DATOS);
    if (ruta === '/datos/lugares-planes.json') return fallaPlanes ? respuesta(500, null) : respuesta(200, DE_PLANES);
    if (ruta === '/api/perfil') return respuesta(200, { nombreUsuario: 'ana', ciudad: 'Madrid' });
    if (ruta === '/api/ciudades') return respuesta(200, CIUDADES);
    if (ruta === '/api/experiencias/opciones') return respuesta(200, { categorias: ['Cultura'], momentos: [] });
    if (ruta === '/api/experiencias?autor=ana') return respuesta(200, { experiencias: [PLAN], siguiente: null });
    if (ruta === '/api/experiencias/10') return respuesta(200, { ...PLAN, ...JSON.parse(opciones.body) });
    if (ruta === '/api/experiencias') return respuesta(201, { ...PLAN, id: 99 });
    throw new Error(`Petición inesperada: ${ruta}`);
  });
  cargarScripts(SCRIPTS);
  await terminar();
}

async function buscar(texto) {
  escribir('#buscar-lugar', texto);
  $('#boton-buscar-lugar').click();
  await terminar();
}

async function anadir(texto) {
  await buscar(texto);
  boton(resultados()[0], 'Añadir').click();
}

async function nuevoPlan() {
  $('#boton-nueva').click();
  escribir('#titulo', 'Mi plan');
  escribir('#descripcion', 'Texto');
  $('input[name="tipo"]').checked = true;
}

async function editarPlan() {
  boton(document, 'Editar').click();
  await terminar();
}

async function enviar() {
  $('#form-experiencia').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await terminar();
}

const llamadaDeGuardado = () => window.fetch.mock.calls.find(([, opciones]) => opciones?.method);
const cuerpo = () => JSON.parse(llamadaDeGuardado()[1].body);

describe('CS-50: buscar lugares', () => {
  beforeEach(async () => {
    await abrir();
    await nuevoPlan();
  });

  test('muestra la ficha de los lugares que coinciden, sin distinguir mayúsculas ni tildes', async () => {
    await buscar('gran via');

    expect(nombres(resultados())).toEqual(['Gran Vía']);
    expect(resultados()[0].textContent).toContain('Calle · Calle de Gran Vía');
  });

  test('la ficha lleva imagen y enlace a la web cuando el lugar los tiene', async () => {
    await buscar('palacio');

    const ficha = resultados()[0];
    expect(ficha.querySelector('img').getAttribute('src')).toBe(PALACIO.imagen);
    const enlace = ficha.querySelector('a');
    expect(enlace.getAttribute('href')).toBe(PALACIO.web);
    expect(enlace.getAttribute('rel')).toBe('noopener noreferrer');
  });

  test('el nombre se escribe como texto y una web que no es http(s) no se enlaza', async () => {
    await buscar('onerror');

    expect(resultados()[0].querySelector('img')).toBeNull();
    expect(resultados()[0].querySelector('a')).toBeNull();
    expect(nombres(resultados())).toEqual([TRAMPA.nombre]);
  });

  test('en una ciudad sin ese lugar avisa de que no hay resultados', async () => {
    escribir('#ciudad', 'Lisbon (Portugal)');
    await buscar('palacio');

    expect(resultados()).toHaveLength(0);
    expect($('#mensaje-lugares').textContent).toBe('No hay lugares con ese nombre en Lisbon.');
  });

  test('sin ciudad válida pide elegirla', async () => {
    escribir('#ciudad', '');
    await buscar('palacio');

    expect($('#mensaje-lugares').textContent).toBe('Elige primero la ciudad del plan.');
  });

  test('Intro en el buscador busca sin publicar el plan', async () => {
    escribir('#buscar-lugar', 'palacio');
    const intro = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    $('#buscar-lugar').dispatchEvent(intro);
    await terminar();

    expect(intro.defaultPrevented).toBe(true);
    expect(resultados()).toHaveLength(1);
  });
});

describe('CS-50: lugares elegidos', () => {
  beforeEach(async () => {
    await abrir();
    await nuevoPlan();
    await anadir('palacio');
    await anadir('gran');
  });

  test('se añaden en orden y no se pueden repetir', async () => {
    await buscar('gran');

    expect(nombres(elegidos())).toEqual(['Palacio Real', 'Gran Vía']);
    expect(boton(resultados()[0], 'Añadido').disabled).toBe(true);
  });

  test('se pueden reordenar y quitar', () => {
    boton(elegidos()[1], 'Subir').click();
    expect(nombres(elegidos())).toEqual(['Gran Vía', 'Palacio Real']);

    boton(elegidos()[0], 'Bajar').click();
    boton(elegidos()[0], 'Quitar').click();
    expect(nombres(elegidos())).toEqual(['Gran Vía']);
  });

  test('el plan se envía con los lugares, su orden y su nota', async () => {
    const nota = elegidos()[0].querySelector('textarea');
    expect(nota.maxLength).toBe(300);
    nota.value = '  Entrada por la plaza  ';
    nota.dispatchEvent(new Event('input', { bubbles: true }));

    await enviar();

    expect(cuerpo().lugares).toEqual([
      { ...PALACIO, nota: 'Entrada por la plaza' },
      { ...GRAN_VIA, nota: '' },
    ]);
  });

  test('si se cambia de ciudad no se envía hasta quitar los lugares de la anterior', async () => {
    escribir('#ciudad', 'Lisbon (Portugal)');
    await enviar();

    expect(llamadaDeGuardado()).toBeUndefined();
    expect($('#mensaje-lugares').textContent).toBe('Estos lugares son de Madrid: quítalos o vuelve a esa ciudad.');
  });

  test('cerrar con lugares sin guardar pide confirmación', () => {
    $('#boton-cancelar').click();

    expect($('#dialogo-descartar').open).toBe(true);
  });

  test('un plan nuevo empieza sin los lugares del anterior', () => {
    $('#boton-nueva').click();

    expect(elegidos()).toHaveLength(0);
  });
});

describe('CS-50: sin lugares y al editar', () => {
  test('un plan nuevo sin lugares no envía el campo', async () => {
    await abrir();
    await nuevoPlan();
    await enviar();

    expect(cuerpo()).not.toHaveProperty('lugares');
  });

  test('al editar se cargan los lugares del plan, sin contarlo como cambio', async () => {
    await abrir();
    await editarPlan();

    expect(nombres(elegidos())).toEqual(['Gran Vía']);
    expect(elegidos()[0].querySelector('textarea').value).toBe('De noche');
    $('#boton-cancelar').click();
    expect($('#dialogo-descartar').open).toBeFalsy();
  });

  test('al quitarlos todos se envía la lista vacía', async () => {
    await abrir();
    await editarPlan();
    boton(elegidos()[0], 'Quitar').click();
    await enviar();

    expect(cuerpo().lugares).toEqual([]);
  });

  test('si no se pueden cargar, avisa y guarda el plan sin tocar sus lugares', async () => {
    await abrir({ fallaPlanes: true });
    await editarPlan();

    expect($('#mensaje-lugares').textContent).toBe('No se han podido cargar los lugares.');
    expect($('#boton-buscar-lugar').disabled).toBe(true);
    await enviar();
    expect(cuerpo()).not.toHaveProperty('lugares');
  });
});
