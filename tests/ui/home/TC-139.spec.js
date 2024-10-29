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

    it('TC-139: should play the video and verify it is playing by checking time progression [Tag: GUI Testing] [Tag: Smoke Testing] [Tag: Functional Testing]', async function() {
        // When the user plays a video
        await homePage.clickDropdown();
        const iframe = await driver.findElement(By.css('iframe'));
        await driver.switchTo().frame(iframe);
        await driver.wait(until.elementLocated(By.css('button.ytp-large-play-button')), 10000);
        const playButton = await driver.findElement(By.css('button.ytp-large-play-button'));
        await driver.executeScript("arguments[0].click();", playButton);
        await driver.sleep(5000);
        const initialTime = await driver.executeScript("return document.querySelector('video').currentTime;");
        await driver.sleep(5000);
        const laterTime = await driver.executeScript("return document.querySelector('video').currentTime;");

        // Then verify that the video time has progressed
        assert(laterTime > initialTime, 'El video no está avanzando; currentTime no se ha incrementado.');
    });
});
