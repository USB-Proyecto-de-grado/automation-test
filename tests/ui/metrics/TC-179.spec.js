const buildDriver = require('../../../main/core/driverSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');
const { By, until } = require('selenium-webdriver');
const { createTestUser, createTestUbication, createEventEntries, deleteTestUser, deleteTestUbication, deleteEventEntries } = require('../../hooks/event/eventHooks');

describe('Annual Metrics Page Event Bar and Pie Chart Verification [Tag: GUI Testing][Tag: API Testing]', function () {
  this.timeout(60000);
  let driver;
  let annualMetricsPage;

  // API Setup
  before(async () => {
    await createTestUser(); // Create a test user
    await createTestUbication(); // Create a test ubication
    await createEventEntries(1); // Create event entries
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

  it('TC-179: Verify the teal bars and pie chart for Event metrics are displayed [Tag: GUI Testing] [Tag: API Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(7000);

     // Select the year 2020 in the filter
     await annualMetricsPage.openYearPicker();
     await driver.sleep(7000);
     await annualMetricsPage.selectYear('2020');
     await driver.sleep(7000);
     // Verify the year input field is updated
     const yearValue = await annualMetricsPage.getYearInputValue();
     assert.strictEqual(yearValue, '2020', 'Year input field did not update to the selected year');
     await driver.sleep(5000);
    // Verify bar color for "Eventos"
    const eventBar = await driver.findElement(By.css('.MuiBarElement-series-Eventoid'));
    const barColor = await eventBar.getCssValue('fill');
    const expectedTealColor = 'rgb(2, 178, 175)'; // Teal color for "Eventos"
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
