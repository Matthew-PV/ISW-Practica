
/**
 * @jest-environment jsdom
 */

// Formulario de crear y editar experiencias en Mis planes.
// C1-C9: ciudad, categoría, momento, visibilidad, vista previa,
// contador, descarte de cambios, edición y creación.
// CS-53: duración y tarifa.
// Navegador simulado con jsdom y servidor simulado con fetch.

const { leer, cargarScripts } = require('../helpers/pantalla');

const HTML = leer('paginas/cuenta/mis-planes.html');
const SCRIPTS = [
  'js/shared/api.js',
  'js/shared/pantalla.js',
  'js/cuenta/mis-planes.js',
];

const PERFIL = {
  id: 1,
  nombreUsuario: 'ana',
  ciudad: 'Madrid',
};

const CIUDADES = [
  { id: 1, nombre: 'Algiers', pais: 'Argelia' },
  { id: 2, nombre: 'Lisbon', pais: 'Portugal' },
  { id: 3, nombre: 'Madrid', pais: 'España' },
  { id: 4, nombre: 'Paris', pais: 'Francia' },
];

const OPCIONES = {
  categorias: [
    'Gastronomía',
    'Cultura',
    'Naturaleza',
    'Noche',
    'Deporte',
    'Rincones',
  ],
  momentos: [
    {
      grupo: 'Franja del día',
      valores: ['Por la mañana', 'Atardecer'],
    },
    {
      grupo: 'Estación',
      valores: ['Verano'],
    },
  ],
};

const EXPERIENCIA = {
  id: 10,
  titulo: 'Paseo en barca',
  descripcion: 'Una hora por el Tajo',
  ciudadId: 2,
  ciudad: {
    id: 2,
    nombre: 'Lisbon',
    pais: 'Portugal',
  },
  tipo: 'Naturaleza',
  momentoAdecuado: 'Atardecer',
  visibilidad: 'AMIGOS',
  duracionMinutos: 180,
  tarifa: '25.50',
};

const respuesta = (status, cuerpo) =>
  Promise.resolve({
    ok: status < 400,
    status,
    json: async () => cuerpo,
  });

const $ = (selector) => document.querySelector(selector);

const terminar = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const marcado = (nombre) =>
  $(`input[name="${nombre}"]:checked`)?.value;

const escribir = (selector, texto) => {
  $(selector).value = texto;
  $(selector).dispatchEvent(
    new Event('input', { bubbles: true })
  );
};

const elegir = (nombre, valor) => {
  const opcion = $(
    `input[name="${nombre}"][value="${valor}"]`
  );

  opcion.checked = true;

  opcion.dispatchEvent(
    new Event('change', { bubbles: true })
  );
};

const enviar = () =>
  $('#form-experiencia').dispatchEvent(
    new Event('submit', {
      bubbles: true,
      cancelable: true,
    })
  );

let creada;

// Simulación del navegador y las respuestas de la API.
async function abrir(busqueda = '') {
  window.history.replaceState(
    {},
    '',
    `/paginas/cuenta/mis-planes.html${busqueda}`
  );

  document.documentElement.innerHTML = HTML;

  for (const dialogo of document.querySelectorAll('dialog')) {
    dialogo.showModal = jest.fn(() => {
      dialogo.open = true;
    });

    dialogo.close = jest.fn(() => {
      dialogo.open = false;
    });
  }

  creada = {
    ...EXPERIENCIA,
    id: 99,
    titulo: 'Mercadillo',
    ciudadId: 3,
    ciudad: CIUDADES[2],
    tipo: 'Rincones',
  };

  window.fetch = jest.fn((ruta, opciones = {}) => {
    if (ruta === '/api/perfil') {
      return respuesta(200, PERFIL);
    }

    if (ruta === '/api/ciudades') {
      return respuesta(200, CIUDADES);
    }

    if (ruta === '/api/experiencias/opciones') {
      return respuesta(200, OPCIONES);
    }

    if (ruta === '/api/experiencias?autor=ana') {
      return respuesta(200, {
        experiencias: [EXPERIENCIA],
        siguiente: null,
      });
    }

    if (ruta === '/api/experiencias/10' && !opciones.method) {
      return respuesta(200, EXPERIENCIA);
    }

    if (ruta === '/api/experiencias/10') {
      return respuesta(200, {
        ...EXPERIENCIA,
        ...JSON.parse(opciones.body),
      });
    }

    if (ruta === '/api/experiencias') {
      return respuesta(201, creada);
    }

    throw new Error(`Petición inesperada: ${ruta}`);
  });

  cargarScripts(SCRIPTS);

  await terminar();
  await terminar();
  await terminar();
}

