/* eslint-disable no-console */
// Usage: node normalize.js <path-to-json-file>
// Description: This script normalizes the Unicode characters in the JSON file to ASCII characters.
// It also pretty-prints the JSON file (indent being 2 spaces).
// It uses the `unidecode` package to convert Unicode characters to ASCII characters.
// The normalized JSON file is saved with the suffix `-normalized.json`.
// Example: node normalize.js src/support/api/static/lines-ref.json

const fs = require('fs');
const unidecode = require('unidecode');

// Load the JSON file
const [,,filePath] = process.argv;

if (!filePath) {
  console.error('Please provide the path to the JSON file');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error('The file does not exist');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Function to replace Unicode characters with ASCII
function replaceUnicode(obj) {
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      obj[key] = replaceUnicode(obj[key]);
    }
  } else if (typeof obj === 'string') {
    return unidecode(obj);
  }
  return obj;
}

// Replace Unicode characters
const updatedData = replaceUnicode(data);

// Save the modified JSON file
fs.writeFileSync(`${filePath}-normalized.json`, JSON.stringify(updatedData, null, 2), 'utf8');

console.log(`The normalized JSON file has been saved as ${filePath}-normalized.json`);
