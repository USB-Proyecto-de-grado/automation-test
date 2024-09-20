const { By } = require('selenium-webdriver');

class PublishMusicFormPage {
  constructor(driver) {
    this.driver = driver;
    this.elements = {
      youTubeLinkInput: By.id('urlTextField'),
      titleInput: By.id('titleTextField'),
      descriptionInput: By.id('descriptionTextField'),
      postButton: By.id('postButton'),
      youTubePlayer: By.id('youTubePlayer'),
      snackbar: By.css('.MuiSnackbar-root'),
      youTubeIframe: By.css('#youTubePlayer iframe'),
    };
  }

  async fillMusicForm({ youTubeLink, title, description }) {
    await this.driver.findElement(this.elements.youTubeLinkInput).sendKeys(youTubeLink);
    await this.driver.findElement(this.elements.titleInput).sendKeys(title);
    await this.driver.findElement(this.elements.descriptionInput).sendKeys(description);
  }

  async submitForm() {
    await this.driver.findElement(this.elements.postButton).click();
  }

  async verifyYouTubePlayerVisible() {
    const youTubePlayer = await this.driver.findElement(this.elements.youTubePlayer);
    return youTubePlayer.isDisplayed();
  }

  async verifyYouTubeIframePlayerVisible() {
    const iframeElement = await this.driver.findElement(this.elements.youTubeIframe);
    await this.driver.switchTo().frame(iframeElement);
    const videoContainer = await this.driver.findElement(By.css('.html5-video-container'));
    await this.driver.switchTo().defaultContent();
    return videoContainer != null;
  }

  async verifyVideoPlayback() {
    const iframeElement = await this.driver.findElement(this.elements.youTubeIframe);
    await this.driver.switchTo().frame(iframeElement);
    const video = await this.driver.findElement(By.css('.html5-main-video'));
    const currentTime = await this.driver.executeScript('return arguments[0].currentTime;', video);
    await this.driver.switchTo().defaultContent();
    return currentTime > 0;
  }
}

module.exports = PublishMusicFormPage;
