const { Builder, By, until } = require('selenium-webdriver');
const buildDriver = require('../../../main/core/driverSetUp');
const config = require('../../../config');
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const HomePage = require('../../../page-objects/home/homePage');
const VideoPlayerPage = require('../../../page-objects/common/videoPlayerPage');
const { takeScreenshot } = require('../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');

describe('Feature Tests for Random Player', function() {
    this.timeout(50000);
    let driver;
    let homePage;
    let videoPlayerPage;

    beforeEach(async function() {
        driver = buildDriver();
        homePage = new HomePage(driver);
        videoPlayerPage = new VideoPlayerPage(driver);
        await driver.get(config.uiUrl);
    });

    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            const screenshotPath = await takeScreenshot(driver, this.currentTest.title);
            addContext(this, {
              title: 'Screenshot',
              value: screenshotPath
            });
          };
          await driver.quit();
    });

    it('TC-140: should verify that clicking "Reproducir al Azar" changes the video title [Tag: GUI Testing] [Tag: Functional Testing]', async function() {
        // When the user changes the video using "Reproducir al Azar"
        await homePage.clickDropdown();
        const iframe = await driver.findElement(By.css('iframe'));
        await driver.switchTo().frame(iframe);
        let initialTitleElement = await driver.wait(until.elementLocated(By.css('.ytp-title-link')), 10000);
        let initialTitle = await initialTitleElement.getText();
        await driver.switchTo().defaultContent();
        await homePage.clickRandomPlay();
        await driver.sleep(5000);
        await driver.switchTo().frame(iframe);
        let newTitleElement = await driver.wait(until.elementLocated(By.css('.ytp-title-link')), 10000);
        let newTitle = await newTitleElement.getText();

        // Then verify that the video title has changed
        expect(newTitle).not.to.equal(initialTitle);
    });
});
