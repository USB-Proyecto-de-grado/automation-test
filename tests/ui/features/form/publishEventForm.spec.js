const buildDriver = require('../../../../main/core/driverSetUp');
const PreTestSetup = require('../../../../main/setup/preSetUp');
const PublishEventFormPage = require('../../../../page-objects/publishPages/publishEventFormPage');
const ErrorValidationPage = require('../../../../page-objects/common/errorValidationPage');
const AlertSnackBarPage = require('../../../../page-objects/common/alertSnackBarPage');
const { takeScreenshot } = require('../../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../../config');
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

  it('should fill the form and submit successfully [Tag: Positive]', async function () {
    await driver.sleep(5000)
    await publishEventFormPage.fillEventForm({
      title: 'Veladas de invierno - UMSS',
      date: '08/12/2024',
      ubication: 'Aula Magna de Humanidades',
      price: '100',
      description: 'Ven y disfruta de este magnífico evento preparado con mucho cariño para todos.',
    });

    await publishEventFormPage.submitForm();

    const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Publicado de manera exitosa');
    assert.strictEqual(isMessageDisplayed, true, 'El mensaje de éxito no fue mostrado correctamente');
  });

  it('submit successfully when the ubication dont exist in the database [Tag: Edge Case]', async function () {
    await driver.sleep(5000)
    await publishEventFormPage.fillEventForm({
      title: 'Veladas de invierno - UMSS',
      date: '08/12/2024',
      ubication: 'Dont exist',
      price: '100',
      description: 'Ven y disfruta de este magnífico evento preparado con mucho cariño para todos.',
    });

    await publishEventFormPage.submitForm();

    const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Publicado de manera exitosa');
    assert.strictEqual(isMessageDisplayed, true, 'El mensaje de éxito no fue mostrado correctamente');
  });

  it('should show validation errors when the price is negative [Tag: Negative][Tag: Validation]', async function () {
    await driver.sleep(5000)
    await publishEventFormPage.fillEventForm({
      title: 'Veladas de invierno - UMSS',
      date: '08/12/2024',
      ubication: 'Aula Magna de Humanidades',
      price: '-1',
      description: 'Ven y disfruta de este magnífico evento preparado con mucho cariño para todos.',
    });

    await publishEventFormPage.submitForm();

    const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros no válidos en la aplicación');
        assert.strictEqual(isMessageDisplayed, true);
  });

  it('should show validation errors when the title is with an empty space [Tag: Negative][Tag: Validation]', async function () {
    await driver.sleep(5000)
    await publishEventFormPage.fillEventForm({
      title: ' ',
      date: '08/12/2024',
      ubication: 'Aula Magna de Humanidades',
      price: '0',
      description: 'Ven y disfruta de este magnífico evento preparado con mucho cariño para todos.',
    });

    await publishEventFormPage.submitForm();

    const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Parámetros no válidos en la aplicación [Tag: Negative][Tag: Validation]');
        assert.strictEqual(isMessageDisplayed, true);
  });

  it('should show validation errors when the description is with an empty space  [Tag: Negative][Tag: Validation]', async function () {
    await driver.sleep(5000)
    await publishEventFormPage.fillEventForm({
      title: 'Veladas de invierno - UMSS',
      date: '08/12/2024',
      ubication: 'Aula Magna de Humanidades',
      price: '100',
      description: ' ',
    });

    await publishEventFormPage.submitForm();

    const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Publicado de manera exitosa');
    assert.strictEqual(isMessageDisplayed, true, 'El mensaje de éxito no fue mostrado correctamente');
  });

  it('should show validation errors when the description is with an empty space  [Tag: Negative][Tag: Validation]', async function () {
    await driver.sleep(5000)
    await publishEventFormPage.fillEventForm({
      title: 'Veladas de invierno - UMSS',
      date: '08/12/2024',
      ubication: ' ',
      price: '100',
      description: 'Ven y disfruta de este magnífico evento preparado con mucho cariño para todos.',
    });

    await publishEventFormPage.submitForm();

    const isMessageDisplayed = await alertSnackBarPage.verifyMessage('Publicado de manera exitosa');
    assert.strictEqual(isMessageDisplayed, true, 'El mensaje de éxito no fue mostrado correctamente');
  });
});