const cuerpoEnviado = () =>
  JSON.parse(
    window.fetch.mock.calls.find(
      ([, opciones]) => opciones?.method
    )[1].body
  );

// =====================================================
// C1: CIUDAD CON AUTOCOMPLETADO
// =====================================================

describe('C1: ciudad con autocompletado', () => {
  beforeEach(() => abrir());

  test('una experiencia nueva propone la ciudad del perfil', () => {
    $('#boton-nueva').click();

    expect($('#ciudad').value).toBe('Madrid (España)');
  });

  test('la lista sugiere primero la ciudad del perfil y las ya usadas', () => {
    const sugerencias = [
      ...document.querySelectorAll('#lista-ciudades option'),
    ].map((opcion) => opcion.value);

    expect(sugerencias).toEqual([
      'Madrid (España)',
      'Lisbon (Portugal)',
      'Algiers (Argelia)',
      'Paris (Francia)',
    ]);
  });

  test('al enviar se manda el id de la ciudad escrita', async () => {
    $('#boton-nueva').click();

    escribir('#titulo', 'Mercadillo');
    escribir('#descripcion', 'Puestos de segunda mano');
    elegir('tipo', 'Rincones');
    escribir('#ciudad', 'Paris (Francia)');

    enviar();
    await terminar();

    expect(cuerpoEnviado()).toMatchObject({
      ciudadId: 4,
      tipo: 'Rincones',
    });
  });

  test('una ciudad inexistente se marca y no se envía', async () => {
    $('#boton-nueva').click();

    escribir('#ciudad', 'Atlántida');

    enviar();
    await terminar();

    expect(
      $('#ciudad').getAttribute('aria-invalid')
    ).toBe('true');

    expect(
      $('#mensaje-ciudad').textContent
    ).toMatch(/elige una ciudad de la lista/i);

    expect(
      window.fetch.mock.calls.some(
        ([, opciones]) => opciones?.method
      )
    ).toBe(false);
  });
});

// =====================================================
// C2, C3, C4: CATEGORÍA, MOMENTO Y VISIBILIDAD
// =====================================================

describe('C2, C3 y C4: categoría, momento y visibilidad', () => {
  beforeEach(() => abrir());

  test('hay una etiqueta por categoría y es obligatorio elegir una', () => {
    const categorias = [
      ...document.querySelectorAll('input[name="tipo"]'),
    ];

    expect(
      categorias.map((opcion) => opcion.value)
    ).toEqual(OPCIONES.categorias);

    expect(
      categorias[0].closest('label').dataset.categoria
    ).toBe('gastronomia');

    expect(categorias[0].required).toBe(true);
  });

  test('los momentos se agrupan y existe Sin indicar', () => {
    $('#boton-nueva').click();

    const grupos = [
      ...document.querySelectorAll(
        '#opciones-momento .grupo-momento-titulo'
      ),
    ].map((titulo) => titulo.textContent);

    expect(grupos).toEqual([
      'Franja del día',
      'Estación',
    ]);

    expect(marcado('momentoAdecuado')).toBe('');
  });

  test('la visibilidad ofrece tres opciones y Pública por defecto', () => {
    $('#boton-nueva').click();

    const opciones = [
      ...document.querySelectorAll(
        'input[name="visibilidad"]'
      ),
    ];

    expect(
      opciones.map((opcion) => opcion.value)
    ).toEqual([
      'PUBLICA',
      'AMIGOS',
      'PRIVADA',
    ]);

    expect(marcado('visibilidad')).toBe('PUBLICA');

    expect(
      opciones[2].closest('label').textContent
    ).toContain('Solo tú');
  });

  test('al editar se recuperan las opciones guardadas', () => {
    $('.tarjeta-experiencia .boton-editar').click();

    expect(marcado('tipo')).toBe('Naturaleza');
    expect(marcado('momentoAdecuado')).toBe('Atardecer');
    expect(marcado('visibilidad')).toBe('AMIGOS');
    expect($('#ciudad').value).toBe('Lisbon (Portugal)');
  });

  test('el orden incluye duración y tarifa de CS-53', () => {
    const orden = [
      ...document.querySelectorAll(
        '#form-experiencia [data-campo]'
      ),
    ].map((campo) => campo.dataset.campo);

    expect(orden).toEqual([
      'titulo',
      'tipo',
      'ciudad',
      'descripcion',
      'duracionMinutos',
      'tarifa',
      'momentoAdecuado',
      'visibilidad',
    ]);
  });
});

