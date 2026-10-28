// Planes de ejemplo para las pantallas de descubrimiento (Inicio y Explorar) mientras no existe una
// consulta del backend que los devuelva. Son solo de presentación: no tienen id ni enlace a un detalle.
// Lo usan: js/bienvenida.js y js/explorar.js. Usa `crearBloqueCategoria` de shared/pantalla.js, que se
// carga antes.

const PLANES_EJEMPLO = [
  { titulo: 'Tapas por La Latina', ciudad: 'Madrid', tipo: 'Tapas', autor: 'lucia', descripcion: 'Ruta de cuatro bares de la Cava Baja con una caña y una tapa en cada uno.' },
  { titulo: 'Tarde en el Museo del Prado', ciudad: 'Madrid', tipo: 'Museo', autor: 'marcos', descripcion: 'Entrada gratuita las dos últimas horas y paseo después por el Retiro.' },
  { titulo: 'Atardecer en el Templo de Debod', ciudad: 'Madrid', tipo: 'Rincones', autor: 'ana', descripcion: 'Llegar una hora antes, sentarse en la hierba y esperar a que se encienda el cielo.' },
  { titulo: 'Senderismo a La Pedriza', ciudad: 'Madrid', tipo: 'Senderismo', autor: 'diego', descripcion: 'Ruta circular de media jornada con vistas al Yelmo. Lleva agua y calzado de monte.' },
  { titulo: 'Concierto en una sala pequeña', ciudad: 'Madrid', tipo: 'Concierto', autor: 'noa', descripcion: 'Buscar una sala de Malasaña con música en directo un jueves y dejarse sorprender.' },
  { titulo: 'Partido de pádel con amigos', ciudad: 'Madrid', tipo: 'Pádel', autor: 'sergio', descripcion: 'Reservar pista de dos horas y terminar con unas cañas en la terraza del club.' },
  { titulo: 'Brunch de domingo en Chueca', ciudad: 'Madrid', tipo: 'Brunch', autor: 'lucia', descripcion: 'Una cafetería con tostadas, huevos y zumo natural. Mejor reservar antes de las 11.' },
  { titulo: 'Exposición en el Reina Sofía', ciudad: 'Madrid', tipo: 'Exposición', autor: 'marcos', descripcion: 'Empezar por el Guernica y subir luego a la terraza de la cafetería.' },
  { titulo: 'Paseo por el Parque del Oeste', ciudad: 'Madrid', tipo: 'Parque', autor: 'ana', descripcion: 'Rosaleda, teleférico y puesta de sol. Ideal para ir en pareja o con perro.' },
  { titulo: 'Copas en una azotea', ciudad: 'Madrid', tipo: 'Copas', autor: 'noa', descripcion: 'Una azotea del centro con vistas a la Gran Vía. Llegar pronto para tener sitio.' },
  { titulo: 'Ruta en bici por Madrid Río', ciudad: 'Madrid', tipo: 'Bici', autor: 'diego', descripcion: 'Doce kilómetros llanos junto al Manzanares, con parada para un helado.' },
  { titulo: 'Cena de vinos y quesos', ciudad: 'Madrid', tipo: 'Vino', autor: 'sergio', descripcion: 'Una vinoteca pequeña con tabla de quesos y copa recomendada por el sumiller.' },
];

// Tarjeta de un plan de ejemplo (misma apariencia que las de experiencias). `ciudad` sustituye a la del
// plan cuando una tira quiere mostrar la ciudad de la persona. `indice` escalona su animación de entrada.
// Los textos se incorporan con textContent.
function crearTarjetaPlan(plan, ciudad, indice = 0) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'card tarjeta-experiencia tarjeta-plan';
  tarjeta.style.setProperty('--i', indice);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body d-flex flex-column';

  const titulo = document.createElement('h3');
  titulo.className = 'card-title h6';
  titulo.textContent = plan.titulo;

  const subtitulo = document.createElement('p');
  subtitulo.className = 'card-subtitle small text-body-secondary mb-2';
  subtitulo.textContent = [ciudad ?? plan.ciudad, plan.tipo].join(' · ');

  const descripcion = document.createElement('p');
  descripcion.className = 'card-text small descripcion-corta';
  descripcion.textContent = plan.descripcion;

  const autor = document.createElement('p');
  autor.className = 'small text-body-secondary mt-auto mb-0';
  autor.textContent = `Por ${plan.autor}`;

  cuerpo.append(titulo, subtitulo, descripcion, autor);
  tarjeta.append(crearBloqueCategoria(plan.tipo), cuerpo);
  return tarjeta;
}

Object.assign(window, { PLANES_EJEMPLO, crearTarjetaPlan });
