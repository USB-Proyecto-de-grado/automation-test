const GoogleLoginPage = require('../../page-objects/logIn/GoogleLoginPage');
const LogInPage = require('../../page-objects/logIn/LogPage');
const assert = require('assert');

class PreTestSetup {
    constructor(driver) {
        this.driver = driver;
        this.googleLoginPage = new GoogleLoginPage(this.driver);
        this.loginPage = new LogInPage(this.driver);
    }

    async loginToGoogle(email, password) {
        try {
            await this.driver.get('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&hl=en&service=mail&flowName=GlifWebSignIn&flowEntry=AddSession');
            await this.driver.sleep(5000);  // Esperar a que la página cargue

            await this.googleLoginPage.enterIdentifier(email);
            await this.driver.sleep(2000);

            await this.googleLoginPage.enterPassword(password);
            await this.driver.sleep(5000);  // Esperar a que la autenticación se complete

            await this.driver.get('http://localhost:3000/');
            await this.driver.sleep(5000);
            const isVisible = await this.loginPage.isUserMenuButtonVisible();
            assert.strictEqual(isVisible, true, 'El botón de menú del usuario debe ser visible');

        } catch (error) {
            console.error(`Login failed: ${error}`);
            throw error;
        }
    }

}

module.exports = PreTestSetup;
