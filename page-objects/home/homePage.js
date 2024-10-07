const { By, until } = require('selenium-webdriver');

class HomePage {
    constructor(driver) {
        this.driver = driver;
    }

    async clickRandomPlay() {
        await this.driver.findElement(By.xpath('//p[contains(text(), "Reproducir al Azar")]')).click();
    }

    async clickDropdown() {
        const svgButton = await this.driver.findElement(By.css('.tabler-icon-chevron-down'));
        await svgButton.click();
    }

    async clickContrapuntoButton() {
        const button = await this.driver.findElement(By.xpath("//button[contains(., 'Revista Contrapunto (2023)')]"));
        await button.click();
    }
}

module.exports = HomePage;

