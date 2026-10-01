// Carga inicial, sin descargar datos durante la ejecución.
const catalogo = require('../../data/capitales.json');
const ciudadRepository = require('../repositories/ciudadRepository');

async function cargarCatalogoInicial() {
  const capitales = catalogo.paises.flatMap(({ codigoPais, pais, capitales }) =>
    capitales.map((nombre) => ({ codigoPais, pais, nombre }))
  );
  return ciudadRepository.cargarCapitales(capitales);
}

module.exports = { cargarCatalogoInicial };
