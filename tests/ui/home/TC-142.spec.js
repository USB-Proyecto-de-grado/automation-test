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

    it('TC-142: should click on the download button for "Revista Contrapunto (2023)" and verify redirection [Tag: GUI Testing] [Tag: Functional Testing]', async function() {
        // When the download button is clicked
        await homePage.clickDropdown();
        await driver.sleep(3000);
        await homePage.clickContrapuntoButton();
        await driver.sleep(3000);

        // Then the correct redirection URL should be confirmed
        const currentUrl = await driver.getCurrentUrl();
        assert.strictEqual(currentUrl, 'https://www.hum.umss.edu.bo/wp-content/uploads/2023/12/CONTRAPUNTO-2023-Formato-pequeno.pdf', 'La URL no coincide con la esperada después de la redirección.');

        console.log('Redirection to the correct URL confirmed.');
    });
    
});
