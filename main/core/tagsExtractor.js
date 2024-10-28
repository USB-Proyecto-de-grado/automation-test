const fs = require('fs');
const path = require('path');

function extractTagsFromTests(directory) {
    let tags = new Set();
    
    function readDirectory(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        files.forEach(file => {
            if (file.isDirectory()) {
                readDirectory(path.join(dir, file.name)); // Recursivamente leer subdirectorios
            } else if (file.name.endsWith('.spec.js')) {
                const content = fs.readFileSync(path.join(dir, file.name), 'utf8');
                const tagMatches = content.match(/\[Tag: \w+\]/g);
                if (tagMatches) {
                    tagMatches.forEach(tag => tags.add(tag));
                }
            }
        });
    }

    readDirectory(directory);
    return Array.from(tags);
}

module.exports = extractTagsFromTests;