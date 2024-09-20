const { By, until } = require('selenium-webdriver');

class AlertSnackBarPage {
  constructor(driver) {
    this.driver = driver;

    this.elements = {
      snackbar: By.css('.MuiSnackbar-root'),
      alertMessage: By.css('.MuiAlert-message'),
    };
  }

  async verifyMessage(expectedMessage) {
    const snackbarElement = await this.driver.wait(until.elementLocated(this.elements.snackbar), 10000);
    await this.driver.wait(until.elementIsVisible(snackbarElement), 10000);

    const alertElement = await this.driver.findElement(this.elements.alertMessage);
    const actualText = await alertElement.getText();

    if (actualText.includes(expectedMessage)) {
      console.log(`Success message is correct: ${actualText}`);
      return true;
    } else {
      throw new Error(`Expected message "${expectedMessage}", but found "${actualText}"`);
      return false;
    }
  }
}

module.exports = AlertSnackBarPage;
  