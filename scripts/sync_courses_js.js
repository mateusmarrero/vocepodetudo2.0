const fs = require('fs');
const path = require('path');

const seedPath = path.resolve(__dirname, '../api/seed_courses.json');
const jsPath = path.resolve(__dirname, '../src/data/courses.js');

const seedCourses = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
let jsContent = fs.readFileSync(jsPath, 'utf8');

// Localizar onde localCourses começa e termina
const marker = 'const localCourses = ';
const markerIdx = jsContent.indexOf(marker);

if (markerIdx === -1) {
  console.error('Marker "const localCourses = " not found!');
  process.exit(1);
}

// Pegar tudo antes de const localCourses =
const before = jsContent.substring(0, markerIdx + marker.length);

// Pegar tudo depois do array de localCourses (onde começa if (typeof window !== 'undefined'))
const afterMarker = '\nif (typeof window !== \'undefined\')';
const afterIdx = jsContent.indexOf(afterMarker);

if (afterIdx === -1) {
  console.error('afterMarker not found!');
  process.exit(1);
}

const after = jsContent.substring(afterIdx);

const updatedJs = before + JSON.stringify(seedCourses, null, 2) + ';' + after;
fs.writeFileSync(jsPath, updatedJs, 'utf8');
console.log(`✅ src/data/courses.js sincronizado com ${seedCourses.length} cursos do seed.`);
