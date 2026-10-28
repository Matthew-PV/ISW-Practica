// Ejecutar desde backend con npm run db:seed-demo, después de las migraciones y de db:seed.
// Carga un ecosistema de demostración: usuarios con foto (subida a Cloudinary), experiencias
// en varias ciudades y de los tres niveles de visibilidad, valoraciones, amistades y seguimientos.
// Se puede repetir: antes de cargar borra los datos de demo anteriores (usuarios «demo_*» y todo
// lo suyo) y deja intacto el resto. Con --todo borra además todo lo que no sea el catálogo de
// ciudades: solo para reiniciar una base de desarrollo.
// Capa: script suelto (no forma parte del servidor). Como las pruebas de tests/mysql, escribe con
//       Prisma directamente porque carga datos en bloque.
// Usa: repositories/shared/prisma.js, repositories/fotoRepository.js y services/shared/password.js.
//
// Qué base usa lo decide el archivo de entorno con el que se arranca:
//   npm run db:seed-demo                                   (base local, .env)
//   node --env-file=.env.online prisma/seed-demo.js        (base online compartida)
const prisma = require('../src/repositories/shared/prisma');
const fotoRepository = require('../src/repositories/fotoRepository');
const { cifrarPassword } = require('../src/services/shared/password');

// Contraseña común de las cuentas de demo (no es un secreto: son datos falsos).
const PASSWORD_DEMO = 'Demo1234';

// Retratos de Pexels (licencia libre), uno por usuario. Cloudinary los recorta en cuadrado centrado
// en la cara. Los nombres «demo_*» dejan claro que las cuentas no son personas reales.
const pexels = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;

const USUARIOS = [
  ['demo_ana', 'Madrid', pexels(15669695)],
  ['demo_luis', 'Sevilla', pexels(29051297)],
  ['demo_marta', 'Valencia', pexels(40059874)],
  ['demo_pablo', 'Granada', pexels(38599178)],
  ['demo_sofia', 'Cádiz', pexels(37863216)],
  ['demo_carlos', 'Barcelona', pexels(13422789)],
  ['demo_lucia', 'Bilbao', pexels(39539337)],
  ['demo_diego', 'Lisboa', pexels(39539328)],
  ['demo_elena', 'París', pexels(8442928)],
  ['demo_marco', 'Roma', pexels(13033068)],
  ['demo_julia', 'Berlín', pexels(39296692)],
  ['demo_hugo', 'Londres', pexels(27471176)],
  ['demo_irene', 'Praga', pexels(13038071)],
  ['demo_tomas', 'Viena', pexels(40059873)],
];

