const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const lines = index.split('\n');
lines.forEach((l, i) => {
  if (l.includes('<section id="jobs-section"') || l.includes('</section><!-- fim jobs-section -->') ||
      l.includes('<section id="blog-section"') || l.includes('id="job-details-modal"') ||
      l.includes('id="blog-reader-modal"')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
