const { app, BrowserWindow, ipcMain } = require('electron');
const { extractTestScenarios, watchTestDirectories } = require('./extractTestCases');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const testsDirectory = path.join(__dirname, '../../tests');


let win;
let uiTestProcess = null;   // Para almacenar el proceso de los tests de UI
let apiTestProcess = null;  // Para almacenar el proceso de los tests de API

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

ipcMain.on('open-pdf', (event, pdfPath) => {
  let pdfWin = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
          plugins: true
      }
  });

  pdfWin.loadURL(`file://${pdfPath}`);
  pdfWin.on('closed', () => pdfWin = null);
});

async function takeScreenshot(driver, testName) {
  const screenshotDir = path.join(__dirname, '../reports/ui/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const screenshotPath = path.join(screenshotDir, `${testName}.png`);
  const image = await driver.takeScreenshot();
  fs.writeFileSync(screenshotPath, image, 'base64');
  console.log(`Screenshot saved to ${screenshotPath}`);
}

// Función para obtener el último archivo HTML en un directorio
function getLatestReport(directory) {
    const files = fs.readdirSync(directory);
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    if (htmlFiles.length === 0) return null;
  
    // Ordenar archivos por fecha de modificación
    const sortedFiles = htmlFiles
      .map(file => ({
        file,
        time: fs.statSync(path.join(directory, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
  
    return path.join(directory, sortedFiles[0].file);
}

// Ejecutar los tests de UI
ipcMain.on('run-ui-tests', (event) => {
  uiTestProcess = exec('npm run test:ui', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar test UI: ${error.message}`);
      event.sender.send('test-output', `Error al ejecutar test UI: ${error.message}`);
      return;
    }
    event.sender.send('test-output', stdout || stderr);
  });
});

// Ejecutar los tests de API
ipcMain.on('run-api-tests', (event) => {
  apiTestProcess = exec('npm run test:api', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar test API: ${error.message}`);
      event.sender.send('test-output', `Error al ejecutar test API: ${error.message}`);
      return;
    }
    event.sender.send('test-output', stdout || stderr);
  });
});

// Cargar el reporte más reciente de UI
ipcMain.on('view-ui-report', (event) => {
  const uiReportPath = getLatestReport(path.join(__dirname, '../../reports/ui'));
  console.log("Mostrando reporte UI:", uiReportPath);
  event.sender.send('load-report', uiReportPath ? `file://${uiReportPath}` : null);
});

// Cargar el reporte más reciente de API
ipcMain.on('view-api-report', (event) => {
  const apiReportPath = getLatestReport(path.join(__dirname, '../../reports/api'));
  console.log("Mostrando reporte API:", apiReportPath);
  event.sender.send('load-report', apiReportPath ? `file://${apiReportPath}` : null);
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
}

ipcMain.on('run-custom-tests', (event, customCommand) => {
  apiTestProcess = exec(customCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running custom API tests: ${error.message}`);
      event.sender.send('test-output', `Error running custom API tests: ${error.message}`);
      return;
    }
    event.sender.send('test-output', stdout || stderr);
  });
});


ipcMain.on('view-custom-report', (event) => {
  const customReportPath = getLatestReport(path.join(__dirname, '../../reports/custom'));
  console.log("Displaying custom report:", customReportPath);
  event.sender.send('load-report', customReportPath ? `file://${customReportPath}` : null);
});

// Handle folder loading request
ipcMain.on('load-folders', (event, type) => {
  const folderPath = type === 'api' ? 'tests/api/' : 'tests/ui/';
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Read the folders in the specified directory
  const folders = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // Send the folders back to the renderer process
  event.sender.send('folders-loaded', { type, folders });
});

// Handle creating a new test case
ipcMain.on('create-test-case', (event, testCaseData) => {
  try {
    const { testType, testCaseId, testName, description, tags, featureName, featureType } = testCaseData;

    // Determine the correct base path based on test type
    const basePath = testType === 'api' ? 'tests/api/' : 'tests/ui/';
    const folderPath = path.join(basePath, featureName);

    // If it's a new feature, create the folder
    if (featureType === 'new' && !fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate the test case filename (e.g., TC-47.spec.js)
    const fileName = `TC-${testCaseId}.spec.js`;
    const filePath = path.join(folderPath, fileName);

    // Generate tags string for the test case file
    const tagsString = tags.map(tag => `[Tag: ${tag}]`).join(' ');

    // Content of the test case file
    const fileContent = `
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

    // Write content to the test case file
    fs.writeFileSync(filePath, fileContent, 'utf8');

    // Send confirmation back to the renderer process
    event.sender.send('test-case-created', `Test case file ${fileName} created successfully in ${featureName} folder!`);
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