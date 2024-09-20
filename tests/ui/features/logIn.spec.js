const { until } = require('selenium-webdriver');
const buildDriver = require('../../../main/core/driverSetUp');
const GoogleLoginPage = require('../../../page-objects/logIn/GoogleLoginPage');
const LogInPage = require('../../../page-objects/logIn/LogPage');
const assert = require('assert');

async function main() {
    const driver = buildDriver();
    const googleLoginPage = new GoogleLoginPage(driver);
    const loginPage = new LogInPage(driver);

    try {
        await driver.get('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&hl=en&service=mail&flowName=GlifWebSignIn&flowEntry=AddSession');

        await driver.wait(async () => {
            const readyState = await driver.executeScript('return document.readyState');
            return readyState === 'complete';
        }, 10000, 'La página de inicio de sesión de Google no se cargó correctamente');

        await googleLoginPage.enterIdentifier("juanzq10dev@gmail.com");
        await driver.sleep(2000);

        await googleLoginPage.enterPassword("10fe2002");
        await driver.sleep(5000);

        await driver.get('http://localhost:3000/');

        await driver.wait(async () => {
            const readyState = await driver.executeScript('return document.readyState');
            return readyState === 'complete';
        }, 10000, 'La página localhost no se cargó correctamente');

        const isVisible = await loginPage.isUserMenuButtonVisible();
        assert.strictEqual(isVisible, true, 'El botón de menú del usuario debe ser visible');

    } finally {
        await driver.quit();
    }
}

main();
