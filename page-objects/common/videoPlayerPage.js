const { By, until } = require('selenium-webdriver');

class VideoPlayerPage {
    constructor(driver) {
        this.driver = driver;
    }

    async playVideo() {
        const playButton = await this.driver.findElement(By.css('button.ytp-large-play-button'));
        await playButton.click();
    }

    async getCurrentVideoTime(iframe) {
        await this.driver.switchTo().frame(iframe);
        return await this.driver.executeScript("return document.querySelector('video').currentTime;");
    }

    async getVideoTitle(iframe) {
        await this.driver.switchTo().frame(iframe);
        const titleElement = await this.driver.findElement(By.css('.ytp-title-link'));
        return await titleElement.getText();
    }
}
module.exports = VideoPlayerPage; 