const buildDriver = require('../../../main/core/driverSetUp');
const PreTestSetup = require('../../../main/setup/preSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');

describe('Annual Metrics Page Tests [Tag: GUI Testing][Tag: Functional Testing]', function () {
  this.timeout(50000);
  let driver;
  let preTestSetup;
  let annualMetricsPage;

  beforeEach(async function () {
    driver = buildDriver();
    annualMetricsPage = new AnnualMetricsPage(driver);

    await driver.get(config.uiUrl + '/admin');
    await driver.wait(async () => {
      const readyState = await driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, 10000, 'The Annual Metrics page did not load correctly');
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      const screenshotPath = await takeScreenshot(driver, this.currentTest.title);
      addContext(this, {
        title: 'Screenshot',
        value: screenshotPath,
      });
    }
    await driver.quit();
  });

  it('TC-167: should verify annual metrics data with no data [Tag: GUI Testing] [Tag: Functional Testing]', async function () {
    // Given the user is on the Annual Metrics page
    await driver.sleep(5000); // Wait for all elements to be ready

    // When the user interacts with the page elements
    await annualMetricsPage.setYear('2024');
    await annualMetricsPage.searchInGrid('Email');

    const emailText = await annualMetricsPage.getEmailText();
    const totalEventsText = await annualMetricsPage.getTotalEventsText();
    const totalPublicationsText = await annualMetricsPage.getTotalPublicationsText();
    const totalMusicsText = await annualMetricsPage.getTotalMusicsText();
    const totalText = await annualMetricsPage.getTotalText();
    const isBarChartDisplayed = await annualMetricsPage.isBarChartDisplayed();

    // Then the user should see correct data and charts displayed
    assert.strictEqual(emailText, 'Email', 'Email does not match expected value');
    assert.strictEqual(totalEventsText, 'Total Eventos', 'Total Events does not match expected value');
    assert.strictEqual(totalPublicationsText, 'Total Publicaciones', 'Total Publications does not match expected value');
    assert.strictEqual(totalMusicsText, 'Total Músicas', 'Total Musics does not match expected value');
    assert.strictEqual(totalText, 'Total', 'Total does not match expected value');
    assert.strictEqual(isBarChartDisplayed, true, 'Bar Chart is not displayed');
  });
});
