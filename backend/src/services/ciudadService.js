// Carga inicial, sin descargar datos durante la ejecución.
const catalogo = require('../../data/capitales.json');
const ciudadRepository = require('../repositories/ciudadRepository');

// Convierte el catálogo (países con sus capitales) en una lista de ciudades y la guarda.
async function cargarCatalogoInicial() {
  const capitales = catalogo.paises.flatMap(({ codigoPais, pais, capitales }) =>
    capitales.map((nombre) => ({ codigoPais, pais, nombre }))
  );
  return ciudadRepository.cargarCapitales(capitales);
}

module.exports = { cargarCatalogoInicial };
