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

describe('Annual Metrics Table Verification for Music [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Crear un usuario para asociar datos
    await createMusicEntriesByDate(1, '2020-12-15'); // Crear una entrada de música en 2020
  });

  after(async () => {
    await deleteMusicEntries(); // Limpiar datos de música
    await deleteTestUser(); // Eliminar el usuario creado
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

  it('TC-173: Verify the Annual Metrics table displays the correct music count [Tag: GUI Testing] [Tag: API Testing]', async function () {
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

      if (emailText === 'music@example.com') {
        isUserRowFound = true;

        // Verify the "totalmusics" cell displays the correct value
        const musicCell = await row.findElement(By.css('[data-field="totalmusics"]'));
        const musicCount = await musicCell.getText();

        assert.strictEqual(musicCount, '1', 'The total musics count is incorrect');
        break;
      }
    }

    assert(isUserRowFound, 'The user email "music@example.com" was not found in the table');
  });
});
