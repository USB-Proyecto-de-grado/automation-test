const buildDriver = require('../../../main/core/driverSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');
const { By } = require('selenium-webdriver');
const supertest = require('supertest');
const apiRequest = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createMusicEntriesByDate, deleteMusicEntries } = require('../../hooks/music/musicHooks');

describe('Annual Metrics Chart Verification for All Months [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Create a user to associate data

    // Create one music entry for each month of 2020
    const months = [
      '2020-01-15', '2020-02-15', '2020-03-15', '2020-04-15',
      '2020-05-15', '2020-06-15', '2020-07-15', '2020-08-15',
      '2020-09-15', '2020-10-15', '2020-11-15', '2020-12-15'
    ];
    for (const date of months) {
      await createMusicEntriesByDate(1, date);
    }
  });

  after(async () => {
    await deleteMusicEntries(); // Clear music data
    await deleteTestUser(); // Delete the created user
  });

  // GUI Setup
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

  it('TC-177: Verify Bar Chart for "Músicas" Series Across Months [Tag: GUI Testing][Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);

    // Open the year picker and select 2020
    await annualMetricsPage.openYearPicker();
    await driver.sleep(2000); // Wait for the dialog to appear
    await annualMetricsPage.selectYear('2020');

    // Verify the year input field is updated
    const yearValue = await annualMetricsPage.getYearInputValue();
    assert.strictEqual(yearValue, '2020', 'Year input field did not update to the selected year');

    // Wait for the bar chart to update
    await driver.sleep(3000);

    // Locate all bars for the "Músicas" series
    const musicBars = await driver.findElements(By.css('.MuiBarElement-series-Músicasid'));
    assert.strictEqual(musicBars.length, 12, 'The bar chart does not have bars for all months');

    // Verify the bar labels dynamically for each month
    for (let i = 0; i < musicBars.length; i++) {
        const expectedTranslateValue = `${74.375 + i * 65}px`;
        const barElement = musicBars[i];

        // Verify the bar's position
        const barStyle = await barElement.getAttribute('style');
        assert(
            barStyle.includes(`translate3d(${expectedTranslateValue}`),
            `Bar position for month ${i + 1} is incorrect: ${barStyle}`
        );

        // Verify the label corresponding to the bar
        const barLabel = await driver.findElement(
            By.css(`.MuiBarLabel-root[style*="translate3d(${82.5 + i * 65}px"]`)
        );
        const labelText = await barLabel.getText();
        assert.strictEqual(labelText, '1', `Bar label for month ${i + 1} is incorrect: ${labelText}`);
    }
});

});
