const { app, BrowserWindow, ipcMain, shell  } = require('electron');
const { extractTestScenarios, watchTestDirectories } = require('./extractTestCases');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const testsDirectory = path.join(__dirname, '../../tests');

let win;

function createWindow() {
  win = new BrowserWindow({
      width: 1200,
      height: 1000,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
      }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools();
  }

  win.webContents.on('did-finish-load', () => {
      updateTestCases();
      setupFileWatcher();
  });

  checkTestFilePlacement(win)
}

function setupFileWatcher() {
  const watcher = chokidar.watch(testsDirectory, { persistent: true });
  watcher.on('add', updateTestCases)
         .on('change', updateTestCases)
         .on('unlink', updateTestCases);
}

function updateTestCases() {
  extractTestScenarios(testsDirectory).then(scenarios => {
      // Check if the window and its webContents are still available
      if (win && win.webContents) {
          win.webContents.send('test-cases-updated', scenarios);
      }
  }).catch(err => {
      console.error("Error extracting scenarios:", err);
  });
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


function openReportWindow(reportPath) {
  let reportWin = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
      }
  });
  reportWin.loadURL(`file://${reportPath}`);
  reportWin.on('closed', () => reportWin = null);
};


// Handle creating a new test case
ipcMain.on('create-test-case', async (event, testCaseData) => {
  try {
    const { testType, testCaseId, testName, description, tags, featureName, featureType } = testCaseData;

    const basePath = testType === 'api' ? 'tests\\api' : 'tests\\ui';
    const folderPath = path.join(basePath, featureName);

    if (featureType === 'new' && !fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileName = `TC-${testCaseId}.spec.js`;
    const filePath = path.join(folderPath, fileName);
    const tagsString = tags.map(tag => `[Tag: ${tag}]`).join(' ');

    let fileContent;

    if (testType === 'api') {
      fileContent = `
        const supertest = require('supertest');
        const expect = require('chai').expect;
        const config = require('../../../config');
        const request = supertest(config.apiUrl);

        describe('${testName}', () => {
            it('TC-${testCaseId}: ${description} ${tagsString}', async () => {
                // Test logic goes here
            });
        });
      `;
    } else { // Assume UI if not API
      fileContent = `
        const { Builder, By, until } = require('selenium-webdriver');
        const buildDriver = require('../../../main/core/driverSetUp');
        const config = require('../../../config');
        const assert = require('assert');
        const chai = require('chai');
        const expect = chai.expect;
        const HomePage = require('../../../page-objects/home/homePage');
        const VideoPlayerPage = require('../../../page-objects/common/videoPlayerPage');
        const { takeScreenshot } = require('../../../utils/screenshotUtils');
        const addContext = require('mochawesome/addContext');

        describe('Feature Tests for ${testName}', function() {
            this.timeout(50000);
            let driver;
            let homePage;
            let videoPlayerPage;

            beforeEach(async function() {
                driver = buildDriver();
                homePage = new HomePage(driver);
                videoPlayerPage = new VideoPlayerPage(driver);
                await driver.get(config.uiUrl);
            });

            afterEach(async function() {
                if (this.currentTest.state === 'failed') {
                    const screenshotPath = await takeScreenshot(driver, this.currentTest.title);
                    addContext(this, {
                      title: 'Screenshot',
                      value: screenshotPath
                    });
                };
                await driver.quit();
            });

            it('TC-${testCaseId}: ${description} ${tagsString}', async function() {
                // Test logic goes here
            });
        });
      `;
    }

    fs.writeFileSync(filePath, fileContent, 'utf8');

    // Open the file in the default code editor
    exec(`code "${filePath}"`, (error) => {
      if (error) {
        console.error('Failed to open file:', error);
        event.sender.send('test-case-created', `Error opening file: ${error.message}`);
      } else {
        event.sender.send('test-case-created', `Test case file ${fileName} created and opened successfully.`);
      }
    });
  } catch (error) {
    console.error('Error creating test case file:', error);
    event.sender.send('test-case-created', 'Error creating test case file.');
  }
});

// Initialize by sending the current test cases
updateTestCases();

// Watch for changes in the tests directory
const watcher = chokidar.watch(testsDirectory, { persistent: true });
watcher.on('add', updateTestCases)
       .on('change', updateTestCases)
       .on('unlink', updateTestCases);

// Listen for 'load-folders' event to dynamically load API/UI folders
ipcMain.on('load-folders', (event, type) => {
  const folderPath = type === 'api' ? path.join(testsDirectory, 'api') : path.join(testsDirectory, 'ui');

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const folders = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  event.sender.send('folders-loaded', { type, folders });
});

ipcMain.on('run-custom-tests', (event, customCommand) => {
  exec(customCommand, (error, stdout, stderr) => {
    event.sender.send('test-output', error ? `Error running tests: ${error.message}` : stdout || stderr);
    console.log('Test process completed, notifying renderer'); // Debug log
    event.sender.send('test-complete'); // Notify that the tests are complete, regardless of outcome
  });
});


ipcMain.on('generate-report-ids', async (event) => {
  const command = "allure generate reports/ids/allure-results --clean -o reports/ids/allure-report && allure open reports/ids/allure-report";
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating report for selected IDs: ${error.message}`);
      event.sender.send('report-error', `Error generating report for selected IDs: ${error.message}`);
      return;
    }
    event.sender.send('report-generated', 'Report for selected IDs generated and opened.');
  });
});

ipcMain.on('clear-reports', async (event) => {
  const reportsDir = path.join(__dirname, '../../reports/ids/allure-results');
  fs.rm(reportsDir, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(`Error clearing reports: ${err.message}`);
      event.sender.send('report-clear-error', `Error clearing reports: ${err.message}`);
      return;
    }
    fs.mkdirSync(reportsDir); // Recreate the directory after clearing
    event.sender.send('reports-cleared', 'Reports directory cleared successfully.');
  });
});

// Handle running UI tests
ipcMain.on('run-ui-tests', (event) => {
  exec('npm run test:ui', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running UI tests: ${error}`);
      event.reply('execution-error', 'Failed to run UI tests');
    } else {
      event.reply('execution-success', 'UI tests run successfully');
    }
    event.reply('ui-test-complete'); // Notificar al renderizador que la prueba UI ha terminado
  });
});

