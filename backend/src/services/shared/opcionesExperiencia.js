// Valores permitidos de la categoría (`tipo`, CS-55) y del momento adecuado (CS-56) de una experiencia.
// Es la única lista: el servicio valida con ella y el formulario la pide a GET /api/experiencias/opciones.
// Capa: servicios (services/shared).
// Lo usa: services/experienciaService.js.

// Las mismas categorías que filtra Explorar; el frontend les da icono y color.
const CATEGORIAS = ['Gastronomía', 'Cultura', 'Naturaleza', 'Noche', 'Deporte', 'Rincones'];

// Agrupados para mostrarlos por bloques en el formulario; se guarda uno solo.
const MOMENTOS = [
  { grupo: 'Franja del día', valores: ['Por la mañana', 'Mediodía', 'Por la tarde', 'Atardecer', 'Noche'] },
  { grupo: 'Día de la semana', valores: ['Entre semana', 'Fin de semana'] },
  { grupo: 'Estación', valores: ['Primavera', 'Verano', 'Otoño', 'Invierno'] },
];

module.exports = { CATEGORIAS, MOMENTOS };
