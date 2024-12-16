const buildDriver = require('../../../main/core/driverSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');
const { By } = require('selenium-webdriver');
const { createTestUser, deleteTestUser, createTestUbication, deleteTestUbication, createEventEntriesByDate, deleteEventEntries } = require('../../hooks/event/eventHooks');

describe('Annual Metrics Page Event Bar Verification for Year 2020 [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Create a test user
    await createTestUbication(); // Create a test ubication
    await createEventEntriesByDate(1, '2020-12-15'); // Create an event entry for the year 2020
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

  it('TC-180: Verify the teal bars for Event metrics are displayed for the year 2020 [Tag: GUI Testing] [Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);

    // Select the year 2020 in the filter
    await annualMetricsPage.openYearPicker();
    await annualMetricsPage.selectYear('2020');

    // Then the year input field should be updated with the selected year
    const yearValue = await annualMetricsPage.getYearInputValue();
    assert.strictEqual(yearValue, '2020', 'Year input field did not update to the selected year');

    // Wait for the page to update with 2020 data
    await driver.sleep(3000);

    // Verify bar color for "Eventos"
    const eventBar = await driver.findElement(By.css('.MuiBarElement-series-Eventoid'));
    const barColor = await eventBar.getCssValue('fill');
    const expectedTealColor = 'rgb(2, 178, 175)'; // Expected teal color for "Eventos"
    assert.strictEqual(barColor, expectedTealColor, 'The bar for "Eventos" is not teal');

    // Verify pie chart segment color for "Eventos"
    const pieSegments = await driver.findElements(By.css('.MuiPieArc-root'));
    let isEventSegmentTeal = false;

    for (const segment of pieSegments) {
      const segmentColor = await segment.getCssValue('fill');
      const visibility = await segment.getAttribute('visibility');
      if (segmentColor === expectedTealColor && visibility === 'visible') {
        isEventSegmentTeal = true;
        break;
      }
    }

    assert.strictEqual(isEventSegmentTeal, true, 'The pie chart segment for "Eventos" is not teal');
  });
});
