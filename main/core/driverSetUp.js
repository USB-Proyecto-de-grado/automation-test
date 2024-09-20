const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

function buildDriver() {
    let chromeOptions = new chrome.Options();
    chromeOptions.addArguments(
         "user-data-dir=C:/Users/carolina.zegarra/AppData/Local/Google/Chrome/User Data/Default",
         "--disable-blink-features=AutomationControlled",
         "--no-sandbox",
         "--disable-infobars",
         "--disable-dev-shm-usage",
         "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36");
    return new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
}
module.exports = buildDriver;
