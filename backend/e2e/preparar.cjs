const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { spawnSync } = require('node:child_process');

function preparar() {

    const backend = path.join(__dirname, '..');

    const configuracion = parseEnv(
        fs.readFileSync(
            path.join(backend, '.env.e2e'),
            'utf8'
        )
    );

    // SEGURIDAD: comprobar la base antes de borrar nada
    const destino = new URL(configuracion.DATABASE_URL);

    if (
        destino.protocol !== 'mysql:' ||
        destino.hostname !== '127.0.0.1' ||
        destino.port !== '3309' ||
        destino.pathname !== '/planb_e2e'
    ) {
        throw new Error(
            'Operación cancelada: la base de datos no es planb_e2e'
        );
    }

    const entorno = {
        ...process.env,
        DATABASE_URL: configuracion.DATABASE_URL,
        SEED_SIN_FOTOS: '1',
        CLOUDINARY_URL: '',
        SMTP_URL: ''
    };

    function ejecutar(argumentos) {

        const resultado = spawnSync(
            process.execPath,
            argumentos,
            {
                cwd: backend,
                env: entorno,
                stdio: 'inherit'
            }
        );

        if (resultado.error || resultado.status !== 0) {
            throw new Error(
                'No se ha podido preparar la base E2E'
            );
        }

    }

    console.log('Preparando base de datos E2E...');

    // Aplicar posibles migraciones pendientes
    ejecutar([
        'node_modules/prisma/build/index.js',
        'migrate',
        'deploy'
    ]);

    // Cargar el catálogo de ciudades
    ejecutar(['prisma/seed.js']);

    // Restaurar completamente los datos ficticios
    ejecutar(['prisma/seed-demo.js', '--todo']);

    console.log('Base de datos E2E preparada correctamente.');

}

module.exports = preparar;

if (require.main === module) {
    preparar();
}