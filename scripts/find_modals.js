const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
lines.forEach((l, i) => {
  if (l.includes('job-modal') || l.includes('blog-modal') || l.includes('jobs-container') || l.includes('blog-container')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
