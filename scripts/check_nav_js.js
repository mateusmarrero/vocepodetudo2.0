const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const appJs = fs.readFileSync(path.join(baseDir, 'src', 'app.js'), 'utf-8');
const lines = appJs.split('\n');

lines.forEach((l, i) => {
  if (l.includes('nav-cascata') || l.includes('nav-dropdown') || l.includes('nav-submenu')) {
    console.log(`L${i+1}: ${l}`);
  }
});
