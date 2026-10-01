// Ejecutar desde backend con npm run db:seed, después de las migraciones.
const ciudadService = require('../src/services/ciudadService');
const ciudadRepository = require('../src/repositories/ciudadRepository');

async function main() {
  try {
    const resultado = await ciudadService.cargarCatalogoInicial();
    console.log(`Catálogo cargado: ${resultado.creadas} ciudades creadas, ` +
      `${resultado.reutilizadas} anteriores reutilizadas y ${resultado.existentes} ya existentes.`);
  } catch {
    console.error('No se ha podido cargar el catálogo. Comprueba MySQL, las migraciones y la configuración local.');
    process.exitCode = 1;
  } finally {
    await ciudadRepository.cerrarConexion();
  }
}

main();
