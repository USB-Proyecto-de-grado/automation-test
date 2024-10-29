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

  it('TC-151: submit successfully when the ubication does not exist in the database  [Tag: GUI Testing] [Tag: Negative Testing] [Tag: Functional Testing]', async function () {
    // Given the user is on the Publish Event form page and enters an unknown location
    await driver.sleep(5000);
    await publishEventFormPage.fillEventForm({
      title: 'Veladas de invierno - UMSS',
      date: '08/12/2024',
      ubication: 'Dont exist',
      price: '100',
      description: 'Ven y disfruta de este magnífico evento preparado con mucho cariño para todos.',
    });

    // When the user submits the form
    await publishEventFormPage.submitForm();

    // Then the user should see a success message despite the unknown location
    const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Publicado de manera exitosa');
    assert.strictEqual(isMessageDisplayed, true, 'El mensaje de éxito no fue mostrado correctamente');
  });

});