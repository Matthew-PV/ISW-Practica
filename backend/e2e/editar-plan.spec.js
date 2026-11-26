const { passwordDemo } = require('./credenciales.cjs');
const { test, expect } = require('@playwright/test');

test('Un usuario puede editar un plan propio', async ({ page }) => {

    test.setTimeout(60000);

    const baseURL = 'http://localhost:3010';
    const tituloOriginal = 'Plan E2E ' + Date.now();
    const tituloNuevo = tituloOriginal + ' editado';

    // 1. Iniciar sesión
    await page.goto(
        baseURL + '/paginas/acceso/iniciar-sesion.html'
    );

    await page.getByLabel('Email').fill('demo_ana@planb.local');

    await page.getByLabel('Contraseña', { exact: true })
        .fill(passwordDemo);

    await page.getByRole('button', {
        name: 'Entrar',
        exact: true
    }).click();

    await expect(page.locator('#nombre-usuario'))
        .toHaveText('demo_ana');

    // 2. Obtener la ciudad de Madrid
    const respuestaCiudades = await page.request.get(
        baseURL + '/api/ciudades'
    );

    expect(respuestaCiudades.ok()).toBe(true);

    const ciudades = await respuestaCiudades.json();

    const madrid = ciudades.find(
        ciudad => ciudad.nombre === 'Madrid'
    );

    expect(madrid).toBeDefined();

    // 3. Preparar un plan propio para editar
    const respuestaCreacion = await page.request.post(
        baseURL + '/api/experiencias',
        {
            data: {
                titulo: tituloOriginal,
                descripcion: 'Descripción original del plan.',
                ciudadId: madrid.id,
                tipo: 'Gastronomía',
                duracionMinutos: 120,
                tarifa: 25,
                visibilidad: 'PUBLICA'
            }
        }
    );

    expect(respuestaCreacion.status()).toBe(201);

    const plan = await respuestaCreacion.json();

    // 4. Abrir el detalle del plan en el navegador
    await page.goto(
        baseURL +
        '/paginas/experiencias/experiencia.html?id=' +
        plan.id
    );

    await expect(page.locator('#detalle-titulo'))
        .toHaveText(tituloOriginal);

    // 5. Pulsar Editar
    await page.locator('#boton-editar').click();

    await expect(page.locator('#dialogo-experiencia'))
        .toBeVisible();

    // 6. Comprobar que recupera los datos originales
    await expect(page.locator('#titulo'))
        .toHaveValue(tituloOriginal);

    await expect(page.locator('#duracion-minutos'))
        .toHaveValue('120');

    // 7. Modificar los datos
    await page.locator('#titulo').fill(tituloNuevo);

    await page.locator('#descripcion')
        .fill('Descripción modificada automáticamente.');

    await page.locator('#duracion-minutos').fill('180');

    await page.locator('#tarifa').fill('40');

    // 8. Guardar los cambios
    await page.getByRole('button', {
        name: 'Guardar cambios',
        exact: true
    }).click();

    // 9. Comprobar que vuelve al detalle actualizado
    await expect(page).toHaveURL(
        /\/paginas\/experiencias\/experiencia\.html/
    );

    await expect(page.locator('#detalle-titulo'))
        .toHaveText(tituloNuevo);

    await expect(page.locator('#detalle-descripcion'))
        .toHaveText('Descripción modificada automáticamente.');

    // 10. Recargar la página
    await page.reload();

    await expect(page.locator('#detalle-titulo'))
        .toHaveText(tituloNuevo);

    // 11. Verificar los datos persistidos
    const respuestaFinal = await page.request.get(
        baseURL + '/api/experiencias/' + plan.id
    );

    expect(respuestaFinal.ok()).toBe(true);

    const actualizado = await respuestaFinal.json();

    expect(actualizado.titulo).toBe(tituloNuevo);
    expect(actualizado.duracionMinutos).toBe(180);
    expect(Number(actualizado.tarifa)).toBe(40);

});