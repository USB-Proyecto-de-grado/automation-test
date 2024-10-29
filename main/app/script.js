const { ipcRenderer } = require('electron');
const { shell } = require('electron');
const fs = require('fs');
const path = require('path');

// Ejecutar los tests de UI
document.getElementById('run-ui-tests').addEventListener('click', () => {
  ipcRenderer.send('run-ui-tests');
});

// Ejecutar los tests de API
document.getElementById('run-api-tests').addEventListener('click', () => {
  ipcRenderer.send('run-api-tests');
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

document.getElementById('open-test-plan').addEventListener('click', () => {
  shell.openPath('C:/Users/carolina.zegarra/Desktop/proyecto de grado/automation-test/reports/testplan/Test Plan.pdf')
      .then(() => console.log('Documento abierto exitosamente'))
      .catch(err => console.error('Error al abrir el documento:', err));
});

document.getElementById('run-custom-tests').addEventListener('click', () => {
  const selectedTag = document.getElementById('custom-test-selector').value;
  const customCommand = `npm run test:custom -- --grep "\\[Tag: ${selectedTag}\\]" --reporter mochawesome --reporter-options reportDir=reports/custom,reportFilename=customReport,overwrite=false,charts=true`;
  ipcRenderer.send('run-custom-tests', customCommand);  // Ensure to modify the backend to handle this
});


document.getElementById('view-custom-report').addEventListener('click', () => {
  ipcRenderer.send('view-custom-report');
});


function populateCustomTestDropdown() {
  const uniqueTags = new Set();

  allScenarios.forEach(scenario => {
      scenario.tags.forEach(tag => uniqueTags.add(tag));
  });

  const dropdown = document.getElementById('custom-test-selector');
  dropdown.innerHTML = ''; // Clear existing options

  uniqueTags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      dropdown.appendChild(option);
  });
}

// TEST

document.addEventListener('DOMContentLoaded', populateCustomTestDropdown);

document.querySelectorAll('.test-type').forEach(checkbox => {
  checkbox.addEventListener('change', handleCheckboxChange);
});

function handleCheckboxChange() {
  const allCheckbox = document.querySelector('.test-type[value="all"]');
  const individualCheckboxes = document.querySelectorAll('.test-type:not([value="all"])');
  const allChecked = [...individualCheckboxes].every(checkbox => checkbox.checked);
  
  if (this.value === 'all') {
    // If 'All' checkbox state changes, update all other checkboxes to the same state
    individualCheckboxes.forEach(checkbox => checkbox.checked = this.checked);
  } else {
    // Update 'All' checkbox based on the state of individual checkboxes
    allCheckbox.checked = allChecked;
  }

  // Control display of test cases based on checkboxes
  displayTestCases();
}


document.querySelectorAll('.test-type').forEach(checkbox => {
  checkbox.addEventListener('change', function() {
      if (this.value === 'all') {
          // Si el checkbox 'All' es marcado o desmarcado, actualizar todos los otros checkboxes
          const state = this.checked;
          document.querySelectorAll('.test-type:not([value="all"])').forEach(chk => chk.checked = state);
      } else {
          // Actualizar el estado del checkbox 'All' basado en si todos los otros están marcados o no
          const allTypes = document.querySelectorAll('.test-type:not([value="all"])');
          const allChecked = [...allTypes].every(chk => chk.checked);
          document.querySelector('.test-type[value="all"]').checked = allChecked;
      }
      displayTestCases();
  });
});

// Store all scenarios globally for filtering
let allScenarios = [];

// Listen for test case updates from the main process
ipcRenderer.on('test-cases-updated', (event, scenarios) => {
  allScenarios = scenarios;
  populateCustomTestDropdown();
  displayTestCases();
});

// Function to display test cases based on selected tags
function displayTestCases() {
  const selectedTags = getSelectedTags();
  const listElement = document.getElementById('test-case-list');
  listElement.innerHTML = ''; // Clear the table before updating

  const filteredScenarios = allScenarios.filter(scenario => {
    return document.querySelector('.test-type[value="all"]').checked || scenario.tags.some(tag => selectedTags.includes(tag));
  });

  filteredScenarios.forEach(scenario => {
    const row = document.createElement('tr');
    
    const cellSelect = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    cellSelect.appendChild(checkbox);
    
    const cellId = document.createElement('td');
    cellId.textContent = scenario.id;
    
    const cellTitle = document.createElement('td');
    cellTitle.textContent = scenario.scenario;
    
    row.appendChild(cellSelect);
    row.appendChild(cellId);
    row.appendChild(cellTitle);
    
    listElement.appendChild(row);
  });

  document.getElementById('total-cases-shown').textContent = filteredScenarios.length.toString();
}

