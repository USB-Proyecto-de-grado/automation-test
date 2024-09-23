const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

let win;
let uiTestProcess = null;   // Para almacenar el proceso de los tests de UI
let apiTestProcess = null;  // Para almacenar el proceso de los tests de API

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  // Abrir las DevTools si es necesario
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
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

// Función para detener el proceso de tests de UI
ipcMain.on('cancel-ui-tests', (event) => {
  if (uiTestProcess) {
    uiTestProcess.kill();  // Detener el proceso
    event.sender.send('test-output', 'UI tests have been canceled.');
    uiTestProcess = null;  // Reiniciar la variable
  }
});

// Función para detener el proceso de tests de API
ipcMain.on('cancel-api-tests', (event) => {
  if (apiTestProcess) {
    apiTestProcess.kill();  // Detener el proceso
    event.sender.send('test-output', 'API tests have been canceled.');
    apiTestProcess = null;  // Reiniciar la variable
  }
});

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
