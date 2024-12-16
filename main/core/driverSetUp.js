const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');

function buildDriver() {
    const chromeDriverPath = 'C:\\drivers\\chromedriver-win64\\chromedriver.exe'; // Ruta al ejecutable de ChromeDriver
    const service = new chrome.ServiceBuilder(chromeDriverPath);

    let chromeOptions = new chrome.Options();
    chromeOptions.addArguments(
        "user-data-dir=C:/Users/carolina.zegarra/AppData/Local/Google/Chrome/User Data/Default",
        "--disable-blink-features=AutomationControlled",
        "--disable-extensions",
        "--disable-popup-blocking",
        "--start-maximized",
        "--no-sandbox",
        "--disable-infobars",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    );

    // Evitar señales de automatización (alternativa a setExperimentalOption)
    chromeOptions.set("excludeSwitches", ["enable-automation"]);
    chromeOptions.set("useAutomationExtension", false);


    return new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .setChromeService(service)
        .build();
}

module.exports = buildDriver;
