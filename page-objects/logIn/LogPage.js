const { By, until  } = require('selenium-webdriver');

class LogInPage {
    constructor(driver) {
        this.driver = driver;
        this.userMenuButton = By.id("user-menu-button");
    }

    async isUserMenuButtonVisible() {
        const element = await this.driver.findElement(this.userMenuButton);
        return await element.isDisplayed(); 
    }
}
module.exports = LogInPage;
