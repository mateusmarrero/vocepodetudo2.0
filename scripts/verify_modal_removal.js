const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

console.log('Contains job-details-modal:', index.includes('id="job-details-modal"'));
console.log('Contains blog-reader-modal:', index.includes('id="blog-reader-modal"'));
console.log('Contains jobs-section:', index.includes('id="jobs-section"'));
console.log('Contains blog-section:', index.includes('id="blog-section"'));

if (index.includes('id="blog-reader-modal"')) {
  console.log('Locating blog-reader-modal:');
  const pos = index.indexOf('id="blog-reader-modal"');
  console.log(index.slice(pos - 100, pos + 300));
}
