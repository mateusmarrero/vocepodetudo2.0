const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

console.log('=== JOBS SECTION IN INDEX.HTML ===');
const jobsMatch = index.match(/<section[^>]*id=["']jobs-section["'][\s\S]*?<\/section>/i);
if (jobsMatch) {
  console.log('Tamanho de jobs-section:', jobsMatch[0].length, 'caracteres');
  console.log(jobsMatch[0].slice(0, 500));
}

console.log('=== BLOG SECTION IN INDEX.HTML ===');
const blogMatch = index.match(/<section[^>]*id=["']blog-section["'][\s\S]*?<\/section>/i);
if (blogMatch) {
  console.log('Tamanho de blog-section:', blogMatch[0].length, 'caracteres');
  console.log(blogMatch[0].slice(0, 500));
}

console.log('=== HEADER LINKS IN INDEX.HTML ===');
const lines = index.split('\n');
lines.slice(100, 350).forEach((l, i) => {
  if (l.includes('vagas') || l.includes('blog') || l.includes('Vagas &') || l.includes('Blog &')) {
    console.log(`L${100+i+1}: ${l.trim()}`);
  }
});
