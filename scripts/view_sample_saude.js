const fs = require('fs');
const path = require('path');

const cachePath = path.join(__dirname, '..', 'api', 'cache_courses.json');
const courses = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const sample = courses.find(c => c.category === 'saude');
console.log(JSON.stringify(sample, null, 2));