// Get values of all checked checkboxes except 'All'
function getSelectedTags() {
  return Array.from(document.querySelectorAll('.test-type:checked:not([value="all"])')).map(checkbox => checkbox.value);
}

document.addEventListener('DOMContentLoaded', function() {
  displayTestCases(); // To ensure correct display on initial load
});


//MODAL

document.addEventListener('DOMContentLoaded', function() {
  // Load existing API/UI folders
  loadExistingFolders();
});

// Event listener for test type selection change
document.getElementById('test-type').addEventListener('change', function(e) {
  const testType = e.target.value;
  loadFolders(testType);  // Load folders based on selected test type
});

// Function to load folders based on test type
// Ensure to clear previous options before loading new ones to prevent duplicates
function loadFolders(type) {
  const existingFeatureDropdown = document.getElementById('existing-feature');
  existingFeatureDropdown.innerHTML = ''; // Always clear previous options first

  // Send an IPC request to load folders for the specified type
  ipcRenderer.send('load-folders', type);
}

// Receive and populate folders in the dropdown
ipcRenderer.on('folders-loaded', (event, { type, folders }) => {
  const existingFeatureDropdown = document.getElementById('existing-feature');

  // Check if any folders are received and populate accordingly
  if (folders.length === 0) {
    const noOption = document.createElement('option');
    noOption.textContent = 'No existing features found';
    noOption.disabled = true;
    existingFeatureDropdown.appendChild(noOption);
  } else {
    // Append folders to dropdown without duplicating
    folders.forEach(folder => {
      if (!Array.from(existingFeatureDropdown.options).some(option => option.value === folder)) {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder;
        existingFeatureDropdown.appendChild(option);
      }
    });
  }
});

// This function is called when the modal is opened
function initializeDropdown() {
  const testType = document.getElementById('test-type').value;
  loadFolders(testType); // Load folders based on the initially selected test type
}

// Toggle visibility of input fields based on feature selection
document.getElementById('feature-type').addEventListener('change', function(e) {
  const selectedOption = e.target.value;
  const existingFeatureContainer = document.getElementById('existing-feature-container');
  const newFeatureContainer = document.getElementById('new-feature-container');

  if (selectedOption === 'existing') {
    existingFeatureContainer.style.display = 'block';
    newFeatureContainer.style.display = 'none';
  } else {
    existingFeatureContainer.style.display = 'none';
    newFeatureContainer.style.display = 'block';
  }
});

// Toggle visibility of input fields based on feature selection
document.getElementById('feature-type').addEventListener('change', function(e) {
  const selectedOption = e.target.value;
  const existingFeatureContainer = document.getElementById('existing-feature-container');
  const newFeatureContainer = document.getElementById('new-feature-container');
  
  if (selectedOption === 'existing') {
    existingFeatureContainer.style.display = 'block';
    newFeatureContainer.style.display = 'none';
  } else {
    existingFeatureContainer.style.display = 'none';
    newFeatureContainer.style.display = 'block';
  }
});

// Form submission handler
document.getElementById('test-case-form').addEventListener('submit', function(e) {
  e.preventDefault();

  // Gather form data
  const testType = document.getElementById('test-type').value; // Either 'api' or 'ui'
  const testCaseId = document.getElementById('test-case-id').value.trim();
  const testName = document.getElementById('test-name').value.trim();
  const description = document.getElementById('description').value.trim();
  const featureType = document.getElementById('feature-type').value; // existing or new

  let featureName = '';

  // Determine if the user is adding to an existing feature or a new one
  if (featureType === 'existing') {
    featureName = document.getElementById('existing-feature').value;
  } else {
    featureName = document.getElementById('new-feature').value.trim();
  }

  // Get selected tags
  const selectedTags = Array.from(document.querySelectorAll('input[name="tags"]:checked'))
    .map(checkbox => checkbox.value);

  // Validate required fields
  if (!testCaseId || !testName || !description || !featureName) {
    alert('Please fill in all required fields.');
    return;
  }

  // Create a test case object
  const testCaseData = {
    testType,       // API or UI
    testCaseId,     // The test case ID (e.g., 47)
    testName,       // The name of the test case
    description,    // The test case description
    tags: selectedTags, // Array of selected tags
    featureName,    // Feature/Endpoint name
    featureType     // Whether it’s an existing or new feature
  };

  // Send data to the main process to handle file creation
  ipcRenderer.send('create-test-case', testCaseData);
  
  // Close the modal or reset form
  document.getElementById('test-case-form').reset();
  document.getElementById('add-test-case-modal').style.display = 'none';
});

// Listening for a confirmation from the main process
ipcRenderer.on('test-case-created', (event, message) => {
  alert(message);
});

var modal = document.getElementById("add-test-case-modal");

// Get the button that opens the modal
var btn = document.getElementById("add-test-case");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
  initializeDropdown();
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
