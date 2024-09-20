const buildDriver = require('../../../../main/core/driverSetUp');
const PreTestSetup = require('../../../../main/setup/preSetUp');
const PublishPublicationFormPage = require('../../../../page-objects/publishPages/publishPublicationFormPage');
const AlertSnackBarPage = require('../../../../page-objects/common/alertSnackBarPage');
const config = require('../../../../config');
const assert = require('assert');

describe('Publish Publication Form Tests', function() {
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
        await driver.quit();
    });

    it('should fill the form and submit successfully', async function() {
        await driver.sleep(5000)
        await publishPublicationFormPage.fillPublicationForm({
            title: 'Publicación de prueba',
            description: 'Esta es una descripción de prueba.',
        });

        await publishPublicationFormPage.submitForm();

        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Publicado de manera exitosa');
        assert.strictEqual(isMessageDisplayed, true, 'El mensaje de éxito no fue mostrado correctamente');
    });

    it('should show an error when submitting with invalid data', async function() {
        await driver.sleep(5000)
        await publishPublicationFormPage.fillPublicationForm({
            title: ' ',
            description: ' ',
        });

        await publishPublicationFormPage.submitForm();

        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros incorrectos');
        assert.strictEqual(isMessageDisplayed, true, 'El mensaje de error no fue mostrado correctamente');
    });

    it('should show an error when submitting with the tile with empty space', async function() {
        await driver.sleep(5000)
        await publishPublicationFormPage.fillPublicationForm({
            title: ' ',
            description: 'Esta es una descripción de prueba.',
        });

        await publishPublicationFormPage.submitForm();

        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros incorrectos');
        assert.strictEqual(isMessageDisplayed, true, 'El mensaje de error no fue mostrado correctamente');
    });

    
    it('should show an error when submitting with the description with empty space', async function() {
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
