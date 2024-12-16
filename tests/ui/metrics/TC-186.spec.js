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


describe('Annual Metrics Table Verification for Publicaciones - Same Month [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Create a user to associate data
    await createMiscPublicationEntries(2); // Create two "Publicaciones" entries for December 2020
  });

  after(async () => {
    await deleteMiscPublicationEntries(); // Clear "Publicaciones" data
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

  it('TC-186: Verify the Annual Metrics table displays the correct publication count for the same month [Tag: GUI Testing][Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(7000);

    // Find all rows in the table
    const tableRows = await driver.findElements(By.css('.MuiDataGrid-row'));
  
    let isUserRowFound = false;
  
    for (const row of tableRows) {
      const emailCell = await row.findElement(By.css('[data-field="user_email"]'));
      const emailText = await emailCell.getText();
  
      if (emailText === 'publication@example.com') {
        isUserRowFound = true;
  
        // Debugging: Print row HTML to verify structure
        const rowHTML = await row.getAttribute('outerHTML');
        console.log('Row HTML:', rowHTML);
  
        // Verify the "totalpublications" cell displays the correct value
        const publicationsCell = await row.findElement(By.css('[data-field="totalpublications"]'));
        const publicationCount = await publicationsCell.getText();
  
        assert.strictEqual(publicationCount, '2', 'The total publications count is incorrect');
  
        // Verify the "total" cell displays the correct value
        const totalCell = await row.findElement(By.css('[data-field="total"]'));
        const totalCount = await totalCell.getText();
  
        assert.strictEqual(totalCount, '2', 'The total count is incorrect');
        break;
      }
    }
  
    assert(isUserRowFound, 'The user email "publication@example.com" was not found in the table');
  });
  
});