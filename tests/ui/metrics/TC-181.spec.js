const buildDriver = require('../../../main/core/driverSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');
const { By } = require('selenium-webdriver');
const { createTestUser, deleteTestUser, createTestUbication, deleteTestUbication, createEventEntriesByDate, deleteEventEntries } = require('../../hooks/event/eventHooks');

describe('Annual Metrics Table Verification for Events [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Create a test user
    await createTestUbication(); // Create a test ubication
    await createEventEntriesByDate(1, '2020-12-15'); // Create an event entry for 2020
  });

  after(async () => {
    await deleteEventEntries(); // Clear event data
    await deleteTestUbication(); // Clear ubication data
    await deleteTestUser(); // Clear user data
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

  it('TC-181: Verify the Annual Metrics table displays the correct event count [Tag: GUI Testing][Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);

    // Select the year 2020 in the filter
    await annualMetricsPage.openYearPicker();
    await annualMetricsPage.selectYear('2020');

    // Verify the year input field is updated
    const yearValue = await annualMetricsPage.getYearInputValue();
    assert.strictEqual(yearValue, '2020', 'Year input field did not update to the selected year');

    // Wait for the table to update with 2020 data
    await driver.sleep(3000);

    // Locate the table row for the created user
    const tableRows = await driver.findElements(By.css('.MuiDataGrid-row'));
    assert(tableRows.length > 0, 'No rows found in the table');

    let isUserRowFound = false;

    for (const row of tableRows) {
      const emailCell = await row.findElement(By.css('[data-field="user_email"]'));
      const emailText = await emailCell.getText();

      if (emailText === 'eventTestUser@example.com') {
        isUserRowFound = true;

        // Verify the "totalevents" cell displays the correct value
        const eventCell = await row.findElement(By.css('[data-field="totalevents"]'));
        const eventCount = await eventCell.getText();

        assert.strictEqual(eventCount, '1', 'The total events count is incorrect');
        break;
      }
    }

    assert(isUserRowFound, 'The user email "eventTestUser@example.com" was not found in the table');
  });
});
