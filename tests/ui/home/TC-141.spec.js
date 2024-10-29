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

    it('TC-141: should play video, click "Reproducir al Azar", and play new video  [Tag: GUI Testing] [Tag: Functional Testing]', async function() {
        // When the user plays a video, uses "Reproducir al Azar", and plays the new video
        await homePage.clickDropdown();
        const iframe = await driver.findElement(By.css('iframe'));
        await driver.switchTo().frame(iframe);
        await driver.wait(until.elementLocated(By.css('button.ytp-large-play-button')), 10000);
        let playButton = await driver.findElement(By.css('button.ytp-large-play-button'));
        await playButton.click();
        await driver.sleep(5000);
        let initialTime = await driver.executeScript("return document.querySelector('video').currentTime;");
        assert(initialTime > 0, 'El video inicial no está reproduciendo.');
        await driver.switchTo().defaultContent();
        await homePage.clickRandomPlay();
        await driver.sleep(5000); // Wait to ensure the video changes
        await driver.switchTo().frame(iframe);
        await driver.wait(until.elementLocated(By.css('button.ytp-large-play-button')), 10000);
        playButton = await driver.findElement(By.css('button.ytp-large-play-button'));
        await playButton.click();
        await driver.sleep(5000);
        let newTime = await driver.executeScript("return document.querySelector('video').currentTime;");

        // Then verify that the new video is playing
        assert(newTime > 0, 'El nuevo video no está reproduciendo después de "Reproducir al Azar".');
    });
});
