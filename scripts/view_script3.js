const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const dlHtml = fs.readFileSync(path.join(baseDir, 'downloads.html'), 'utf-8');
const scriptMatches = dlHtml.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);

console.log('Script 3 completo:');
console.log(scriptMatches[2]);
