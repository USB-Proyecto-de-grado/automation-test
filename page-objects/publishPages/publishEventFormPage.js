const { By, Key, until } = require('selenium-webdriver');

class PublishEventFormPage {
  constructor(driver) {
    this.driver = driver;
    this.elements = {
      titleInput: By.id('eventTitle'),
      dateInput: By.css('input[placeholder="MM/DD/YYYY"]'),
      ubicationInput: By.id('ubicationTextField'),
      priceInput: By.id('priceTextField'),
      descriptionInput: By.id('descriptionTextField'),
      postButton: By.css('button[type="submit"]'),
      snackbar: By.css('.MuiSnackbar-root'),
      errorMessages: {
        titleError: By.id('eventTitle-helper-text'),
        priceError: By.id('priceTextField-helper-text'),
        descriptionError: By.id('descriptionTextField-helper-text'),
      },
    };
  }

  async fillEventForm({ title, date, ubication, price, description }) {
    const titleInput = await this.driver.findElement(this.elements.titleInput);
    await titleInput.sendKeys(title);

    const dateInput = await this.driver.findElement(this.elements.dateInput);
    await dateInput.click();
    await dateInput.sendKeys(Key.HOME, date);

    const ubicationInput = await this.driver.findElement(this.elements.ubicationInput);
    await ubicationInput.sendKeys(ubication);

    const priceInput = await this.driver.findElement(this.elements.priceInput);
    await priceInput.sendKeys(price);

    const descriptionInput = await this.driver.findElement(this.elements.descriptionInput);
    await descriptionInput.sendKeys(description);
  }

  async submitForm() {
    const publishButton = await this.driver.findElement(this.elements.postButton);
    await publishButton.click();
  }
}

module.exports = PublishEventFormPage;
