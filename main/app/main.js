const { app, BrowserWindow, ipcMain, shell  } = require('electron');
const { extractTestScenarios, watchTestDirectories } = require('./extractTestCases');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set BASE_PATH environment variable
process.env.BASE_PATH = app.isPackaged
    ? path.join(process.resourcesPath, '../../../main/app')
    : __dirname;

console.log('Base Path:', process.env.BASE_PATH);

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

  win.loadFile(path.join(process.env.BASE_PATH, 'index.html'));

  if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools();
  }

  win.webContents.on('did-finish-load', () => {
      updateTestCases();
      setupFileWatcher();
  });

  checkTestFilePlacement(win)
}

const testsDirectory = app.isPackaged
    ? path.join(process.resourcesPath, '../../../tests') // Ajusta esta ruta para la versión empaquetada
    : path.join(__dirname, '../../../tests'); // Ajusta esta ruta para la versión no empaquetada


function setupFileWatcher() {
  const watcher = chokidar.watch(testsDirectory, { persistent: true });
  watcher.on('add', updateTestCases)
         .on('change', updateTestCases)
         .on('unlink', updateTestCases);
}

function updateTestCases() {
  extractTestScenarios(testsDirectory).then(scenarios => {
      // Check if the window and its webContents are still available
      scenarios.forEach(scenario => {
        win.webContents.send('log', `ID: ${scenario.id}, File: ${scenario.file}, Scenario: ${scenario.scenario}, Tags: ${scenario.tags.join(", ")}, Path: ${testsDirectory}`);
      });
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


// Handle creating a new test case
process.env.PROJECT_ROOT = path.resolve(app.getAppPath(), '../../../..');
console.log('Project Root set to:', process.env.PROJECT_ROOT);

ipcMain.on('create-test-case', async (event, testCaseData) => {
  try {
    const { testType, testCaseId, testName, description, tags, featureName, featureType } = testCaseData;

    // Define the directory for test files based on the test type
    const testsDirectory = path.join(process.env.PROJECT_ROOT, 'tests');
    const basePath = testType === 'api' ? path.join(testsDirectory, 'api') : path.join(testsDirectory, 'ui');
    const folderPath = path.join(basePath, featureName);

    // Log the folder path to diagnose path issues
    console.log('Attempting to create/access directory at:', folderPath);

    // Create the directory if it does not exist
    if (featureType === 'new' && !fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log('Directory created:', folderPath);
    }

    // Generate the filename and path
    const fileName = `TC-${testCaseId}.spec.js`;
    const filePath = path.join(folderPath, fileName);
    console.log('File Path:', filePath);

    // Generate file content based on test type
    const fileContent = generateFileContent(testType, testCaseId, testName, description, tags);
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log('File written successfully at:', filePath);

    // Attempt to open the file in the default code editor
    exec(`code "${filePath}"`, (error) => {
      if (error) {
        console.error('Failed to open file:', error);
        event.sender.send('test-case-created', `Error opening file: ${error.message}`);
      } else {
        event.sender.send('test-case-created', `Test case file ${fileName} created and opened successfully.`);
        console.log('File opened in editor:', filePath);
      }
    });
  } catch (error) {
    console.error('Error creating test case file:', error);
    event.sender.send('test-case-created', `Error creating test case file: ${error.message}`);
  }
});

function generateFileContent(testType, testCaseId, testName, description, tags) {
  // Example content generation logic
  const tagsString = tags.map(tag => `[Tag: ${tag}]`).join(' ');
  if (testType === 'api') {
    return `
      const supertest = require('supertest');
      const expect = require('chai').expect;
      const config = require('../../../config');
      const request = supertest(config.apiUrl);

      describe('${testName} ${tagsString}', () => {
          it('TC-${testCaseId}: ${description}', async () => {
              expect(true).to.equal(true); // Placeholder test
          });
      });
    `;
  } else {
    return `
      const { Builder, By, Key, until } = require('selenium-webdriver');
      const assert = require('assert');
      const chai = require('chai');
      const expect = chai.expect;
      const config = require('../../../config');

      describe('${testName} ${tagsString}', function() {
          this.timeout(30000);
          let driver;

          beforeEach(async function() {
              driver = new Builder().forBrowser('chrome').build();
              await driver.get(config.uiUrl);
          });

          afterEach(async function() {
              await driver.quit();
          });

          it('TC-${testCaseId}: ${description}', async function() {
              expect(true).to.be.true; // Placeholder test
          });
      });
    `;
  }
}

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
  const command = "allure generate ../../reports/ids/allure-results --clean -o ../../reports/ids/allure-report && allure open ../../reports/ids/allure-report";
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
  const reportsDir = path.join(process.env.BASE_PATH, '../../reports/ids/allure-results');
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
  const uiReportsDir = path.join(process.env.BASE_PATH, '../../reports/ui/allure-results');
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
  const apiReportsDir = path.join(process.env.BASE_PATH, '../../reports/api/allure-results');
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
  path.join(process.env.BASE_PATH, '../../tests', 'api'),
  path.join(process.env.BASE_PATH, '../../tests', 'ui')
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
// Function to check file placement and update UI accordingly
function checkTestFilePlacement(window) {
  const testRoot = path.join(process.env.BASE_PATH, '../../tests');
  let misplacedFileFound = false;

  scanDirectory(testRoot, (filePath, dir) => {
    if (filePath.endsWith('.spec.js')) {
      const isAllowed = allowedDirs.some(allowedDir => filePath.startsWith(allowedDir));
      if (!isAllowed) {
        console.log('Misplaced test file found:', filePath);
        misplacedFileFound = true;
        if (window && window.webContents) {
          window.webContents.send('misplaced-test-file', filePath);
        }
      }
    }
  }).then(() => {
    if (!misplacedFileFound && window && window.webContents) {
      window.webContents.send('all-files-correct');
    }
  });
}

// Adjustments for the scanDirectory function to return a promise for better control
async function scanDirectory(dir, callback) {
  try {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        await scanDirectory(res, callback);
      } else {
        callback(res, dir);
      }
    }
  } catch (err) {
    console.error('Failed to read directory:', err);
  }
}


ipcMain.on('check-file-placement', (event) => {
  const window = event.sender;
  checkTestFilePlacement(window);
});

watcher.on('add', () => checkTestFilePlacement(win))
       .on('change', () => checkTestFilePlacement(win))
       .on('unlink', () => checkTestFilePlacement(win));
