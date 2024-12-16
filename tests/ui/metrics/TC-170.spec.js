const buildDriver = require('../../../main/core/driverSetUp');
const AnnualMetricsPage = require('../../../page-objects/admin/AnnualMetricsPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');
const config = require('../../../config');
const assert = require('assert');
const { By, until } = require('selenium-webdriver');

describe('Annual Metrics Page Export Button Tests [Tag: GUI Testing][Tag: Functional Testing]', function () {
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

  it('TC-170: should display the export menu when clicking the Export button [Tag: GUI Testing][Tag: Functional Testing]', async function () {
    // Ensure the page and elements are fully loaded
    await driver.sleep(5000);

    // Locate the Export button
    const exportButton = await driver.findElement(By.xpath('//button[contains(text(), "Exportar")]'));

    // Click the Export button
    await exportButton.click();

    // Wait for the menu to appear
    const menuSelector = '.MuiPopper-root.MuiDataGrid-menu';
    await driver.wait(until.elementLocated(By.css(menuSelector)), 5000, 'The export menu did not appear');

    // Locate the menu and verify its visibility
    const exportMenu = await driver.findElement(By.css(menuSelector));
    const isMenuDisplayed = await exportMenu.isDisplayed();

    // Assert that the menu is displayed
    assert.strictEqual(isMenuDisplayed, true, 'The export menu is not displayed after clicking the Export button');

    // Verify the options in the menu
    const menuItems = await exportMenu.findElements(By.css('.MuiMenuItem-root'));
    const menuTexts = await Promise.all(menuItems.map(async (item) => await item.getText()));

    assert(menuTexts.includes('Descargar como CSV'), 'The "Descargar como CSV" option is not present in the menu');
    assert(menuTexts.includes('Imprimir'), 'The "Imprimir" option is not present in the menu');
  });
});
