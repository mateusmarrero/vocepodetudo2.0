const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

console.log('=== HEADER EM VAGAS.HTML ===');
const vagas = fs.readFileSync(path.join(dir, 'vagas.html'), 'utf8');
const vagasLines = vagas.split('\n');
vagasLines.slice(70, 160).forEach((l, i) => console.log((70+i+1) + ': ' + l));

console.log('=== HEADER EM BLOG.HTML ===');
const blog = fs.readFileSync(path.join(dir, 'blog.html'), 'utf8');
const blogLines = blog.split('\n');
blogLines.slice(70, 160).forEach((l, i) => console.log((70+i+1) + ': ' + l));
