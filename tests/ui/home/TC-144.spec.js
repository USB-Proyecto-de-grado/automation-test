const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const HomePage = require('../../../page-objects/home/homePage');
const config = require('../../../config');

describe('Feature Tests for Download Button', function() {
    this.timeout(30000);
    let driver;
    let homePage;

    beforeEach(async function() {
        driver = new Builder().forBrowser('chrome').build();
        homePage = new HomePage(driver);
        await driver.get(config.uiUrl);
        await driver.manage().deleteAllCookies();  // Limpiar cookies antes de cada prueba
        await driver.executeScript('window.sessionStorage.clear(); window.localStorage.clear();'); // Limpiar almacenamiento
    });

    afterEach(async function() {
        await driver.quit();
    });

    it('TC-144: should verify the title and description in the "Interpretaciones musicales" section [Tag: GUI Testing] [Tag: Non-Functional Testing]', async function() {
        // When the user navigates to the "Interpretaciones musicales" section
        const titleSelector = '.MuiBox-root.css-212bt0 h2.MuiTypography-h2';
        const descriptionSelector = '.MuiBox-root.css-212bt0 p.MuiTypography-body1';

        await driver.wait(until.elementLocated(By.css(titleSelector)), 10000);
        const title = await driver.findElement(By.css(titleSelector)).getText();
        const description = await driver.findElement(By.css(descriptionSelector)).getText();

        // Then verify the title and description match expected content
        assert.strictEqual(title, 'Interpretaciones musicales');
        assert.strictEqual(description, 'Nuestro enfoque pedagógico desarrolla las habilidades creativas de los estudiantes a través de la interpretación y producción musical, sin importar el género musical al que este se dedique.');
    });
});
