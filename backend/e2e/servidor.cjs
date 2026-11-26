const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');

// Leer exclusivamente la configuración E2E
const configuracion = parseEnv(
    fs.readFileSync(
        path.join(__dirname, '../.env.e2e'),
        'utf8'
    )
);

// Comprobar el destino de la base de datos
const destino = new URL(configuracion.DATABASE_URL);

if (
    destino.protocol !== 'mysql:' ||
    destino.hostname !== '127.0.0.1' ||
    destino.port !== '3309' ||
    destino.pathname !== '/planb_e2e'
) {
    throw new Error(
        'Las pruebas E2E solo permiten MySQL local en 3309/planb_e2e'
    );
}

if (!configuracion.SESSION_SECRET) {
    throw new Error('Falta SESSION_SECRET');
}

// Impedir que se utilice la configuración de desarrollo
process.env.DATABASE_URL = configuracion.DATABASE_URL;
process.env.SESSION_SECRET = configuracion.SESSION_SECRET;
process.env.PORT = '3010';
process.env.SEED_SIN_FOTOS = '1';
process.env.CLOUDINARY_URL = '';
process.env.SMTP_URL = '';

// Cargar la aplicación después de comprobar la seguridad
const app = require('../src/app');

app.listen(3010, '127.0.0.1', () => {
    console.log('Servidor E2E iniciado en http://localhost:3010');
    console.log('Base de datos: planb_e2e');
    process.send?.('listo');
});