// =====================================================
// CS-53: DURACIÓN Y TARIFA
// =====================================================

describe('CS-53: duración y tarifa', () => {
  beforeEach(() => abrir());

  test('los campos existen con los límites correctos', () => {
    expect($('#duracion-minutos')).not.toBeNull();
    expect($('#tarifa')).not.toBeNull();

    expect($('#duracion-minutos').min).toBe('1');
    expect($('#duracion-minutos').step).toBe('1');

    expect($('#tarifa').min).toBe('0');
    expect($('#tarifa').step).toBe('0.01');
  });

  test('al crear se envían duración y tarifa a la API', async () => {
    $('#boton-nueva').click();

    escribir('#titulo', 'Ruta cultural');
    escribir('#descripcion', 'Recorrido guiado');
    elegir('tipo', 'Cultura');
    escribir('#duracion-minutos', '180');
    escribir('#tarifa', '25.50');

    enviar();
    await terminar();

    expect(cuerpoEnviado()).toMatchObject({
      duracionMinutos: 180,
      tarifa: '25.50',
    });
  });

  test('al editar se recuperan los valores guardados', () => {
    $('.tarjeta-experiencia .boton-editar').click();

    expect($('#duracion-minutos').value).toBe('180');
    expect(Number($('#tarifa').value)).toBe(25.5);
  });

  test('la vista previa muestra duración y tarifa', () => {
    $('#boton-nueva').click();

    escribir('#duracion-minutos', '90');
    escribir('#tarifa', '12.50');

    const texto = $(
      '#vista-previa .card-subtitle'
    ).textContent;

    expect(texto).toContain('90 min');
    expect(texto).toContain('12,50');
  });

  test('los campos son opcionales y se envían como null', async () => {
    $('#boton-nueva').click();

    escribir('#titulo', 'Paseo gratuito');
    escribir(
      '#descripcion',
      'Paseo sin duración especificada'
    );
    elegir('tipo', 'Naturaleza');

    enviar();
    await terminar();

    expect(cuerpoEnviado()).toMatchObject({
      duracionMinutos: null,
      tarifa: null,
    });
  });
});

// =====================================================
// C5 Y C6: VISTA PREVIA Y DESCRIPCIÓN
// =====================================================

describe('C5 y C6: vista previa y descripción', () => {
  beforeEach(() => abrir());

  test('la vista previa se actualiza al escribir', () => {
    $('#boton-nueva').click();

    escribir('#titulo', 'Escalada en la Pedriza');
    elegir('tipo', 'Deporte');

    const tarjeta = $(
      '#vista-previa .tarjeta-experiencia'
    );

    expect(
      tarjeta.querySelector('.card-title').textContent
    ).toBe('Escalada en la Pedriza');

    expect(
      tarjeta.querySelector('.bloque-categoria')
        .dataset.categoria
    ).toBe('deporte');

    expect(tarjeta.querySelector('button')).toBeNull();
  });

  test('la descripción tiene pista y contador', () => {
    $('#boton-nueva').click();

    escribir('#descripcion', 'Lleva agua');

    expect(
      $('#contador-descripcion').textContent
    ).toBe('10 caracteres');

    expect(
      $('#descripcion').getAttribute('aria-describedby')
    ).toContain('ayuda-descripcion');
  });
});

// =====================================================
// C7: NO PERDER CAMBIOS
// =====================================================

