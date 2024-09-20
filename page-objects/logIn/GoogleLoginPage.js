const { By, Key } = require('selenium-webdriver');

class GoogleLoginPage {
    constructor(driver) {
        this.driver = driver;
        this.identifierInput = By.id("identifierId");
        this.passwordInput = By.xpath('//input[@name="Passwd"]');
    }

    async enterIdentifier(identifier) {
        await this.driver.findElement(this.identifierInput).sendKeys(identifier, Key.RETURN);
    }

    async enterPassword(password) {
        await this.driver.findElement(this.passwordInput).sendKeys(password, Key.RETURN);
    }
}
module.exports = GoogleLoginPage;
