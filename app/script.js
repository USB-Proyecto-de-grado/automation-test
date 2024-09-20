const { ipcRenderer } = require('electron');

// Ejecutar los tests de UI
document.getElementById('run-ui-tests').addEventListener('click', () => {
  ipcRenderer.send('run-ui-tests');
});

// Ejecutar los tests de API
document.getElementById('run-api-tests').addEventListener('click', () => {
  ipcRenderer.send('run-api-tests');
});

// Cancelar los tests de UI
document.getElementById('cancel-ui-tests').addEventListener('click', () => {
  ipcRenderer.send('cancel-ui-tests');
});

// Cancelar los tests de API
document.getElementById('cancel-api-tests').addEventListener('click', () => {
  ipcRenderer.send('cancel-api-tests');
});

// Ver el último reporte de UI
document.getElementById('view-ui-report').addEventListener('click', () => {
  ipcRenderer.send('view-ui-report');
});

// Ver el último reporte de API
document.getElementById('view-api-report').addEventListener('click', () => {
  ipcRenderer.send('view-api-report');
});

ipcRenderer.on('load-report', (event, reportPath) => {
  const iframe = document.getElementById('report-frame');
  console.log("Ruta del reporte:", reportPath);
  if (reportPath) {
    iframe.src = reportPath;
  } else {
    document.getElementById('test-output').textContent = 'No report found.';
  }
});