// Handle running API tests
ipcMain.on('run-api-tests', (event) => {
  exec('npm run test:api', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running API tests: ${error}`);
      event.reply('execution-error', 'Failed to run API tests');
    } else {
      event.reply('execution-success', 'API tests run successfully');
    }
    event.reply('api-test-complete'); // Notificar al renderizador que la prueba API ha terminado
  });
});

// Handle generating UI report
ipcMain.on('generate-ui-report', (event) => {
  exec('npm run generate-report:ui', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating UI report: ${error}`);
      event.reply('execution-error', 'Failed to generate UI report');
      return;
    }
    event.reply('execution-success', 'UI report generated successfully');
  });
});

// Handle generating API report
ipcMain.on('generate-api-report', (event) => {
  exec('npm run generate-report:api', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating API report: ${error}`);
      event.reply('execution-error', 'Failed to generate API report');
      return;
    }
    event.reply('execution-success', 'API report generated successfully');
  });
});

// Clear UI Reports
ipcMain.on('clear-ui-reports', (event) => {
  const uiReportsDir = path.join(__dirname, '../../reports/ui/allure-results');
  fs.rm(uiReportsDir, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(`Error clearing UI reports: ${err}`);
      event.reply('clear-reports-result', 'Failed to clear UI reports');
      return;
    }
    fs.mkdirSync(uiReportsDir); // Recreate the directory after clearing
    event.reply('clear-reports-result', 'UI reports cleared successfully');
  });
});

// Clear API Reports
ipcMain.on('clear-api-reports', (event) => {
  const apiReportsDir = path.join(__dirname, '../../reports/api/allure-results');
  fs.rm(apiReportsDir, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(`Error clearing API reports: ${err}`);
      event.reply('clear-reports-result', 'Failed to clear API reports');
      return;
    }
    fs.mkdirSync(apiReportsDir); // Recreate the directory after clearing
    event.reply('clear-reports-result', 'API reports cleared successfully');
  });
});

const allowedDirs = [
  path.join(__dirname, '../../tests', 'api'),
  path.join(__dirname, '../../tests', 'ui')
];

// Function to recursively scan directories
function scanDirectory(dir, callback) {
  fs.readdir(dir, { withFileTypes: true }, (err, dirents) => {
    if (err) {
      console.error('Failed to read directory:', err);
      return;
    }
    dirents.forEach(dirent => {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        scanDirectory(res, callback);
      } else {
        callback(res, dir);
      }
    });
  });
}

// Function to check file placement
function checkTestFilePlacement(window) {
  const testRoot = path.join(__dirname, '../../tests'); // Adjust the path as needed
  scanDirectory(testRoot, (filePath, dir) => {
    if (filePath.endsWith('.spec.js')) {
      const isAllowed = allowedDirs.some(allowedDir => filePath.startsWith(allowedDir) && path.dirname(filePath) !== allowedDir);
      if (!isAllowed) {
        console.log('Misplaced test file found:', filePath);
        window.webContents.send('misplaced-test-file', filePath);
      }
    }
  });
}

ipcMain.on('check-file-placement', (event) => {
  const window = event.sender;
  checkTestFilePlacement(window);
});