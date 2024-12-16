const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

// Base directory to watch
const baseTestDirectory = path.join(__dirname, 'tests');

// Function to extract test scenarios from files
async function extractTestScenarios(directory) {
    let scenarios = [];

    async function traverseDirectory(currentDirectory) {
        const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });

        for (let entry of entries) {
            const entryPath = path.join(currentDirectory, entry.name);
            if (entry.isDirectory()) {
                await traverseDirectory(entryPath);
            } else if (entry.isFile() && path.extname(entry.name) === '.js') {
                const content = fs.readFileSync(entryPath, 'utf8');
                const scenarioRegex = /it\('([^']+)',/g;
                let match;

                while ((match = scenarioRegex.exec(content)) !== null) {
                    const tags = extractTags(match.input);
                    const id = extractID(match.input);
                    const cleanedScenario = cleanScenario(match[1]);
                    scenarios.push({
                        id: id,
                        file: entry.name,
                        scenario: cleanedScenario,
                        tags: tags
                    });
                }
            }
        }
    }

    function extractTags(scenarioLine) {
        const tagRegex = /\[Tag: ([^\]]+)\]/g;
        const tags = new Set();  // Use a set to avoid duplicates
        let tagMatch;
    
        while ((tagMatch = tagRegex.exec(scenarioLine)) !== null) {
            tags.add(tagMatch[1]);
        }
    
        return Array.from(tags); // Convert back to array
    }

    function extractID(scenarioLine) {
        const idRegex = /TC-\d+: /; // Match IDs like "TC-47: "
        const match = idRegex.exec(scenarioLine);
        return match ? match[0].slice(0, -2) : "No ID found"; // Extract ID without the colon and space
    }

    function cleanScenario(scenario) {
        const cleanRegex = /TC-\d+: /; // Remove ID from scenario
        return scenario.replace(cleanRegex, '').trim(); // Clean scenario description
    }

    await traverseDirectory(directory);
    return scenarios;
}

// Watch the directory and emit updates
function watchTestDirectories(window) {
    const directories = [path.join(baseTestDirectory, 'api'), path.join(baseTestDirectory, 'ui')];

    directories.forEach(dir => {
        fs.watch(dir, { recursive: true }, async () => {
            const scenarios = await extractTestScenarios(baseTestDirectory);
            window.webContents.send('test-cases-updated', scenarios);
        });
    });
}

module.exports = { extractTestScenarios, watchTestDirectories };
