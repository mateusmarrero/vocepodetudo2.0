const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const adminJs = fs.readFileSync(path.join(ROOT, 'src', 'admin.js'), 'utf8');

const loadAllStart = adminJs.indexOf('function loadAllDashboardData()');
console.log(adminJs.slice(loadAllStart, loadAllStart + 1000));
