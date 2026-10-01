// Ejecutar desde backend con npm run db:seed, después de las migraciones.
// Carga en MySQL el catálogo inicial de ciudades (las capitales de data/capitales.json),
// necesario para poder crear experiencias. Se puede repetir sin duplicar nada.
// Capa: script suelto (no forma parte del servidor).
// Usa: services/ciudadService.js (la carga) y repositories/ciudadRepository.js (cerrar la conexión).
const ciudadService = require('../src/services/ciudadService');
const ciudadRepository = require('../src/repositories/ciudadRepository');

async function main() {
  try {
    const resultado = await ciudadService.cargarCatalogoInicial();
    console.log(`Catálogo cargado: ${resultado.creadas} ciudades creadas, ` +
      `${resultado.reutilizadas} anteriores reutilizadas y ${resultado.existentes} ya existentes.`);
  } catch {
    console.error('No se ha podido cargar el catálogo. Comprueba MySQL, las migraciones y la configuración local.');
    // Código de salida 1: indica a la terminal que el script ha fallado
    process.exitCode = 1;
  } finally {
    // Se cierra la conexión pase lo que pase; si no, el script se quedaría abierto
    await ciudadRepository.cerrarConexion();
  }
}

main();
