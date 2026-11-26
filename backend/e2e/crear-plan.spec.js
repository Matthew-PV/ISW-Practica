const { passwordDemo } = require('./credenciales.cjs');
const { test, expect } = require('@playwright/test');

test('Un usuario puede crear y consultar un plan', async ({ page }) => {

    test.setTimeout(60000);

    const titulo = 'Plan automático E2E ' + Date.now();
    const descripcion = 'Ruta gastronómica por el centro de Madrid.';

    // 1. Iniciar sesión
    await page.goto(
        'http://localhost:3010/paginas/acceso/iniciar-sesion.html'
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

    // 2. Acceder a Mis planes
    await page.getByRole('link', {
        name: 'Mis planes',
        exact: true
    }).click();

    // Esperar a que se carguen las categorías
    await expect(
        page.locator('#opciones-tipo input[value="Gastronomía"]')
    ).toHaveCount(1);

    // 3. Abrir el formulario
    await page.getByRole('button', {
        name: 'Nuevo plan',
        exact: true
    }).click();

    // 4. Rellenar los campos
    await page.locator('#titulo').fill(titulo);

    await page.locator('#opciones-tipo')
        .getByText('Gastronomía', { exact: true }).click();

    await page.locator('#ciudad').fill('Madrid');

    await page.locator('#descripcion').fill(descripcion);

    await page.locator('#duracion-minutos').fill('120');

    await page.locator('#tarifa').fill('25');

    // 5. Publicar el plan
    await page.getByRole('button', {
        name: 'Publicar plan',
        exact: true
    }).click();

    // 6. Comprobar la confirmación
    await expect(page.locator('#aviso-creada')).toBeVisible();

    await expect(page.locator('#texto-aviso'))
        .toHaveText('Plan publicado.');

    // 7. Abrir el plan recién creado
    await page.getByRole('link', {
        name: 'Ver plan',
        exact: true
    }).click();

    // 8. Comprobar que los datos son correctos
    await expect(page.locator('#detalle-titulo'))
        .toHaveText(titulo);

    await expect(page.locator('#detalle-descripcion'))
        .toHaveText(descripcion);

    // 9. Recargar y comprobar que sigue guardado
    await page.reload();

    await expect(page.locator('#detalle-titulo'))
        .toHaveText(titulo);

});