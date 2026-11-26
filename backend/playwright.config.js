const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({

    testDir: './e2e',

    globalSetup: './e2e/preparar.cjs',
    
    fullyParallel: false,
    workers: 1,
    retries: 0,
    timeout: 30000,

    reporter: [
        ['list'],
        ['html', {
            outputFolder: 'reports/playwright-html',
            open: 'never'
        }]
    ],

    outputDir: 'reports/playwright-results',

    webServer: {
        command: 'node e2e/servidor.cjs',
        url: 'http://127.0.0.1:3010',
        reuseExistingServer: false,
        timeout: 60000
    },

    use: {

        baseURL: 'http://localhost:3010',

        browserName: 'chromium',

        headless: false,

        viewport: {
            width: 1280,
            height: 800
        },

        launchOptions: {
            slowMo: 500
        },

        screenshot: 'only-on-failure',

        video: 'retain-on-failure',

        trace: 'retain-on-failure'
    }

});