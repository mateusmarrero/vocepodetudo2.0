const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const manifest = fs.readFileSync(path.join(baseDir, 'manifest.json'), 'utf-8');
console.log('--- MANIFEST.JSON ---');
console.log(manifest);
