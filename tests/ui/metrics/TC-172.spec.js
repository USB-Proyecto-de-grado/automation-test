const buildDriver = require('../../../main/core/driverSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');
const { By } = require('selenium-webdriver');
const supertest = require('supertest');
const apiRequest = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createMusicEntries, deleteMusicEntries, createMusicEntriesByDate, getCreatedMusicIds } = require('../../hooks/music/musicHooks');

describe('Annual Metrics Page Music Bar Verification for Year 2020 [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Crear un usuario para asociar datos
    await createMusicEntriesByDate(1, '2020-12-15'); // Crear entrada de música en el año 2020
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

  it('TC-172: Verify the blue bars for Music metrics are displayed for the year 2020 [Tag: GUI Testing] [Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);

    // Select the year 2020 in the filter
    await annualMetricsPage.openYearPicker();
    await driver.sleep(5000);
    await annualMetricsPage.selectYear('2020');
    await driver.sleep(5000);
    // Then the year input field should be updated with the selected year
    const yearValue = await annualMetricsPage.getYearInputValue();
    assert.strictEqual(yearValue, '2020', 'Year input field did not update to the selected year');

    // Wait for the page to update with 2020 data
    await driver.sleep(3000);

    // Verify bar color for "Músicas"
    const musicBar = await driver.findElement(By.css('.MuiBarElement-series-Músicasid'));
    const barColor = await musicBar.getCssValue('fill');
    const expectedBlueColor = 'rgb(46, 150, 255)'; // Color azul esperado
    assert.strictEqual(barColor, expectedBlueColor, 'The bar for "Músicas" is not blue');

    // Verify pie chart segment color for "Músicas"
    const pieSegments = await driver.findElements(By.css('.MuiPieArc-root'));
    let isMusicSegmentBlue = false;

    for (const segment of pieSegments) {
      const segmentColor = await segment.getCssValue('fill');
      const visibility = await segment.getAttribute('visibility');
      if (segmentColor === expectedBlueColor && visibility === 'visible') {
        isMusicSegmentBlue = true;
        break;
      }
    }

    assert.strictEqual(isMusicSegmentBlue, true, 'The pie chart segment for "Músicas" is not blue');
  });
});
