const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');

const configuracion = parseEnv(
    fs.readFileSync(
        path.join(__dirname, '../.env.e2e'),
        'utf8'
    )
);

if (!configuracion.E2E_DEMO_PASSWORD) {
    throw new Error(
        'Falta E2E_DEMO_PASSWORD en .env.e2e'
    );
}

module.exports = {
    passwordDemo: configuracion.E2E_DEMO_PASSWORD
};