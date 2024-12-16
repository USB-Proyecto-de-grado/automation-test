const buildDriver = require('../../../main/core/driverSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');
const { By } = require('selenium-webdriver');
const {
  createTestUser,
  deleteTestUser,
  createMiscPublicationEntries,
  deleteMiscPublicationEntries,
} = require('../../hooks/miscPublicationController/miscPublicationHooks');

describe('Annual Metrics Table Verification for Publicaciones [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Create a user to associate data
    await createMiscPublicationEntries(1); // Create a misc publication entry for 2020
  });

  after(async () => {
    await deleteMiscPublicationEntries(); // Clear publication data
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

  it('TC-184: Verify the Annual Metrics table displays the correct publication count [Tag: GUI Testing] [Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);

    // Wait for the table to update with 2020 data
    await driver.sleep(3000);

    // Locate the table row for the created user
    const tableRows = await driver.findElements(By.css('.MuiDataGrid-row'));
    assert(tableRows.length > 0, 'No rows found in the table');

    let isUserRowFound = false;

    for (const row of tableRows) {
      const emailCell = await row.findElement(By.css('[data-field="user_email"]'));
      const emailText = await emailCell.getText();

      if (emailText === 'publication@example.com') {
        isUserRowFound = true;

        // Verify the "totalpublications" cell displays the correct value
        const publicationCell = await row.findElement(By.css('[data-field="totalpublications"]'));
        const publicationCount = await publicationCell.getText();

        assert.strictEqual(publicationCount, '1', 'The total publications count is incorrect');
        break;
      }
    }

    assert(isUserRowFound, 'The user email "publication@example.com" was not found in the table');
  });
});
