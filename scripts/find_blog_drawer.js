const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const content = fs.readFileSync(path.join(baseDir, 'blog.html'), 'utf-8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('btn-mobile-nav-toggle') || l.includes('mobile-menu') || l.includes('drawer')) {
    console.log(`L${i+1}: ${l}`);
  }
});