// [autor, ciudad del catálogo (código de país, nombre), título, descripción, tipo, momento, visibilidad]
// El catálogo solo tiene capitales y en inglés. «tipo» usa las palabras que reconoce el frontend
// para elegir el color de la tarjeta (gastronomía, cultura, naturaleza, noche, deporte).
const EXPERIENCIAS = [
  ['demo_ana', 'ES', 'Madrid', 'Ruta de tapas por La Latina', 'Tres horas de bares en la Cava Baja: croquetas, callos y vermut. Empieza a las siete para pillar sitio.', 'Gastronomía', 'Por la tarde', 'PUBLICA'],
  ['demo_ana', 'ES', 'Madrid', 'Atardecer en el Templo de Debod', 'Llega media hora antes de la puesta de sol para coger sitio en el muro.', 'Naturaleza', 'Atardecer', 'AMIGOS'],
  ['demo_ana', 'ES', 'Madrid', 'Museo del Prado sin colas', 'Entrada gratuita las dos últimas horas; ve directo a Las Meninas y a Goya.', 'Cultura', 'Por la tarde', 'PRIVADA'],
  ['demo_ana', 'ES', 'Madrid', 'Mercado de San Miguel', 'Caro, pero imprescindible una vez. Mejor entre semana.', 'Gastronomía', 'Mediodía', 'PUBLICA'],
  ['demo_ana', 'ES', 'Madrid', 'Senderismo por la Pedriza', 'Ruta circular de cinco horas con vistas al Yelmo. Lleva agua y gorra.', 'Naturaleza', 'Por la mañana', 'PUBLICA'],
  ['demo_luis', 'ES', 'Madrid', 'Cena con vistas al Palacio Real', 'Terraza frente a la Almudena; reserva con antelación y pide las croquetas.', 'Gastronomía', 'Noche', 'PUBLICA'],
  ['demo_luis', 'PT', 'Lisbon', 'Paseo en barca por el Tajo', 'Una hora y media desde Belém, ideal al atardecer.', 'Naturaleza', 'Atardecer', 'AMIGOS'],
  ['demo_marta', 'ES', 'Madrid', 'Cocido de toda la vida en Malasaña', 'Los tres vuelcos en una taberna de barrio; reserva y no comas antes.', 'Gastronomía', 'Mediodía', 'PUBLICA'],
  ['demo_marta', 'FR', 'Paris', 'Brunch en el Marais', 'Cafés pequeños y pasteles caseros; los domingos hay cola desde las once.', 'Gastronomía', 'Por la mañana', 'PUBLICA'],
  ['demo_pablo', 'ES', 'Madrid', 'Copas en Malasaña', 'Bares de barrio con música en directo y cañas a buen precio hasta las dos.', 'Noche', 'Noche', 'PUBLICA'],
  ['demo_sofia', 'PT', 'Lisbon', 'Playa de Cascais en tren', 'Cuarenta minutos desde Cais do Sodré; lleva agua y crema.', 'Naturaleza', 'Verano', 'PUBLICA'],
  ['demo_sofia', 'PT', 'Lisbon', 'Fado en Alfama', 'Casas de fado pequeñas, cena incluida. Silencio absoluto durante las actuaciones.', 'Noche', 'Noche', 'AMIGOS'],
  ['demo_carlos', 'AT', 'Vienna', 'Palacio de Schönbrunn al abrir', 'Entradas con hora a primera hora: casi sin gente y con la luz de la mañana en los salones.', 'Cultura', 'Por la mañana', 'PUBLICA'],
  ['demo_carlos', 'ES', 'Madrid', 'Running por el Retiro', 'Cinco kilómetros por el anillo exterior, plano y con fuentes.', 'Deporte', 'Por la mañana', 'PUBLICA'],
  ['demo_lucia', 'ES', 'Madrid', 'Bocata de calamares en la Plaza Mayor', 'El clásico de Madrid: calamares recién fritos y una caña en la barra.', 'Gastronomía', 'Por la tarde', 'PUBLICA'],
  ['demo_lucia', 'ES', 'Madrid', 'Museo Reina Sofía y el Guernica', 'Dedícale dos horas; el Guernica se mira mejor a primera hora.', 'Cultura', 'Por la tarde', 'PRIVADA'],
  ['demo_diego', 'PT', 'Lisbon', 'Pastéis de Belém a primera hora', 'Los de la fábrica original, recién salidos del horno y con canela.', 'Gastronomía', 'Por la mañana', 'PUBLICA'],
  ['demo_diego', 'PT', 'Lisbon', 'Tranvía 28 hasta el Castelo', 'Súbete en la primera parada para ir sentado; cuidado con los carteristas.', 'Cultura', 'Por la mañana', 'PUBLICA'],
  ['demo_elena', 'FR', 'Paris', 'Paseo por el Sena al caer la tarde', 'De Notre-Dame a la Torre Eiffel andando; compra una botella y un queso.', 'Naturaleza', 'Atardecer', 'PUBLICA'],
  ['demo_elena', 'FR', 'Paris', 'Museo de Orsay entre semana', 'Los impresionistas del último piso con el reloj gigante de fondo.', 'Cultura', 'Por la tarde', 'AMIGOS'],
  ['demo_elena', 'FR', 'Paris', 'Jazz en un sótano de Saint-Germain', 'Conciertos desde las nueve, sin reserva si llegas pronto.', 'Noche', 'Noche', 'PUBLICA'],
  ['demo_marco', 'IT', 'Rome', 'Carbonara auténtica en Trastevere', 'Sin nata, con guanciale y pecorino. Pregunta por el plato del día.', 'Gastronomía', 'Mediodía', 'PUBLICA'],
  ['demo_marco', 'IT', 'Rome', 'El Coliseo con guía local', 'La visita con acceso a la arena merece los 10 euros de más.', 'Cultura', 'Por la mañana', 'PUBLICA'],
  ['demo_marco', 'IT', 'Rome', 'Atardecer desde el Gianicolo', 'Todo Roma a tus pies y un cañonazo a mediodía.', 'Naturaleza', 'Atardecer', 'PRIVADA'],
  ['demo_julia', 'DE', 'Berlin', 'Museumsinsel en un día', 'Compra el pase de la isla de los museos y elige solo dos; el Pérgamo manda.', 'Cultura', 'Por la mañana', 'PUBLICA'],
  ['demo_julia', 'DE', 'Berlin', 'Bicicleta por Tempelhofer Feld', 'Un antiguo aeropuerto convertido en parque, perfecto para pedalear sin tráfico.', 'Deporte', 'Por la tarde', 'PUBLICA'],
  ['demo_julia', 'DE', 'Berlin', 'Currywurst en Mauerpark', 'Mercadillo de domingo, karaoke al aire libre y salchichas decentes.', 'Gastronomía', 'Mediodía', 'AMIGOS'],
  ['demo_hugo', 'GB', 'London', 'Camden Market un sábado', 'Comida de todo el mundo y puestos de discos. Llega antes de las doce.', 'Gastronomía', 'Mediodía', 'PUBLICA'],
  ['demo_hugo', 'GB', 'London', 'British Museum y la sala de Egipto', 'Gratis y enorme: elige tres salas y no más.', 'Cultura', 'Por la mañana', 'PUBLICA'],
  ['demo_hugo', 'GB', 'London', 'Pub quiz en Shoreditch', 'Equipos de seis, premio en cervezas. Los martes por la noche.', 'Noche', 'Noche', 'AMIGOS'],
  ['demo_irene', 'CZ', 'Prague', 'Puente de Carlos a las siete', 'Antes de que lleguen los grupos: neblina sobre el Moldava y casi nadie.', 'Cultura', 'Por la mañana', 'PUBLICA'],
  ['demo_irene', 'CZ', 'Prague', 'Cerveza checa en una cervecería de barrio', 'Pilsner a 2 euros y gulash en pan. Pregunta por la tanque.', 'Gastronomía', 'Noche', 'PUBLICA'],
  ['demo_tomas', 'AT', 'Vienna', 'Café Sacher y su tarta', 'Cola larga, pero la tarta original lo vale. Pide la mesa del fondo.', 'Gastronomía', 'Por la tarde', 'PUBLICA'],
  ['demo_tomas', 'AT', 'Vienna', 'Concierto de órgano en la Karlskirche', 'Entradas baratas para escuchar música clásica en un templo barroco.', 'Cultura', 'Noche', 'PUBLICA'],
  ['demo_tomas', 'AT', 'Vienna', 'Patinar frente al Ayuntamiento', 'Pista de hielo gratuita en invierno y mercado navideño alrededor.', 'Deporte', 'Invierno', 'AMIGOS'],
];

