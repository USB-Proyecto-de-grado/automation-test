const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const HomePage = require('../../../../page-objects/home/homePage');
const config = require('../../../../config');

describe('Feature Tests for Download Button [Tag: Acceptance Testing]', function() {
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

    it('TC-142: should click on the download button for "Revista Contrapunto (2023)" and verify redirection [Tag: Functional Testing]', async function() {
        await homePage.clickDropdown();
        await driver.sleep(3000);
        await homePage.clickContrapuntoButton();
        await driver.sleep(3000);

        const currentUrl = await driver.getCurrentUrl();
        assert.strictEqual(currentUrl, 'https://www.hum.umss.edu.bo/wp-content/uploads/2023/12/CONTRAPUNTO-2023-Formato-pequeno.pdf', 'La URL no coincide con la esperada después de la redirección.');

        console.log('Redirection to the correct URL confirmed.');
    });

    it('TC-144: should verify the title and description in the "Interpretaciones musicales" section  [Tag: Content Verification]', async function() {
        const titleSelector = '.MuiBox-root.css-212bt0 h2.MuiTypography-h2';
        const descriptionSelector = '.MuiBox-root.css-212bt0 p.MuiTypography-body1';

        await driver.wait(until.elementLocated(By.css(titleSelector)), 10000);
        const title = await driver.findElement(By.css(titleSelector)).getText();
        const description = await driver.findElement(By.css(descriptionSelector)).getText();

        assert.strictEqual(title, 'Interpretaciones musicales');
        assert.strictEqual(description, 'Nuestro enfoque pedagógico desarrolla las habilidades creativas de los estudiantes a través de la interpretación y producción musical, sin importar el género musical al que este se dedique.');
    });

    it('TC-145: should verify the content of the Professional Profile section  [Tag: Content Verification]', async function() {
        const titleSelector = '.MuiBox-root.css-v6hcfe h2.MuiTypography-h2';
        const itemsSelector = '.MuiBox-root.css-v6hcfe .MuiListItem-root';

        await driver.wait(until.elementLocated(By.css(titleSelector)), 10000);
        const title = await driver.findElement(By.css(titleSelector)).getText();
        assert.strictEqual(title, 'Perfil Profesional');

        const items = await driver.findElements(By.css(itemsSelector));
        const expectedItemsText = [
            'Nuestros profesionales adquieren un profundo conocimiento teórico y práctico en diversas disciplinas musicales.',
            'Capacidad para desempeñarse como intérprete, compositor, arreglista, director o educador, tanto en el ámbito nacional como internacional.',
            'Desarrolla habilidades técnicas y artísticas, fomentando la creatividad, la expresión personal y la capacidad de trabajar en equipos interdisciplinarios.',
            'Formación integral que permite adaptarse a un mercado laboral dinámico y diverso, destacándose en la industria de la música contemporánea, la producción audiovisual y la educación musical.'
        ];

        let actualTexts = [];
        for (let item of items) {
            const text = await item.findElement(By.css('.MuiListItemText-primary p')).getText();
            actualTexts.push(text);
        }

        assert.deepStrictEqual(actualTexts, expectedItemsText, 'The professional profile descriptions do not match expected.');
    });
});
