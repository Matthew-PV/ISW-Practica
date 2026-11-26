const { passwordDemo } = require('./credenciales.cjs');
const { test, expect } = require('@playwright/test');

const baseURL = 'http://localhost:3010';

async function iniciarSesion(page, usuario) {

    await page.goto(
        baseURL + '/paginas/acceso/iniciar-sesion.html'
    );

    await page.getByLabel('Email')
        .fill(usuario + '@planb.local');

    await page.getByLabel('Contraseña', { exact: true })
        .fill(passwordDemo);

    await page.getByRole('button', {
        name: 'Entrar',
        exact: true
    }).click();

    await expect(page.locator('#nombre-usuario'))
        .toHaveText(usuario);
}

test('Un usuario puede copiar y compartir el enlace de un plan', async ({
    page,
    context,
    browser
}) => {

    test.setTimeout(90000);

    // 1. Autorizar el acceso real al portapapeles
    await context.grantPermissions(
        ['clipboard-read', 'clipboard-write'],
        { origin: baseURL }
    );

    // 2. Ana inicia sesión
    await iniciarSesion(page, 'demo_ana');

    // 3. Obtener Madrid
    const respuestaCiudades = await page.request.get(
        baseURL + '/api/ciudades'
    );

    expect(respuestaCiudades.ok()).toBe(true);

    const ciudades = await respuestaCiudades.json();

    const madrid = ciudades.find(
        ciudad => ciudad.nombre === 'Madrid'
    );

    expect(madrid).toBeDefined();

    // 4. Crear un plan público
    const titulo = 'Plan para compartir E2E ' + Date.now();

    const respuestaPlan = await page.request.post(
        baseURL + '/api/experiencias',
        {
            data: {
                titulo,
                descripcion: 'Prueba automática de compartir enlaces.',
                ciudadId: madrid.id,
                tipo: 'Gastronomía',
                visibilidad: 'PUBLICA'
            }
        }
    );

    expect(respuestaPlan.status()).toBe(201);

    const plan = await respuestaPlan.json();

    const enlaceEsperado = baseURL +
        '/paginas/experiencias/experiencia.html?id=' +
        plan.id;

    // 5. Abrir el detalle del plan
    await page.goto(enlaceEsperado);

    await expect(page.locator('#detalle-titulo'))
        .toHaveText(titulo);

    // 6. Vaciar el portapapeles para evitar falsos positivos
    await page.evaluate(async () => {
        await navigator.clipboard.writeText('');
    });

    // 7. Pulsar Copiar enlace
    await page.getByRole('button', {
        name: 'Copiar enlace',
        exact: true
    }).click();

    // 8. Comprobar el mensaje de confirmación
    await expect(page.locator('#mensaje-compartir'))
        .toHaveText('¡Enlace copiado!');

    // 9. Leer el contenido real del portapapeles
    const enlaceCopiado = await page.evaluate(async () => {
        return await navigator.clipboard.readText();
    });

    expect(enlaceCopiado).toBe(enlaceEsperado);

    // 10. Crear otra sesión independiente
    const contextoElena = await browser.newContext();
    const elena = await contextoElena.newPage();

    try {

        // 11. Elena inicia sesión
        await iniciarSesion(elena, 'demo_elena');

        // 12. Elena abre el enlace que ha copiado Ana
        await elena.goto(enlaceCopiado);

        // 13. Comprobar que accede al plan correcto
        await expect(elena.locator('#detalle-titulo'))
            .toHaveText(titulo);

        await expect(elena.locator('#detalle-autor'))
            .toHaveText('demo_ana');

    } finally {

        await contextoElena.close();

    }

});