// Valoraciones: [valorador, título de la experiencia, puntuación, comentario]. Solo sobre públicas.
const VALORACIONES = [
  ['demo_luis', 'Ruta de tapas por La Latina', 5, 'Volvería mañana. Las croquetas de cocido, de otro nivel.'],
  ['demo_marta', 'Ruta de tapas por La Latina', 4, 'Muy buena, aunque había mucha gente.'],
  ['demo_carlos', 'Ruta de tapas por La Latina', 5, null],
  ['demo_pablo', 'Mercado de San Miguel', 3, 'Bonito pero caro para lo que es.'],
  ['demo_sofia', 'Mercado de San Miguel', 4, null],
  ['demo_luis', 'Senderismo por la Pedriza', 5, 'Vistas increíbles, cansa pero compensa.'],
  ['demo_ana', 'Cena con vistas al Palacio Real', 4, 'Reservamos con dos semanas y mereció la pena.'],
  ['demo_sofia', 'Cocido de toda la vida en Malasaña', 5, 'La mejor paella que he probado.'],
  ['demo_carlos', 'Cocido de toda la vida en Malasaña', 4, null],
  ['demo_ana', 'Copas en Malasaña', 4, 'Ambiente genial, pero cuesta llegar caminando.'],
  ['demo_marta', 'Playa de Cascais en tren', 5, 'Un paraíso, casi sin gente.'],
  ['demo_luis', 'Playa de Cascais en tren', 4, null],
  ['demo_ana', 'Palacio de Schönbrunn al abrir', 5, 'Imprescindible reservar con tiempo.'],
  ['demo_elena', 'Palacio de Schönbrunn al abrir', 4, null],
  ['demo_pablo', 'Running por el Retiro', 3, 'Llano pero con mucha gente a ciertas horas.'],
  ['demo_marco', 'Bocata de calamares en la Plaza Mayor', 5, 'Una barbaridad de buenos.'],
  ['demo_julia', 'Bocata de calamares en la Plaza Mayor', 4, null],
  ['demo_sofia', 'Pastéis de Belém a primera hora', 5, 'Calentitos y con canela. Un clásico.'],
  ['demo_hugo', 'Pastéis de Belém a primera hora', 4, null],
  ['demo_diego', 'Paseo por el Sena al caer la tarde', 5, 'Romántico sin pretenderlo.'],
  ['demo_irene', 'Paseo por el Sena al caer la tarde', 5, null],
  ['demo_julia', 'Jazz en un sótano de Saint-Germain', 4, 'Pequeño, íntimo y sin turistas.'],
  ['demo_ana', 'Carbonara auténtica en Trastevere', 5, 'Sin nata y deliciosa.'],
  ['demo_elena', 'Carbonara auténtica en Trastevere', 4, null],
  ['demo_hugo', 'El Coliseo con guía local', 5, 'El guía lo hizo mucho más interesante.'],
  ['demo_tomas', 'Museumsinsel en un día', 4, 'Mejor elegir pocos museos y verlos despacio.'],
  ['demo_marta', 'Bicicleta por Tempelhofer Feld', 5, 'Un sitio único.'],
  ['demo_carlos', 'Camden Market un sábado', 3, 'Demasiada gente, pero buena comida.'],
  ['demo_elena', 'British Museum y la sala de Egipto', 5, null],
  ['demo_marco', 'Puente de Carlos a las siete', 5, 'Madrugar merece la pena.'],
  ['demo_lucia', 'Cerveza checa en una cervecería de barrio', 4, null],
  ['demo_diego', 'Café Sacher y su tarta', 3, 'Rica pero cara y con cola.'],
  ['demo_irene', 'Concierto de órgano en la Karlskirche', 5, 'Acústica espectacular.'],
];

