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

  it('TC-168: should verify year selection updates the input field [Tag: GUI Testing] [Tag: Functional Testing]', async function () {
    // Given the user is on the Annual Metrics page
    await driver.sleep(5000); // Wait for all elements to be ready

    // When the user opens the year picker and selects a specific year
    await annualMetricsPage.openYearPicker();
    await annualMetricsPage.selectYear('2023');

    // Then the year input field should be updated with the selected year
    const yearValue = await annualMetricsPage.getYearInputValue();
    assert.strictEqual(yearValue, '2023', 'Year input field did not update to the selected year');
  });
});
