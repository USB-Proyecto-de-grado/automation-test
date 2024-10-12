const { Builder, By, until } = require('selenium-webdriver');
const buildDriver = require('../../../../main/core/driverSetUp');
const config = require('../../../../config');
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const HomePage = require('../../../../page-objects/home/homePage');
const VideoPlayerPage = require('../../../../page-objects/common/videoPlayerPage');
const { takeScreenshot } = require('../../../../utils/screenshotUtils');
const addContext = require('mochawesome/addContext');

describe('Feature Tests for Random Player  [Tag: GUI Testing][Tag: Functional Testing]', function() {
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


    it('TC-139: should play the video and verify it is playing by checking time progression [Tag: Usability Testing]', async function() {
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
        assert(laterTime > initialTime, 'El video no está avanzando; currentTime no se ha incrementado.');
    });

    it('TC-140: should verify that clicking "Reproducir al Azar" changes the video title [Tag: Usability Testing]', async function() {
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
        expect(newTitle).not.to.equal(initialTitle);
    });

    it('TC-141: should play video, click "Reproducir al Azar", and play new video [Tag: Usability Testing]', async function() {
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
        await driver.sleep(5000); // Espera para asegurar que el video cambie
        await driver.switchTo().frame(iframe);
        await driver.wait(until.elementLocated(By.css('button.ytp-large-play-button')), 10000);
        playButton = await driver.findElement(By.css('button.ytp-large-play-button'));
        await playButton.click();
        await driver.sleep(5000);
        let newTime = await driver.executeScript("return document.querySelector('video').currentTime;");
        assert(newTime > 0, 'El nuevo video no está reproduciendo después de "Reproducir al Azar".');
    });
});