// Amistades: [solicitante, destinatario, estado]
const AMISTADES = [
  ['demo_ana', 'demo_luis', 'ACEPTADA'],
  ['demo_ana', 'demo_marta', 'ACEPTADA'],
  ['demo_ana', 'demo_carlos', 'ACEPTADA'],
  ['demo_pablo', 'demo_ana', 'PENDIENTE'],
  ['demo_sofia', 'demo_ana', 'PENDIENTE'],
  ['demo_luis', 'demo_sofia', 'ACEPTADA'],
  ['demo_marta', 'demo_carlos', 'ACEPTADA'],
  ['demo_diego', 'demo_sofia', 'ACEPTADA'],
  ['demo_elena', 'demo_marco', 'ACEPTADA'],
  ['demo_elena', 'demo_julia', 'ACEPTADA'],
  ['demo_marco', 'demo_julia', 'ACEPTADA'],
  ['demo_hugo', 'demo_elena', 'PENDIENTE'],
  ['demo_irene', 'demo_tomas', 'ACEPTADA'],
  ['demo_hugo', 'demo_julia', 'ACEPTADA'],
  ['demo_lucia', 'demo_carlos', 'PENDIENTE'],
];

// Seguimientos: [seguidor, seguido]
const SEGUIMIENTOS = [
  ['demo_pablo', 'demo_ana'], ['demo_sofia', 'demo_ana'], ['demo_carlos', 'demo_ana'],
  ['demo_ana', 'demo_sofia'], ['demo_ana', 'demo_elena'], ['demo_ana', 'demo_marco'],
  ['demo_luis', 'demo_diego'], ['demo_marta', 'demo_elena'], ['demo_lucia', 'demo_ana'],
  ['demo_julia', 'demo_hugo'], ['demo_hugo', 'demo_irene'], ['demo_tomas', 'demo_julia'],
  ['demo_irene', 'demo_marco'], ['demo_diego', 'demo_ana'], ['demo_elena', 'demo_tomas'],
];

