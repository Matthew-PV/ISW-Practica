const { passwordDemo } = require('./credenciales.cjs');
const { test, expect } = require('@playwright/test');

const baseURL = 'http://localhost:3010';

// Función reutilizable para iniciar sesión
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

// Función reutilizable para visitar un perfil
async function abrirPerfil(page, usuario) {

    await page.goto(
        baseURL +
        '/paginas/social/usuario.html?nombre=' +
        usuario
    );

    await expect(page.locator('#nombre-usuario'))
        .toHaveText(usuario);
}

test('Dos usuarios pueden hacerse amigos y seguirse', async ({
    browser
}) => {

    test.setTimeout(120000);

    // 1. Crear dos sesiones independientes
    const contextoLuis = await browser.newContext();
    const contextoMarta = await browser.newContext();

    const luis = await contextoLuis.newPage();
    const marta = await contextoMarta.newPage();

    try {

        // 2. Luis inicia sesión
        await iniciarSesion(luis, 'demo_luis');

        // 3. Luis visita el perfil de Marta
        await abrirPerfil(luis, 'demo_marta');

        // 4. Enviar solicitud de amistad
        await luis.getByRole('button', {
            name: 'Añadir amigo',
            exact: true
        }).click();

        await expect(
            luis.getByRole('button', {
                name: 'Cancelar solicitud',
                exact: true
            })
        ).toBeVisible();

        // 5. Marta inicia sesión
        await iniciarSesion(marta, 'demo_marta');

        // 6. Marta visita el perfil de Luis
        await abrirPerfil(marta, 'demo_luis');

        // 7. Marta acepta la solicitud
        await marta.locator('#botones-amistad')
            .getByRole('button', {
                name: 'Aceptar',
                exact: true
            }).click();

        await expect(
            marta.getByRole('button', {
                name: 'Eliminar amigo',
                exact: true
            })
        ).toBeVisible();

        // 8. Luis comprueba que ya son amigos
        await luis.reload();

        await expect(
            luis.getByRole('button', {
                name: 'Eliminar amigo',
                exact: true
            })
        ).toBeVisible();

        // 9. Luis comienza a seguir a Marta
        await luis.getByRole('button', {
            name: 'Seguir',
            exact: true
        }).click();

        await expect(
            luis.getByRole('button', {
                name: 'Dejar de seguir',
                exact: true
            })
        ).toBeVisible();

        // 10. Comprobar que ambas relaciones persisten
        await luis.reload();

        await expect(
            luis.getByRole('button', {
                name: 'Eliminar amigo',
                exact: true
            })
        ).toBeVisible();

        await expect(
            luis.getByRole('button', {
                name: 'Dejar de seguir',
                exact: true
            })
        ).toBeVisible();

        // 11. Luis elimina la amistad
        await luis.getByRole('button', {
            name: 'Eliminar amigo',
            exact: true
        }).click();

        await luis.locator('#confirmar-eliminar-amigo')
            .click();

        await expect(
            luis.getByRole('button', {
                name: 'Añadir amigo',
                exact: true
            })
        ).toBeVisible();

        // 12. Comprobar que sigue siguiendo a Marta
        await expect(
            luis.getByRole('button', {
                name: 'Dejar de seguir',
                exact: true
            })
        ).toBeVisible();

        // 13. Dejar de seguir a Marta
        await luis.getByRole('button', {
            name: 'Dejar de seguir',
            exact: true
        }).click();

        await expect(
            luis.getByRole('button', {
                name: 'Seguir',
                exact: true
            })
        ).toBeVisible();

    } finally {

        await contextoLuis.close();
        await contextoMarta.close();

    }

});