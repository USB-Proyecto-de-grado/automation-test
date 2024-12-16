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

describe('Annual Metrics Page Publicaciones Bar Verification for Year 2020 [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Create a user to associate data
    await createMiscPublicationEntries(1); // Create a misc publication entry for the year 2020
  });

  after(async () => {
    await deleteMiscPublicationEntries(); // Clear misc publication entries
    await deleteTestUser(); // Clear the test user
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

  it('TC-183: Verify the purple bars for Publicaciones metrics are displayed for the year 2020 [Tag: GUI Testing] [Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);

    // Verify bar color for "Publicaciones"
    const publicacionesBar = await driver.findElement(By.css('.MuiBarElement-series-Publicacionesid'));
    const barColor = await publicacionesBar.getCssValue('fill');
    const expectedPurpleColor = 'rgb(184, 0, 216)'; // Expected purple color for "Publicaciones"
    assert.strictEqual(barColor, expectedPurpleColor, 'The bar for "Publicaciones" is not purple');

    // Verify pie chart segment color for "Publicaciones"
    const pieSegments = await driver.findElements(By.css('.MuiPieArc-root'));
    let isPublicacionesSegmentPurple = false;

    for (const segment of pieSegments) {
      const segmentColor = await segment.getCssValue('fill');
      const visibility = await segment.getAttribute('visibility');
      if (segmentColor === expectedPurpleColor && visibility === 'visible') {
        isPublicacionesSegmentPurple = true;
        break;
      }
    }

    assert.strictEqual(isPublicacionesSegmentPurple, true, 'The pie chart segment for "Publicaciones" is not purple');
  });
});
