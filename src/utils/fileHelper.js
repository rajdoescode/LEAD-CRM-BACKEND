import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

/**
 * Read and parse a JSON file from the data directory.
 * @param {string} filename - Name of the JSON file (e.g., 'leads.json')
 * @returns {any} Parsed JSON content
 */
const readJSON = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

/**
 * Write data to a JSON file in the data directory.
 * @param {string} filename - Name of the JSON file
 * @param {any} data - Data to write
 */
const writeJSON = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export {
  readJSON,
  writeJSON
};
