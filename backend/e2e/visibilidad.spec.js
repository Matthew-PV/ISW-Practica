const { passwordDemo } = require('./credenciales.cjs');
const { test, expect } = require('@playwright/test');

const baseURL = 'http://localhost:3010';

// Iniciar sesión desde el navegador
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

// Crear un plan con una visibilidad determinada
async function crearPlan(page, ciudadId, visibilidad) {

    const respuesta = await page.request.post(
        baseURL + '/api/experiencias',
        {
            data: {
                titulo: 'Plan E2E ' + visibilidad + ' ' + Date.now(),
                descripcion: 'Prueba automática de permisos.',
                ciudadId,
                tipo: 'Gastronomía',
                visibilidad
            }
        }
    );

    expect(respuesta.status()).toBe(201);

    return await respuesta.json();
}

// Comprobar si un usuario puede acceder a un plan
async function comprobarAcceso(page, plan, permitido) {

    const url = baseURL +
        '/paginas/experiencias/experiencia.html?id=' +
        plan.id;

    await page.goto(url);

    if (permitido) {

        await expect(page.locator('#contenido-experiencia'))
            .toBeVisible();

        await expect(page.locator('#detalle-titulo'))
            .toHaveText(plan.titulo);

    } else {

        await expect(page.locator('#mensaje-estado'))
            .toHaveText('Contenido no disponible');

        await expect(page.locator('#contenido-experiencia'))
            .toBeHidden();

        await expect(page.locator('#detalle-titulo'))
            .toHaveText('');

    }

    // Comprobar también la protección del backend
    const respuesta = await page.request.get(
        baseURL + '/api/experiencias/' + plan.id
    );

    expect(respuesta.status())
        .toBe(permitido ? 200 : 404);
}

test('Los planes respetan sus permisos de visibilidad', async ({
    browser,
    page
}) => {

    test.setTimeout(180000);

    // 1. Crear sesiones independientes para Luis y Elena
    const contextoLuis = await browser.newContext();
    const contextoElena = await browser.newContext();

    const luis = await contextoLuis.newPage();
    const elena = await contextoElena.newPage();

    const ana = page;

    try {

        // 2. Ana inicia sesión
        await iniciarSesion(ana, 'demo_ana');

        // 3. Obtener Madrid
        const respuesta = await ana.request.get(
            baseURL + '/api/ciudades'
        );

        expect(respuesta.ok()).toBe(true);

        const ciudades = await respuesta.json();

        const madrid = ciudades.find(
            ciudad => ciudad.nombre === 'Madrid'
        );

        expect(madrid).toBeDefined();

        // 4. Ana crea tres planes
        const publico = await crearPlan(
            ana, madrid.id, 'PUBLICA'
        );

        const amigos = await crearPlan(
            ana, madrid.id, 'AMIGOS'
        );

        const privado = await crearPlan(
            ana, madrid.id, 'PRIVADA'
        );

        // 5. Ana puede consultar todos sus planes
        await comprobarAcceso(ana, publico, true);
        await comprobarAcceso(ana, amigos, true);
        await comprobarAcceso(ana, privado, true);

        // 6. Luis inicia sesión
        await iniciarSesion(luis, 'demo_luis');

        // Luis es amigo de Ana
        await comprobarAcceso(luis, publico, true);
        await comprobarAcceso(luis, amigos, true);
        await comprobarAcceso(luis, privado, false);

        // 7. Elena inicia sesión
        await iniciarSesion(elena, 'demo_elena');

        // Elena no es amiga de Ana
        await comprobarAcceso(elena, publico, true);
        await comprobarAcceso(elena, amigos, false);
        await comprobarAcceso(elena, privado, false);

    } finally {

        await contextoLuis.close();
        await contextoElena.close();

    }

});