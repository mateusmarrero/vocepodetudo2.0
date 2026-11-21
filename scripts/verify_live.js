const fs = require('fs');
const htmlPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/scratch/verify_fix.html';

if (!fs.existsSync(htmlPath)) {
  console.log('File does not exist: ' + htmlPath);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
console.log('HTML total length:', html.length);

// Check results count
const resultsMatch = html.match(/id=["']results-count-text["'][^>]*>([\s\S]*?)<\/span>/i);
console.log('Results count text:', resultsMatch ? resultsMatch[1].trim() : 'NOT FOUND');

// Check courses grid
const gridPos = html.indexOf('id="courses-grid"');
if (gridPos !== -1) {
  const gridChunk = html.substr(gridPos, 2000);
  console.log('Courses grid chunk:\n', gridChunk.substring(0, 500));
} else {
  console.log('id="courses-grid" not found');
}

// Check category filters
const catPos = html.indexOf('id="categories-container"');
if (catPos !== -1) {
  console.log('categories-container chunk:\n', html.substr(catPos, 400));
}

// Check if error message is present
if (html.includes('0 de 0 cursos')) {
  console.log('WARNING: Still shows 0 de 0 cursos!');
} else {
  console.log('SUCCESS: Not showing 0 de 0 cursos!');
}
