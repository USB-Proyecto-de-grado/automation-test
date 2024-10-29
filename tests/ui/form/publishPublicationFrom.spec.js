const buildDriver = require('../../../main/core/driverSetUp');
const PreTestSetup = require('../../../main/setup/preSetUp');
const PublishPublicationFormPage = require('../../../page-objects/publishPages/publishPublicationFormPage');
const AlertSnackBarPage = require('../../../page-objects/common/alertSnackBarPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');

describe('Publish Publication Form Tests [Tag: GUI Testing][Tag: Functional Testing]', function() {
    this.timeout(50000);
    let driver;
    let preTestSetup;
    let publishPublicationFormPage;
    let alertSnackBarPage;

    beforeEach(async function() {
        driver = buildDriver();
        preTestSetup = new PreTestSetup(driver);
        await preTestSetup.loginToGoogle(config.googleUser, config.googlePassword);
        publishPublicationFormPage = new PublishPublicationFormPage(driver);
        alertSnackBarPage = new AlertSnackBarPage(driver);

        await driver.get(config.uiUrl + '/publish/publication');
    });

    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            const screenshotPath = await takeScreenshot(driver, this.currentTest.title);
            addContext(this, {
              title: 'Screenshot',
              value: screenshotPath
            });
          };
        await driver.quit();
    });

    it('TC-162: should fill the form and submit successfull [Tag: GUI Testing] [Tag: Acceptance Testing] [Tag: Functional Testing] [Tag: Smoke Testing]', async function() {
        await driver.sleep(5000)
        await publishPublicationFormPage.fillPublicationForm({
            title: 'Publicación de prueba',
            description: 'Esta es una descripción de prueba.',
        });

        await publishPublicationFormPage.submitForm();

        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Publicado de manera exitosa');
        assert.strictEqual(isMessageDisplayed, true, 'El mensaje de éxito no fue mostrado correctamente');
    });

    it('TC-163: should show an error when submitting with invalid data [Tag: GUI Testing] [Tag: Negative Testing] [Tag: Functional Testing]', async function() {
        await driver.sleep(5000)
        await publishPublicationFormPage.fillPublicationForm({
            title: ' ',
            description: ' ',
        });

        await publishPublicationFormPage.submitForm();

        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros incorrectos');
        assert.strictEqual(isMessageDisplayed, true, 'El mensaje de error no fue mostrado correctamente');
    });

    it('TC-164: should show an error when submitting with the tile with empty space [Tag: GUI Testing] [Tag: Negative Testing] [Tag: Functional Testing]', async function() {
        await driver.sleep(5000)
        await publishPublicationFormPage.fillPublicationForm({
            title: ' ',
            description: 'Esta es una descripción de prueba.',
        });

        await publishPublicationFormPage.submitForm();

        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros incorrectos');
        assert.strictEqual(isMessageDisplayed, true, 'El mensaje de error no fue mostrado correctamente');
    });

    
    it('TC-165: should show an error when submitting with the description with empty space [Tag: GUI Testing] [Tag: Negative Testing] [Tag: Functional Testing]', async function() {
        await driver.sleep(5000)
        await publishPublicationFormPage.fillPublicationForm({
            title: 'Publicación de prueba',
            description: ' ',
        });

        await publishPublicationFormPage.submitForm();

        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros incorrectos');
        assert.strictEqual(isMessageDisplayed, true, 'El mensaje de error no fue mostrado correctamente');
    });
});
