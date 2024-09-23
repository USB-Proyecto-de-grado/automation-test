const fs = require('fs');
const path = require('path');

// Función para capturar pantallas
async function takeScreenshot(driver, testName) {
  const screenshotDir = path.join(__dirname, '../reports/ui/screenshots');
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const sanitizedTestName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const screenshotPath = path.join(screenshotDir, `${sanitizedTestName}.png`);
  const image = await driver.takeScreenshot();
  fs.writeFileSync(screenshotPath, image, 'base64');
  
  console.log(`Screenshot saved to ${screenshotPath}`);
  return screenshotPath;
}

module.exports = { takeScreenshot };