// Borra los datos de demo (o todo menos las ciudades, con --todo) respetando el orden de las claves
// foráneas: todas son RESTRICT salvo los tokens de recuperación.
async function limpiar(todo) {
  const usuarios = todo
    ? {}
    : { OR: [{ nombreUsuario: { startsWith: 'demo_' } }] };
  const ids = (await prisma.usuario.findMany({ where: usuarios, select: { id: true } })).map((u) => u.id);
  const deUsuario = { in: ids };
  await prisma.valoracion.deleteMany({ where: { OR: [{ usuarioId: deUsuario }, { experiencia: { autorId: deUsuario } }] } });
  await prisma.experiencia.deleteMany({ where: todo ? {} : { autorId: deUsuario } });
  await prisma.amistad.deleteMany({ where: { OR: [{ solicitanteId: deUsuario }, { destinatarioId: deUsuario }] } });
  await prisma.seguimiento.deleteMany({ where: { OR: [{ seguidorId: deUsuario }, { seguidoId: deUsuario }] } });
  await prisma.tokenRecuperacion.deleteMany({ where: { usuarioId: deUsuario } });
  await prisma.usuario.deleteMany({ where: { id: deUsuario } });
  if (todo) await prisma.session.deleteMany({});
  return ids.length;
}

async function main() {
  const todo = process.argv.includes('--todo');
  const borrados = await limpiar(todo);
  console.log(`Borrados ${borrados} usuarios${todo ? ' (y todo lo que no es catálogo)' : ' de demo'} con sus datos.`);

  const passwordHash = await cifrarPassword(PASSWORD_DEMO);
  const usuario = {};
  for (const [nombreUsuario, ciudad, fotoOrigen] of USUARIOS) {
    // Con SEED_SIN_FOTOS (modo demo sin internet) no se sube nada a Cloudinary
    const foto = process.env.SEED_SIN_FOTOS ? null : await fotoRepository.subirFotoDemo(nombreUsuario, fotoOrigen);
    usuario[nombreUsuario] = await prisma.usuario.create({
      data: { nombreUsuario, email: `${nombreUsuario}@planb.local`, passwordHash, ciudad, foto },
    });
  }
  console.log(`Usuarios creados: ${USUARIOS.length}.`);

  const experiencia = {};
  for (const [autor, codigoPais, ciudadNombre, titulo, descripcion, tipo, momentoAdecuado, visibilidad] of EXPERIENCIAS) {
    const ciudad = await prisma.ciudad.findFirst({ where: { codigoPais, nombre: ciudadNombre } });
    if (!ciudad) throw new Error(`La ciudad ${ciudadNombre} (${codigoPais}) no está en el catálogo: ejecuta antes db:seed.`);
    experiencia[titulo] = await prisma.experiencia.create({
      data: { titulo, descripcion, tipo, momentoAdecuado, visibilidad, ciudadId: ciudad.id, autorId: usuario[autor].id },
    });
  }
  console.log(`Experiencias creadas: ${EXPERIENCIAS.length}.`);

  for (const [valorador, titulo, puntuacion, comentario] of VALORACIONES) {
    await prisma.valoracion.create({
      data: { usuarioId: usuario[valorador].id, experienciaId: experiencia[titulo].id, puntuacion, comentario },
    });
  }
  console.log(`Valoraciones creadas: ${VALORACIONES.length}.`);

  for (const [solicitante, destinatario, estado] of AMISTADES) {
    const a = usuario[solicitante].id;
    const b = usuario[destinatario].id;
    await prisma.amistad.create({
      data: { solicitanteId: a, destinatarioId: b, estado, parejaClave: `${Math.min(a, b)}-${Math.max(a, b)}` },
    });
  }
  console.log(`Amistades creadas: ${AMISTADES.length}.`);

  for (const [seguidor, seguido] of SEGUIMIENTOS) {
    await prisma.seguimiento.create({ data: { seguidorId: usuario[seguidor].id, seguidoId: usuario[seguido].id } });
  }
  console.log(`Seguimientos creados: ${SEGUIMIENTOS.length}.`);
  console.log(`Entra con cualquier demo_* y la contraseña ${PASSWORD_DEMO}.`);
}

main()
  .catch((error) => {
    console.error('No se han podido cargar los datos de demo:', error.message);
    // Código de salida 1: indica a la terminal que el script ha fallado
    process.exitCode = 1;
  })
  // Se cierra la conexión pase lo que pase; si no, el script se quedaría abierto
  .finally(() => prisma.$disconnect());
