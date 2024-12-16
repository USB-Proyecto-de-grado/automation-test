const buildDriver = require('../../../main/core/driverSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');
const { By, until } = require('selenium-webdriver');

describe('Annual Metrics Page Hover Tests [Tag: GUI Testing][Tag: Functional Testing]', function () {
  this.timeout(50000);
  let driver;
  let annualMetricsPage;

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

  it('TC-169: should display tooltip with correct details on hover [Tag: GUI Testing] [Tag: Functional Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);

    // Locate the SVG bar element for the month of January
    const januaryBar = await driver.findElement(
      By.css('.MuiBarElement-series-Eventoid[style*="translate3d(61.4px"]')
    );

    // Perform hover action on the bar
    const actions = driver.actions({ async: true });
    await actions.move({ origin: januaryBar }).perform();

    // Wait for the tooltip to appear
    const tooltipSelector = '.MuiChartsTooltip-root'; // Replace with the actual tooltip class
    await driver.wait(until.elementLocated(By.css(tooltipSelector)), 5000, 'Tooltip did not appear');

    const tooltip = await driver.findElement(By.css(tooltipSelector));

    // Assert that the tooltip is displayed
    const isTooltipDisplayed = await tooltip.isDisplayed();
    assert.strictEqual(isTooltipDisplayed, true, 'Tooltip is not displayed on hover');

    // Verify the content of the tooltip
    const tooltipText = await tooltip.getText();
    console.log('Tooltip Text:', tooltipText); // Debugging

    assert(tooltipText.includes('Enero'), 'Tooltip does not contain "Enero"');
    assert(tooltipText.includes('Evento'), 'Tooltip does not contain "Evento"');
    assert(tooltipText.includes('Músicas'), 'Tooltip does not contain "Músicas"');
    assert(tooltipText.includes('Publicaciones'), 'Tooltip does not contain "Publicaciones"');
  });
});
