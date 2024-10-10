const buildDriver = require('../../../../main/core/driverSetUp');
const PreTestSetup = require('../../../../main/setup/preSetUp');
const PublishMusicFormPage = require('../../../../page-objects/publishPages/publishMusicFormPage');
const AlertSnackBarPage = require('../../../../page-objects/common/alertSnackBarPage');
const { takeScreenshot } = require('../../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../../config');
const assert = require('assert');

describe('Publish Music Form Tests [Tag: GUI Testing][Tag: Functional Testing]', function() {
    this.timeout(50000);
    let driver;
    let preTestSetup;
    let publishMusicFormPage;
    let alertSnackBarPage;

    beforeEach(async function() {
        driver = buildDriver();
        preTestSetup = new PreTestSetup(driver);
        await preTestSetup.loginToGoogle(config.googleUser, config.googlePassword);
        publishMusicFormPage = new PublishMusicFormPage(driver);
        alertSnackBarPage = new AlertSnackBarPage(driver);
        await driver.get(config.uiUrl + '/publish/music');
        await driver.wait(async () => {
            const readyState = await driver.executeScript('return document.readyState');
            return readyState === 'complete';
        }, 10000, 'La página localhost no se cargó correctamente');
    });

    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            const screenshotPath = await takeScreenshot(driver, this.currentTest.title);
            addContext(this, {
              title: 'Screenshot',
              value: screenshotPath
            });
          };
        if (driver) {
            await driver.quit();
        }
    });

    it('should detect and handle an invalid YouTube link submission [Tag: Negative][Tag: Validation]', async function() {
        await driver.sleep(5000);
        await publishMusicFormPage.fillMusicForm({
            youTubeLink: 'https://www.youtube.com/watch?v=InvalidVideoID', // Invalid Link
            title: 'Test Song Title',
            description: 'Test Description'
        });

        await publishMusicFormPage.submitForm();

        const isVideoUnavailableMessageDisplayed = await alertSnackBarPage.verifyMessage('Este video no está disponible.');
        assert.strictEqual(isVideoUnavailableMessageDisplayed, true, 'Expected error message not displayed for unavailable video');
    });

    it('should fill the form and submit successfully [Tag: Positive][Tag: Submission]', async function() {
        await driver.sleep(5000)
        await publishMusicFormPage.fillMusicForm({
            youTubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'Never Gonna Give You Up',
            description: 'Classic hit by Rick Astley.',
        });

        await publishMusicFormPage.submitForm();
        
        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Publicado de manera exitosa');
        assert.strictEqual(isMessageDisplayed, true);
    });

    it('should show validation errors when fields the field Link is worng typed [Tag: Negative][Tag: Validation]', async function() {
        await driver.sleep(5000)
        await publishMusicFormPage.fillMusicForm({
            youTubeLink: 'a',
            title: 'a',
            description: 'a'
        });

        await publishMusicFormPage.submitForm();
        
        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros no válidos en la aplicación');
        assert.strictEqual(isMessageDisplayed, true);
    });

    it('should show validation errors when the youtubeLink is with an empty space [Tag: Negative][Tag: Validation]', async function() {
        await driver.sleep(5000)
        await publishMusicFormPage.fillMusicForm({
            youTubeLink: ' ',
            title: 'a',
            description: 'a'
        });

        await publishMusicFormPage.submitForm();
        
        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros no válidos en la aplicación');
        assert.strictEqual(isMessageDisplayed, true);
    });

    it('should show validation errors when the title is with an empty space [Tag: Negative][Tag: Validation]', async function() {
        await driver.sleep(5000)
        await publishMusicFormPage.fillMusicForm({
            youTubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            title: ' ',
            description: 'Classic hit by Rick Astley.'
        });

        await publishMusicFormPage.submitForm();
        
        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros no válidos en la aplicación');
        assert.strictEqual(isMessageDisplayed, true);
    });

    it('should show validation errors when the description is with an empty space [Tag: Negative][Tag: Validation]', async function() {
        await driver.sleep(5000)
        await publishMusicFormPage.fillMusicForm({
            youTubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'Never Gonna Give You Up',
            description: ' '
        });

        await publishMusicFormPage.submitForm();
        
        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros no válidos en la aplicación');
        assert.strictEqual(isMessageDisplayed, true);
    });
});
