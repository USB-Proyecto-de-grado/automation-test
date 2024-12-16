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
  createEventEntries,
  deleteEventEntries,
  createTestUbication,
  deleteTestUbication,
} = require('../../hooks/event/eventHooks');

describe('Annual Metrics Chart Verification for a Single Month - Events [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Create a user to associate data
    await createTestUbication();
    await createEventEntries(2); // Create two "Events" entries for December 2020
  });

  after(async () => {
    await deleteEventEntries(); // Clear "Events" data
    await deleteTestUbication();
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

  it('TC-187: Verify event entries for December appear in charts with event [Tag: GUI Testing] [Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);
    // Verify the bar for December
    const bars = await driver.findElements(By.css('.MuiBarElement-series-Eventoid'));
    let decemberBar = null;

    for (const bar of bars) {
      const style = await bar.getAttribute('style');
      if (style.includes('translate3d(771.5px')) { // Updated value for December
        decemberBar = bar;
        break;
      }
    }

    assert(decemberBar !== null, 'The bar for December is not found');
    const decemberBarColor = await decemberBar.getCssValue('fill');
    const expectedTealColor = 'rgb(2, 178, 175)'; // Teal color for "Events"
    assert.strictEqual(decemberBarColor, expectedTealColor, 'The bar for December is not teal');

    // Verify the pie chart segment for "Events"
    const eventPieSegment = await driver.findElement(
      By.css('.MuiPieArc-root[style*="fill: rgb(2, 178, 175);"]')
    );
    const segmentVisibility = await eventPieSegment.getAttribute('visibility');
    assert.strictEqual(segmentVisibility, 'visible', 'The pie chart segment for "Events" is not visible');

    // Verify the label count for "Events" in the pie chart
    const eventPieLabel = await driver.findElement(
      By.css('.MuiPieArcLabel-root')
    );
    const eventLabelText = await eventPieLabel.getText();
    assert.strictEqual(eventLabelText, '2', 'The pie chart label for "Events" does not display the correct count');
  });
});