describe('C7: no perder lo escrito', () => {
  beforeEach(() => abrir());

  test('Cancelar sin cambios cierra sin preguntar', () => {
    $('#boton-nueva').click();
    $('#boton-cancelar').click();

    expect(
      $('#dialogo-experiencia').close
    ).toHaveBeenCalled();

    expect(
      $('#dialogo-descartar').showModal
    ).not.toHaveBeenCalled();
  });

  test('Cancelar con cambios permite seguir editando', () => {
    $('#boton-nueva').click();
    escribir('#titulo', 'Algo a medias');

    $('#boton-cancelar').click();

    expect(
      $('#dialogo-descartar').showModal
    ).toHaveBeenCalled();

    expect(
      $('#dialogo-experiencia').close
    ).not.toHaveBeenCalled();

    $('#seguir-editando').click();

    expect($('#titulo').value).toBe('Algo a medias');

    expect(
      $('#dialogo-experiencia').close
    ).not.toHaveBeenCalled();
  });

  test('Esc pregunta antes de descartar', () => {
    $('#boton-nueva').click();
    escribir('#titulo', 'Algo a medias');

    const esc = new Event('cancel', {
      cancelable: true,
    });

    $('#dialogo-experiencia').dispatchEvent(esc);

    expect(esc.defaultPrevented).toBe(true);

    expect(
      $('#dialogo-descartar').showModal
    ).toHaveBeenCalled();
  });

  test('Descartar cierra el formulario', () => {
    $('#boton-nueva').click();
    escribir('#titulo', 'Algo a medias');
    $('#boton-cancelar').click();
    $('#confirmar-descartar').click();

    expect(
      $('#dialogo-experiencia').close
    ).toHaveBeenCalled();
  });
});

// =====================================================
// C8: EDITAR DESDE EL DETALLE
// =====================================================

describe('C8: editar desde el detalle', () => {
  const locationReal = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: locationReal,
      configurable: true,
      writable: true,
    });
  });

  const vigilarNavegacion = () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/paginas/cuenta/mis-planes.html',
        search: '',
        href: 'http://localhost/paginas/cuenta/mis-planes.html',
      },
      configurable: true,
      writable: true,
    });
  };

  test('editar y guardar vuelve al detalle', async () => {
    await abrir('?editar=10');

    expect(window.location.search).toBe('');

    vigilarNavegacion();
    enviar();
    await terminar();

    expect(window.location.href).toBe(
      '/paginas/experiencias/experiencia.html?id=10'
    );
  });

  test('editar y cancelar vuelve al detalle', async () => {
    await abrir('?editar=10');

    vigilarNavegacion();
    $('#boton-cancelar').click();

    expect(window.location.href).toBe(
      '/paginas/experiencias/experiencia.html?id=10'
    );
  });

  test('nuevo abre formulario y limpia la URL', async () => {
    await abrir('?nuevo=1');

    expect(
      $('#dialogo-experiencia').showModal
    ).toHaveBeenCalled();

    expect(window.location.search).toBe('');
  });
});

// =====================================================
// C9: AVISO TRAS CREAR
// =====================================================

describe('C9: tras crear', () => {
  beforeEach(() => abrir());

  test('aparece aviso con enlace y foco tras publicar', async () => {
    $('#boton-nueva').click();

    escribir('#titulo', 'Mercadillo');
    escribir('#descripcion', 'Puestos de segunda mano');
    elegir('tipo', 'Rincones');

    enviar();
    await terminar();

    const aviso = $('#aviso-creada');

    expect(
      aviso.classList.contains('d-none')
    ).toBe(false);

    const enlace = aviso.querySelector('a');

    expect(enlace.textContent).toBe('Ver plan');

    expect(enlace.getAttribute('href')).toBe(
      '/paginas/experiencias/experiencia.html?id=99'
    );

    expect(document.activeElement).toBe(enlace);

    expect(
      $('#cargando').textContent
    ).not.toContain('Cargando');
  });

  test('el botón cambia entre Publicar y Guardar', () => {
    $('#boton-nueva').click();

    expect(
      $('#form-experiencia button[type="submit"]')
        .textContent.trim()
    ).toBe('Publicar plan');

    $('.tarjeta-experiencia .boton-editar').click();

    expect(
      $('#form-experiencia button[type="submit"]')
        .textContent.trim()
    ).toBe('Guardar cambios');
  });
});
