const { passwordDemo } = require('./credenciales.cjs');
const { test, expect } = require('@playwright/test');

test('Un usuario puede publicar y actualizar una valoración', async ({
    page,
    request
}) => {

    test.setTimeout(90000);

    const baseURL = 'http://localhost:3010';
    const titulo = 'Plan para valorar E2E ' + Date.now();

    // 1. Iniciar sesión como Luis mediante la API
    const loginLuis = await request.post(
        baseURL + '/api/auth/login',
        {
            data: {
                email: 'demo_luis@planb.local',
                password: passwordDemo
            }
        }
    );

    expect(loginLuis.ok()).toBe(true);

    // 2. Obtener Madrid
    const respuestaCiudades = await request.get(
        baseURL + '/api/ciudades'
    );

    expect(respuestaCiudades.ok()).toBe(true);

    const ciudades = await respuestaCiudades.json();

    const madrid = ciudades.find(
        ciudad => ciudad.nombre === 'Madrid'
    );

    expect(madrid).toBeDefined();

    // 3. Luis crea un plan público
    const respuestaPlan = await request.post(
        baseURL + '/api/experiencias',
        {
            data: {
                titulo,
                descripcion: 'Ruta gastronómica por Madrid.',
                ciudadId: madrid.id,
                tipo: 'Gastronomía',
                visibilidad: 'PUBLICA'
            }
        }
    );

    expect(respuestaPlan.status()).toBe(201);

    const plan = await respuestaPlan.json();

    // 4. Ana inicia sesión desde el navegador
    await page.goto(
        baseURL + '/paginas/acceso/iniciar-sesion.html'
    );

    await page.getByLabel('Email')
        .fill('demo_ana@planb.local');

    await page.getByLabel('Contraseña', { exact: true })
        .fill(passwordDemo);

    await page.getByRole('button', {
        name: 'Entrar',
        exact: true
    }).click();

    await expect(page.locator('#nombre-usuario'))
        .toHaveText('demo_ana');

    // 5. Abrir el plan de Luis
    await page.goto(
        baseURL +
        '/paginas/experiencias/experiencia.html?id=' +
        plan.id
    );

    await expect(page.locator('#detalle-titulo'))
        .toHaveText(titulo);

    // 6. Seleccionar cinco estrellas
    await page.getByRole('radio', {
        name: '5 estrellas',
        exact: true
    }).click();

    // 7. Escribir un comentario
    await page.locator('#val-comentario')
        .fill('Muy buen plan, totalmente recomendable.');

    // 8. Publicar la valoración
    await page.getByRole('button', {
        name: 'Publicar valoración',
        exact: true
    }).click();

    await expect(page.locator('#exito-valoracion'))
        .toHaveText('Valoración guardada.');

    await expect(page.locator('#mi-valoracion'))
        .toBeVisible();

    await expect(page.locator('#mi-valoracion-contenido'))
        .toContainText('Muy buen plan, totalmente recomendable.');

    // 9. Comprobar la valoración guardada
    const respuestaValoracion = await page.request.get(
        baseURL + '/api/experiencias/' +
        plan.id + '/valoracion'
    );

    expect(respuestaValoracion.ok()).toBe(true);

    const valoracion = await respuestaValoracion.json();

    expect(valoracion.puntuacion).toBe(5);

    // 10. Cambiar la valoración a cuatro estrellas
    await page.getByRole('radio', {
        name: '4 estrellas',
        exact: true
    }).click();

    await page.locator('#val-comentario')
        .fill('Buen plan, aunque mejorable.');

    await page.getByRole('button', {
        name: 'Actualizar valoración',
        exact: true
    }).click();

    await expect(page.locator('#mi-valoracion-contenido'))
        .toContainText('Buen plan, aunque mejorable.');

    // 11. Recargar y comprobar la persistencia
    await page.reload();

    await expect(page.locator('#mi-valoracion-contenido'))
        .toContainText('Buen plan, aunque mejorable.');

    // 12. Verificar que se ha actualizado la misma valoración
    const respuestaFinal = await page.request.get(
        baseURL + '/api/experiencias/' +
        plan.id + '/valoracion'
    );

    expect(respuestaFinal.ok()).toBe(true);

    const actualizada = await respuestaFinal.json();

    expect(actualizada.id).toBe(valoracion.id);
    expect(actualizada.puntuacion).toBe(4);

    // 13. Comprobar que no existen valoraciones duplicadas
    const respuestaResumen = await page.request.get(
        baseURL + '/api/experiencias/' +
        plan.id + '/resumen'
    );

    expect(respuestaResumen.ok()).toBe(true);

    const resumen = await respuestaResumen.json();

    expect(resumen.total).toBe(1);
    expect(resumen.media).toBe(4);

});