const buildDriver = require('../../../main/core/driverSetUp');
const PreTestSetup = require('../../../main/setup/preSetUp');
const PublishMusicFormPage = require('../../../page-objects/publishPages/publishMusicFormPage');
const AlertSnackBarPage = require('../../../page-objects/common/alertSnackBarPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
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

    it('TC-158: should show validation errors when fields are wrongly typed [Tag: GUI Testing] [Tag: Negative Testing] [Tag: Functional Testing]', async function() {
        // Given the form is filled with invalid data
        await driver.sleep(5000);
        await publishMusicFormPage.fillMusicForm({
            youTubeLink: 'a',
            title: 'a',
            description: 'a'
        });

        // When the form is submitted
        await publishMusicFormPage.submitForm();
        
        // Then validation errors should be displayed
        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros no válidos en la aplicación');
        assert.strictEqual(isMessageDisplayed, true);
    });
});
