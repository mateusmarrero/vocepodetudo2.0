const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const content = fs.readFileSync(path.join(baseDir, 'downloads.html'), 'utf-8');
const lastPart = content.slice(content.indexOf('function triggerDownload'));
console.log(lastPart);
