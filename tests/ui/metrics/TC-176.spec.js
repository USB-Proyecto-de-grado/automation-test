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

describe('Annual Metrics Table Verification for All Months [Tag: GUI Testing][Tag: API Testing]', function () {
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

  it('TC-176: Verify the Annual Metrics table displays correct data for all months [Tag: GUI Testing][Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(7000);

    // Select the year 2020 in the filter
    await annualMetricsPage.openYearPicker();
    await annualMetricsPage.selectYear('2020');

    // Verify the year input field is updated
    const yearValue = await annualMetricsPage.getYearInputValue();
    assert.strictEqual(yearValue, '2020', 'Year input field did not update to the selected year');

    // Wait for the table to update with 2020 data
    await driver.sleep(3000);

    // Find all rows in the table
    const tableRows = await driver.findElements(By.css('.MuiDataGrid-row'));

    let isUserRowFound = false;

    // Loop through rows to find the correct user email
    for (const row of tableRows) {
      const emailCell = await row.findElement(By.css('[data-field="user_email"]'));
      const emailText = await emailCell.getText();

      if (emailText === 'music@example.com') {
        isUserRowFound = true;

        // Verify the "totalmusics" cell displays the correct value
        const musicCell = await row.findElement(By.css('[data-field="totalmusics"]'));
        const musicCount = await musicCell.getText();

        assert.strictEqual(musicCount, '12', 'The total musics count is incorrect');

        // Verify the "total" cell displays the correct value
        const totalCell = await row.findElement(By.css('[data-field="total"]'));
        const totalCount = await totalCell.getText();

        assert.strictEqual(totalCount, '12', 'The total count is incorrect');
        break;
      }
    }

    // Assert that the correct row was found
    assert(isUserRowFound, 'The user email "music@example.com" was not found in the table');
  });
});
