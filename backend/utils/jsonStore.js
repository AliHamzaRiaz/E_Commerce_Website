const fs = require('fs/promises');
const path = require('path');

const ensureJsonFile = async (filePath, defaultValue) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
  }
};

const readJsonArray = async (filePath, defaultValue = []) => {
  await ensureJsonFile(filePath, defaultValue);
  const raw = await fs.readFile(filePath, 'utf8');
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : defaultValue;
  } catch {
    return defaultValue;
  }
};

const writeJsonArray = async (filePath, arr) => {
  await ensureJsonFile(filePath, []);
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
};

module.exports = { ensureJsonFile, readJsonArray, writeJsonArray };
