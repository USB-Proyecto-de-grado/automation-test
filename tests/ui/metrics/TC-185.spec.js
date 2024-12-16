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

describe('Annual Metrics Chart Verification for a Single Month - Publicaciones [Tag: GUI Testing][Tag: API Testing]', function () {
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

  it('TC-185: Verify publicaciones entries for December appear in charts [Tag: GUI Testing] [Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);
    // Verify the bar for December
    // Verify the bar for December
    const decemberBar = await driver.findElement(
        By.css('.MuiBarElement-series-Publicacionesid[style*="translate3d(807.25px"]')
      );
      const decemberBarColor = await decemberBar.getCssValue('fill');
      const expectedPurpleColor = 'rgb(184, 0, 216)'; // Purple color for "Publicaciones"
      assert.strictEqual(decemberBarColor, expectedPurpleColor, 'The bar for December is not purple');
  
      // Verify the pie chart segment for "Publicaciones"
      const publicationPieSegment = await driver.findElement(
        By.css('.MuiPieArc-root[style*="fill: rgb(184, 0, 216);"]')
      );
      const segmentVisibility = await publicationPieSegment.getAttribute('visibility');
      assert.strictEqual(segmentVisibility, 'visible', 'The pie chart segment for "Publicaciones" is not visible');
  
      // Verify the label count for "Publicaciones" in the pie chart
      const publicationPieLabel = await driver.findElement(
        By.css('.MuiPieArcLabel-root[style*="translate3d(4.43934e-15px, 72.5px"]')
      );
      const publicationLabelText = await publicationPieLabel.getText();
      assert.strictEqual(publicationLabelText, '2', 'The pie chart label for "Publicaciones" does not display the correct count');
    });
  });