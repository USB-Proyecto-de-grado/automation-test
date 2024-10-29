const buildDriver = require('../../../main/core/driverSetUp');
const PreTestSetup = require('../../../main/setup/preSetUp');
const PublishEventFormPage = require('../../../page-objects/publishPages/publishEventFormPage');
const ErrorValidationPage = require('../../../page-objects/common/errorValidationPage');
const AlertSnackBarPage = require('../../../page-objects/common/alertSnackBarPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');

describe('Publish Event Form Tests [Tag: GUI Testing][Tag: Functional Testing]', function () {
  this.timeout(50000);
  let driver;
  let preTestSetup;
  let publishEventFormPage;
  let errorValidationPage;
  let alertSnackBarPage;

  beforeEach(async function () {
    driver = buildDriver();
    preTestSetup = new PreTestSetup(driver);
    await preTestSetup.loginToGoogle(config.googleUser, config.googlePassword);
    publishEventFormPage = new PublishEventFormPage(driver);
    errorValidationPage = new ErrorValidationPage(driver);
    alertSnackBarPage = new AlertSnackBarPage(driver);

    await driver.get(config.uiUrl + '/publish/event');
    await driver.wait(async () => {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
    }, 10000, 'La página localhost no se cargó correctamente');
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      const screenshotPath = await takeScreenshot(driver, this.currentTest.title);
      addContext(this, {
        title: 'Screenshot',
        value: screenshotPath
      });
    };
    await driver.quit();
  });

  it('TC-150: should fill the form and submit successfully  [Tag: GUI Testing] [Tag: Acceptance Testing] [Tag: Functional Testing] [Tag: Smoke Testing]', async function () {
    // Given the user is on the Publish Event form page
    await driver.sleep(5000); // Wait for all elements to be ready

    // When the user fills in the event form and submits
    await publishEventFormPage.fillEventForm({
      title: 'Veladas de invierno - UMSS',
      date: '08/12/2024',
      ubication: 'Aula Magna de Humanidades',
      price: '100',
      description: 'Ven y disfruta de este magnífico evento preparado con mucho cariño para todos.',
    });
    await publishEventFormPage.submitForm();

    // Then the user should see a success message
    const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Publicado de manera exitosa');
    assert.strictEqual(isMessageDisplayed, true, 'El mensaje de éxito no fue mostrado correctamente');
  });

});