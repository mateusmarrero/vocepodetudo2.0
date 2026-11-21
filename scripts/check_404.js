const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const has404 = fs.existsSync(path.join(baseDir, '404.html'));
console.log('Existe 404.html?:', has404);

const htaccess = fs.readFileSync(path.join(baseDir, '.htaccess'), 'utf-8');
console.log('htaccess tem ErrorDocument 404?:', htaccess.includes('ErrorDocument 404'));
