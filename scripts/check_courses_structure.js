const fs = require('fs');
const path = require('path');

const cachePath = path.join(__dirname, '..', 'api', 'cache_courses.json');
const seedPath = path.join(__dirname, '..', 'api', 'seed_courses.json');

const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('Cache courses count:', Array.isArray(cacheData) ? cacheData.length : Object.keys(cacheData));
console.log('Seed courses count:', Array.isArray(seedData) ? seedData.length : Object.keys(seedData));
if (Array.isArray(cacheData) && cacheData.length > 0) {
  console.log('Sample course fields:', Object.keys(cacheData[0]));
}
