const { ipcRenderer } = require('electron');
const { shell } = require('electron');
const fs = require('fs');
const path = require('path');

// TEST
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


//filter
document.getElementById('show-filters').addEventListener('click', function() {
  var filterSection = document.getElementById('filter-section');
  filterSection.style.display = filterSection.style.display === 'none' ? 'block' : 'none'; // Toggle visibility
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
    checkbox.checked = selectedCases.includes(scenario.id); // Retain selected state
    checkbox.addEventListener('change', () => handleSelectionChange(scenario.id, checkbox.checked));
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

function handleSelectionChange(caseId, isSelected) {
  if (isSelected && !selectedCases.includes(caseId)) {
    selectedCases.push(caseId);
  } else if (!isSelected) {
    selectedCases = selectedCases.filter(id => id !== caseId);
  }
  document.getElementById('total-cases-selected').textContent = selectedCases.length;
}

function showSelectedCases() {
  const listElement = document.getElementById('test-case-list');
  listElement.innerHTML = ''; // Clear the table before displaying selected cases

  const selectedScenarios = allScenarios.filter(scenario => selectedCases.includes(scenario.id));

  selectedScenarios.forEach(scenario => {
    const row = document.createElement('tr');

    const cellSelect = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true; // All are selected since we are showing selected cases
    checkbox.addEventListener('change', () => handleSelectionChange(scenario.id, checkbox.checked));
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

  document.getElementById('total-cases-shown').textContent = selectedScenarios.length.toString();
}

// Event listener for 'Show Selected' button
document.getElementById('show-selected-tests').addEventListener('click', showSelectedCases);


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


let selectedCases = [];

function searchById() {
  const searchQuery = document.getElementById('search-id').value.trim().toLowerCase();
  const listElement = document.getElementById('test-case-list');
  listElement.innerHTML = ''; // Clear the table before displaying search results

  if (searchQuery === '') {
    displayTestCases(); // Show all cases if search is empty
    return;
  }

  const filteredScenarios = allScenarios.filter(scenario => {
    const idMatch = scenario.id.toString().toLowerCase().includes(searchQuery);
    const titleMatch = scenario.scenario && scenario.scenario.toLowerCase().includes(searchQuery);
    const nameMatch = scenario.name && scenario.name.toLowerCase().includes(searchQuery);
    return idMatch || titleMatch || nameMatch;
  });

  filteredScenarios.forEach(scenario => {
    const row = document.createElement('tr');

    const cellSelect = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selectedCases.includes(scenario.id);
    checkbox.addEventListener('change', () => handleSelectionChange(scenario.id, checkbox.checked));
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

document.getElementById('search-button').addEventListener('click', searchById);

document.getElementById('run-selected-tests').addEventListener('click', () => {
  const selectedTestCases = Array.from(document.querySelectorAll('#test-case-list input[type="checkbox"]:checked'))
    .map(checkbox => checkbox.closest('tr').children[1].textContent); // Assume the ID is in the second cell

  const idsRegex = selectedTestCases.map(id => `\\b${id}\\b`).join('|');
  const customCommand = `npm run test:ids -- --grep="${idsRegex}"`;

  ipcRenderer.send('run-custom-tests', customCommand);
});

document.getElementById('view-selected-ids-report').addEventListener('click', () => {
  ipcRenderer.send('generate-report-ids');
});

document.getElementById('clear-reports').addEventListener('click', () => {
  ipcRenderer.send('clear-reports');
});

ipcRenderer.on('reports-cleared', (event, message) => {
  console.log(message); // or display this message in the UI
});

ipcRenderer.on('report-clear-error', (event, error) => {
  console.error(error); // or display this error in the UI
});

document.getElementById('run-ui-tests').addEventListener('click', () => {
  ipcRenderer.send('run-ui-tests');
});

document.getElementById('run-api-tests').addEventListener('click', () => {
  ipcRenderer.send('run-api-tests');
});

document.getElementById('generate-ui-report').addEventListener('click', () => {
  ipcRenderer.send('generate-ui-report');
});

document.getElementById('generate-api-report').addEventListener('click', () => {
  ipcRenderer.send('generate-api-report');
});

document.getElementById('clear-ui-reports').addEventListener('click', () => {
  ipcRenderer.send('clear-ui-reports');
});

document.getElementById('clear-api-reports').addEventListener('click', () => {
  ipcRenderer.send('clear-api-reports');
});

ipcRenderer.on('clear-reports-result', (event, message) => {
  alert(message); // Or display this message in a status area in your UI
});

// Global array to hold test suites
let testSuites = [];
let selectedCasesForSuite = {};

// Load test cases when the modal is opened
function loadTestCases() {
    const listElement = document.getElementById('test-case-selection-list');
    listElement.innerHTML = '';
    allScenarios.forEach(scenario => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.setAttribute('data-id', scenario.id);
        checkbox.checked = selectedCasesForSuite[scenario.id] || false;
        checkbox.onchange = function() {
            selectedCasesForSuite[scenario.id] = this.checked;
        };
        listItem.appendChild(checkbox);
        listItem.append(` ID: ${scenario.id}, Name: ${scenario.scenario}`);
        listElement.appendChild(listItem);
    });
}

// Specific search for the test suite modal
function searchTestCasesForSuite() {
    const searchQuery = document.getElementById('search-test-case').value.toLowerCase();
    const listElement = document.getElementById('test-case-selection-list');
    listElement.innerHTML = '';
    allScenarios.filter(scenario => scenario.id.toLowerCase().includes(searchQuery) || scenario.scenario.toLowerCase().includes(searchQuery))
        .forEach(scenario => {
            const listItem = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.setAttribute('data-id', scenario.id);
            checkbox.checked = selectedCasesForSuite[scenario.id] || false;
            checkbox.onchange = function() {
                selectedCasesForSuite[scenario.id] = this.checked;
            };
            listItem.appendChild(checkbox);
            listItem.append(` ID: ${scenario.id}, Name: ${scenario.scenario}`);
            listElement.appendChild(listItem);
        });
}

document.getElementById('search-test-case').addEventListener('input', searchTestCasesForSuite);
// Evento para cerrar modales al hacer clic en el botón de cierre
document.querySelectorAll('.close').forEach(closeButton => {
  closeButton.onclick = function() {
    closeModal(closeButton.closest('.modal'));
  }
});

// Función para cerrar un modal específico
function closeModal(modal) {
  modal.style.display = 'none';
  document.getElementById('suite-name').value = '';
  document.getElementById('suite-description').value = '';
  selectedCasesForSuite = {};
  loadTestCases();
}

// Evento para cerrar modales al hacer clic fuera de ellos
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    closeModal(event.target);
  }
};

document.getElementById('add-test-suite').addEventListener('click', function() {
  document.getElementById('suite-name').value = '';
  document.getElementById('suite-description').value = '';
  selectedCasesForSuite = {}; // Resetear las selecciones de casos de prueba
  loadTestCases(); // Recargar la lista de casos de prueba
  document.getElementById('add-test-suite-modal').style.display = 'block';
});

document.getElementById('test-suite-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const suiteName = document.getElementById('suite-name').value.trim();
  const suiteDescription = document.getElementById('suite-description').value.trim();
  
  if (!suiteName || !suiteDescription) {
      alert('Both name and description are required.');
      return;
  }

  const selectedCases = Object.keys(selectedCasesForSuite).filter(key => selectedCasesForSuite[key]);

  const newSuite = {
      name: suiteName,
      description: suiteDescription,
      testCases: selectedCases
  };
  testSuites.push(newSuite);
  
  saveTestSuites()
      .then(() => {
          displayTestSuites(); // Actualizar la lista de suites
          closeModal(document.getElementById('add-test-suite-modal')); // Cerrar el modal
          selectedCasesForSuite = {}; // Resetear selecciones después de cerrar el modal
      })
      .catch(err => {
          console.error('Failed to save the test suite:', err);
          alert('Failed to save the test suite. Please check the console for more details.');
      });
});



document.getElementsByClassName('close')[0].onclick = closeModalAddTestSuite;

function closeModalAddTestSuite() {
  const modal = document.getElementById('add-test-suite-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}


window.onclick = function(event) {
    if (event.target === document.getElementById('add-test-suite-modal')) {
      closeModalAddTestSuite();
    }
};


// Función para añadir test suites sin sobrescribir los existentes
function saveTestSuites() {
  return new Promise((resolve, reject) => {
    // Primero leer el archivo actual para obtener las suites existentes
    fs.readFile(path.join(__dirname, 'testSuites.json'), 'utf-8', (err, data) => {
      if (err) {
        console.error('Failed to read test suites:', err);
        reject(err);
      } else {
        let existingSuites = JSON.parse(data);
        existingSuites.push(...testSuites); // Añadir nuevas suites a las existentes
        // Guardar el conjunto actualizado de vuelta al archivo
        fs.writeFile(path.join(__dirname, 'testSuites.json'), JSON.stringify(existingSuites, null, 2), 'utf-8', err => {
          if (err) {
            console.error('Failed to save test suites:', err);
            reject(err);
          } else {
            console.log('Test suites saved successfully.');
            resolve();
          }
        });
      }
    });
  });
}

// Función para cargar los test suites del archivo JSON
function loadTestSuites() {
  fs.readFile(path.join(__dirname, 'testSuites.json'), 'utf-8', (err, data) => {
    if (err) {
      console.error('Error loading test suites:', err);
      alert('Error loading test suites. Check the console for more details.');
      return;
    }
    try {
      testSuites = JSON.parse(data);
      console.log('Test suites loaded successfully:', testSuites); // Diagnóstico: Ver los datos cargados
      displayTestSuites();
    } catch (parseError) {
      console.error('Error parsing test suites:', parseError);
      alert('Error parsing test suites. Check the console for more details.');
    }
  });
}

// Función para mostrar los test suites en la interfaz
function displayTestSuites() {
  const listElement = document.getElementById('test-suites-list');
  listElement.innerHTML = '';
  testSuites.forEach((suite, index) => {
    const listItem = document.createElement('li');
    
    const suiteInfo = document.createElement('div');
    suiteInfo.className = 'suite-info';
    suiteInfo.textContent = `${suite.name}: ${suite.description}`;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'btn-delete';
    deleteButton.onclick = () => deleteTestSuite(index);

    const showMoreButton = document.createElement('button');
    showMoreButton.textContent = 'Show More';
    showMoreButton.className = 'btn-primary';
    showMoreButton.onclick = () => showTestSuiteDetails(suite);

    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(showMoreButton);

    listItem.appendChild(suiteInfo);
    listItem.appendChild(buttonContainer);
    listElement.appendChild(listItem);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  loadTestSuites();  // Asegúrate de que se llame al cargar la página
});

function deleteTestSuite(index) {
  testSuites.splice(index, 1);
  saveTestSuites(); // Actualizar el archivo JSON
  displayTestSuites();
}

function showTestSuiteDetails(suite) {
  alert(`Details for ${suite.name}:\nDescription: ${suite.description}`);
}



// function showTestSuiteDetails(suite) {
//   const editModal = document.getElementById('edit-test-suite-modal');
//   document.getElementById('edit-suite-name').value = suite.name;
//   document.getElementById('edit-suite-description').value = suite.description;
//   displaySelectedTestCases(suite.testCases);
//   displayAllTestCases(suite);
//   editModal.style.display = 'block';
// }

// function displaySelectedTestCases(selectedTestCases) {
//   const listElement = document.getElementById('selected-test-cases-list');
//   listElement.innerHTML = '';
//   selectedTestCases.forEach(caseId => {
//       const listItem = document.createElement('li');
//       listItem.textContent = `ID: ${caseId}`;
//       listElement.appendChild(listItem);
//   });
// }

// function displayAllTestCases(suite) {
//   const tbodyElement = document.getElementById('edit-test-case-selection-list').querySelector('tbody');
//   tbodyElement.innerHTML = ''; // Clear the table body
//   allScenarios.forEach(scenario => {
//     const tr = document.createElement('tr');
//     const selectCell = document.createElement('td');
//     const checkbox = document.createElement('input');
//     checkbox.type = 'checkbox';
//     checkbox.checked = suite.testCases.includes(scenario.id);
//     checkbox.onchange = () => updateSelectedTestCases(suite, scenario.id, checkbox.checked);
//     selectCell.appendChild(checkbox);

//     const idCell = document.createElement('td');
//     idCell.textContent = scenario.id;

//     const nameCell = document.createElement('td');
//     nameCell.textContent = scenario.scenario;

//     tr.appendChild(selectCell);
//     tr.appendChild(idCell);
//     tr.appendChild(nameCell);
//     tbodyElement.appendChild(tr);
//   });
// }

// function filterEditTestCases() {
//   const searchQuery = document.getElementById('edit-search-test-case').value.toLowerCase();
//   const rows = document.querySelectorAll('#edit-test-case-selection-list tbody tr');
//   rows.forEach(row => {
//     const id = row.children[1].textContent.toLowerCase();
//     const name = row.children[2].textContent.toLowerCase();
//     if (id.includes(searchQuery) || name.includes(searchQuery)) {
//       row.style.display = '';
//     } else {
//       row.style.display = 'none';
//     }
//   });
// }

// function updateSelectedTestCases(suite, testCaseId, isChecked) {
//   if (isChecked) {
//       if (!suite.testCases.includes(testCaseId)) suite.testCases.push(testCaseId);
//   } else {
//       suite.testCases = suite.testCases.filter(id => id !== testCaseId);
//   }
//   displaySelectedTestCases(suite.testCases); // Update the table for selected test cases
// }

// let currentSuiteIndex = -1; // Global index to track which suite is being edited

// function showTestSuiteDetails(suite, index) {
//   currentSuiteIndex = index; // Save the current suite index globally
//   const editModal = document.getElementById('edit-test-suite-modal');
//   document.getElementById('edit-suite-name').value = suite.name;
//   document.getElementById('edit-suite-description').value = suite.description;
//   displaySelectedTestCases(suite.testCases);
//   displayAllTestCases(suite);
//   editModal.style.display = 'block';
// }


// function saveEditedTestSuite() {
//   const suite = testSuites[currentSuiteIndex]; // Obteniendo el test suite correcto
//   if (!suite) {
//     console.error("Error: No test suite found at the index", currentSuiteIndex);
//     return;
//   }

//   // Capturar y actualizar los datos del formulario
//   suite.name = document.getElementById('edit-suite-name').value;
//   suite.description = document.getElementById('edit-suite-description').value;

//   // Guardar los cambios en el archivo JSON
//   saveTestSuites().then(() => {
//     displayTestSuites(); // Actualizar la visualización de test suites
//     closeModal(); // Cerrar el modal después de guardar
//   }).catch(error => {
//     console.error('Failed to save the test suites:', error);
//   });
// }

// document.getElementById('edit-test-suite-form').addEventListener('submit', function(event) {
//   event.preventDefault(); // Prevenir la recarga de la página
//   saveEditedTestSuite();
// });

// function saveTestSuites() {
//   const filePath = path.join(__dirname, 'testSuites.json');
//   const data = JSON.stringify(testSuites, null, 2);
//   return fs.writeFile(filePath, data, 'utf-8')
//     .then(() => {
//       console.log('Test suites saved successfully.');
//     })
//     .catch(err => {
//       console.error('Failed to save test suites:', err);
//     });
// }
