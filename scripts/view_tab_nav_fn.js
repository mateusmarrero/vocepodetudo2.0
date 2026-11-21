const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminJs = fs.readFileSync(path.join(ROOT, 'src', 'admin.js'), 'utf8');

const navFnStart = adminJs.indexOf('function setupTabNavigation()');
console.log(adminJs.slice(navFnStart, navFnStart + 1200));
