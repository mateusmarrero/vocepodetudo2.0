const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const appJs = fs.readFileSync(path.join(dir, 'src', 'app.js'), 'utf8');

const lines = appJs.split('\n');
console.log('Total linhas em app.js:', lines.length);

const jobRefs = [];
const blogRefs = [];

lines.forEach((l, i) => {
  if (l.includes('jobs-section') || l.includes('job-modal') || l.includes('loadJobs') || l.includes('renderJobs')) {
    jobRefs.push(`L${i+1}: ${l.trim()}`);
  }
  if (l.includes('blog-section') || l.includes('blog-modal') || l.includes('loadBlog') || l.includes('renderBlog')) {
    blogRefs.push(`L${i+1}: ${l.trim()}`);
  }
});

console.log(`\n=== REFERÊNCIAS A JOBS EM APP.JS (${jobRefs.length}) ===`);
console.log(jobRefs.slice(0, 15));

console.log(`\n=== REFERÊNCIAS A BLOG EM APP.JS (${blogRefs.length}) ===`);
console.log(blogRefs.slice(0, 15));
