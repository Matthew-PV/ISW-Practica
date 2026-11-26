const { passwordDemo } = require('../credenciales.cjs');

const {
    Given,
    When,
    Then,
    Before,
    After,
    Status,
    setDefaultTimeout
} = require('@cucumber/cucumber');

const { chromium, expect } = require('@playwright/test');

const baseURL = 'http://localhost:3010';

setDefaultTimeout(30000);

// Preparar el navegador antes del escenario
Before(async function () {


    this.browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    this.context = await this.browser.newContext({
        viewport: {
            width: 1280,
            height: 800
        }
    });

    this.page = await this.context.newPage();

});

// Cerrar el navegador después del escenario
After(async function ({ result }) {

    try {

        // Guardar una captura en el informe si falla
        if (result?.status === Status.FAILED && this.page) {

            const captura = await this.page.screenshot();

            await this.attach(captura, 'image/png');

        }

    } finally {

        await this.browser?.close();

    }

});

// DADO
Given(
    'que Ana abre la página de inicio de sesión',
    async function () {

        await this.page.goto(
            baseURL + '/paginas/acceso/iniciar-sesion.html'
        );

    }
);

// CUANDO
When(
    'introduce sus credenciales correctamente',
    async function () {

        await this.page.getByLabel('Email')
            .fill('demo_ana@planb.local');

        await this.page
            .getByLabel('Contraseña', { exact: true })
            .fill(passwordDemo);

        await this.page.getByRole('button', {
            name: 'Entrar',
            exact: true
        }).click();

    }
);

// ENTONCES
Then(
    'accede a la página de bienvenida',
    async function () {

        await expect(this.page).toHaveURL(
            /\/paginas\/cuenta\/bienvenida\.html/
        );

        await expect(
            this.page.locator('#nombre-usuario')
        ).toHaveText('demo_ana');

    }
);

// Y
Then(
    'puede acceder a sus planes',
    async function () {

        await this.page.getByRole('link', {
            name: 'Mis planes',
            exact: true
        }).click();

        await expect(this.page).toHaveURL(
            /\/paginas\/cuenta\/mis-planes\.html/
        );

        await expect(this.page.getByRole('heading', {
            name: 'Mis planes',
            exact: true
        })).toBeVisible();

    }
);