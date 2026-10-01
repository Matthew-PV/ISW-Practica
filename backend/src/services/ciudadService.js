// Carga inicial, sin descargar datos durante la ejecución.
// Capa: servicios (services).
// Lo usa: prisma/seed.js (`npm run db:seed`). Ninguna ruta de la API lo llama.
// Usa: data/capitales.json (el catálogo) y repositories/ciudadRepository.js (guardarlo).
//
// El catálogo de capitales viene en un archivo del propio repositorio (data/capitales.json),
// así que la carga funciona sin internet y siempre da el mismo resultado.
const catalogo = require('../../data/capitales.json');
const ciudadRepository = require('../repositories/ciudadRepository');

// Convierte el catálogo (países con sus capitales) en una lista de ciudades y la guarda.
// Ejemplo: { codigoPais: 'ES', pais: 'España', capitales: ['Madrid'] }
//       → [{ codigoPais: 'ES', pais: 'España', nombre: 'Madrid' }]
// Devuelve el recuento { creadas, reutilizadas, existentes } que calcula el repositorio.
async function cargarCatalogoInicial() {
  // flatMap: cada país puede tener varias capitales y se quiere una lista plana de ciudades
  const capitales = catalogo.paises.flatMap(({ codigoPais, pais, capitales }) =>
    capitales.map((nombre) => ({ codigoPais, pais, nombre }))
  );
  return ciudadRepository.cargarCapitales(capitales);
}

module.exports = { cargarCatalogoInicial };
