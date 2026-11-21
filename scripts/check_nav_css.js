const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const css = fs.readFileSync(path.join(baseDir, 'src', 'style.css'), 'utf-8');
const lines = css.split('\n');

lines.forEach((l, i) => {
  if (l.includes('.nav-cascata') || l.includes('nav-submenu')) {
    console.log(`L${i+1}: ${l}`);
  }
});
