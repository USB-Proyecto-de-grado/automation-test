const buildDriver = require('../../../main/core/driverSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');
const { By } = require('selenium-webdriver');
const supertest = require('supertest');
const apiRequest = supertest(config.apiUrl);
const { createTestUser, deleteTestUser, createMusicEntries, deleteMusicEntries, getCreatedMusicIds } = require('../../hooks/music/musicHooks');

describe('Annual Metrics Page Music Bar Verification [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Crear un usuario para asociar datos
    await createMusicEntries(); // Crear entradas de música para que aparezcan en las métricas
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

  it('TC-171: Verify the blue bars for Music metrics are displayed [Tag: GUI Testing] [Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);

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