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

describe('Annual Metrics Chart Verification for Multiple Months [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Create a user to associate data
    // Create two music entries for different months in 2020
    await createMusicEntriesByDate(1, '2020-01-15'); // January 2020
    await createMusicEntriesByDate(1, '2020-03-10'); // March 2020
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

  it('TC-174: Verify music entries for different months appear in charts [Tag: GUI Testing] [Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);

    // Select the year 2020 in the filter
    await annualMetricsPage.openYearPicker();
    await driver.sleep(3000);
    await annualMetricsPage.selectYear('2020');
    await driver.sleep(3000);
    // Verify the year input field is updated
    const yearValue = await annualMetricsPage.getYearInputValue();
    assert.strictEqual(yearValue, '2020', 'Year input field did not update to the selected year');

    await driver.sleep(3000);

    // Verify the bar for January
    const januaryBar = await driver.findElement(
      By.css('.MuiBarElement-series-Músicasid[style*="translate3d(74.375px"]')
    );
    const januaryBarColor = await januaryBar.getCssValue('fill');
    const expectedBlueColor = 'rgb(46, 150, 255)'; // Blue color for music
    assert.strictEqual(januaryBarColor, expectedBlueColor, 'The bar for January is not blue');

    // Verify the bar for March
    const marchBar = await driver.findElement(
      By.css('.MuiBarElement-series-Músicasid[style*="translate3d(204.375px"]')
    );
    const marchBarColor = await marchBar.getCssValue('fill');
    assert.strictEqual(marchBarColor, expectedBlueColor, 'The bar for March is not blue');

    // Verify the pie chart segment and label for "Músicas"
    const musicPieSegment = await driver.findElement(
      By.css('.MuiPieArc-root[style*="fill: rgb(46, 150, 255);"]')
    );
    const segmentVisibility = await musicPieSegment.getAttribute('visibility');
    assert.strictEqual(segmentVisibility, 'visible', 'The pie chart segment for "Músicas" is not visible');

    // Verify the label count for "Músicas" in the pie chart
    const musicPieLabel = await driver.findElement(
      By.css('.MuiPieArcLabel-root[style*="translate3d(4.43934e-15px, 72.5px"]')
    );
    const musicLabelText = await musicPieLabel.getText();
    assert.strictEqual(musicLabelText, '2', 'The pie chart label for "Músicas" does not display the correct count');
  });
});