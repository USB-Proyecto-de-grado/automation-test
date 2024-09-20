const { By } = require('selenium-webdriver');

class ErrorValidationPage {
  constructor(driver) {
    this.driver = driver;
  }

  async hasValidationError(locator) {
    const element = await this.driver.findElement(locator);
    const classAttribute = await element.getAttribute('class');
    return classAttribute.includes('Mui-error');
  }

  async verifyErrorMessage(locator, expectedMessage) {
    const errorMessageElement = await this.driver.findElement(locator);
    const text = await errorMessageElement.getText();
    return text.includes(expectedMessage);
  }

  async verifyMultipleValidationErrors(locators) {
    for (let locator of locators) {
      const hasError = await this.hasValidationError(locator);
      console.log(hasError);
      if (!hasError) {
        return false;
      }
    }
    return true;
  }

  async verifyMultipleErrorMessages(messages) {
    for (let { locator, expectedMessage } of messages) {
      const isErrorMessageDisplayed = await this.verifyErrorMessage(locator, expectedMessage);
      if (!isErrorMessageDisplayed) {
        return false;
      }
    }
    return true;
  }
}

module.exports = ErrorValidationPage;
