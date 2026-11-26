const path = require('node:path');
const { fork, spawnSync } = require('node:child_process');

const preparar = require('./preparar.cjs');

async function ejecutar() {

    if (!process.env.E2E_DEMO_PASSWORD) {
        throw new Error('Falta E2E_DEMO_PASSWORD');
    }

    // 1. Preparar la base de datos
    preparar();

    // 2. Arrancar el servidor E2E
    const servidor = fork(
        path.join(__dirname, 'servidor.cjs')
    );

    let temporizador;

    try {

        // 3. Esperar a que el servidor esté disponible
        await new Promise((resolve, reject) => {

            temporizador = setTimeout(() => {
                reject(new Error('El servidor E2E no ha arrancado'));
            }, 30000);

            servidor.once('message', mensaje => {
                if (mensaje === 'listo') {
                    resolve();
                } else {
                    reject(new Error('Respuesta inesperada del servidor'));
                }
            });

            servidor.once('error', reject);

            servidor.once('exit', () => {
                reject(new Error('El servidor se ha cerrado'));
            });

        });

        clearTimeout(temporizador);

        // 4. Ejecutar Cucumber
        const resultado = spawnSync(
            process.execPath,
            [
                'node_modules/@cucumber/cucumber/bin/cucumber.js',
                '--config',
                'cucumber.e2e.cjs'
            ],
            {
                cwd: path.join(__dirname, '..'),
                stdio: 'inherit'
            }
        );

        if (resultado.error) {
            throw resultado.error;
        }

        process.exitCode = resultado.status ?? 1;

    } finally {

        // 5. Cerrar siempre el servidor
        clearTimeout(temporizador);
        servidor.kill();

    }

}

ejecutar().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});