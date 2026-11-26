const { passwordDemo } = require('./credenciales.cjs');
const { test, expect } = require('@playwright/test');

test('Un usuario registrado puede iniciar sesión', async ({ page }) => {

    // 1. Abrir la página de inicio de sesión
    await page.goto(
        'http://localhost:3010/paginas/acceso/iniciar-sesion.html'
    );

    // 2. Escribir el correo del usuario de prueba
    await page.getByLabel('Email').fill('demo_ana@planb.local');

    // 3. Escribir la contraseña de la cuenta ficticia
    await page.getByLabel('Contraseña', { exact: true }).fill(passwordDemo);

    // 4. Pulsar el botón Entrar
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();

    // 5. Comprobar que nos lleva a Inicio
    await expect(page).toHaveURL(
        /\/paginas\/cuenta\/bienvenida\.html/
    );

    // 6. Comprobar que estamos identificados como Ana
    await expect(page.locator('#nombre-usuario'))
        .toHaveText('demo_ana');

});