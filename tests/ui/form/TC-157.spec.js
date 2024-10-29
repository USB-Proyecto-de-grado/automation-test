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

    it('TC-157: should fill the form and submit successfully [Tag: GUI Testing] [Tag: Acceptance Testing] [Tag: Functional Testing] [Tag: Smoke Testing]', async function() {
        // Given the form is filled with valid data
        await driver.sleep(5000);
        await publishMusicFormPage.fillMusicForm({
            youTubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'Never Gonna Give You Up',
            description: 'Classic hit by Rick Astley.',
        });

        // When the form is submitted
        await publishMusicFormPage.submitForm();
        
        // Then a success message should be displayed
        const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Publicado de manera exitosa');
        assert.strictEqual(isMessageDisplayed, true);
    });
});
