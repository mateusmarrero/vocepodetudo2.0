const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

console.log('=== VAGAS.HTML SCRIPTS E ESTRUTURA ===');
const vagas = fs.readFileSync(path.join(dir, 'vagas.html'), 'utf8');
console.log('Tamanho de vagas.html:', vagas.length);
const vagasScripts = [...vagas.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi)];
vagasScripts.forEach(s => console.log('Script em vagas.html:', s[1]));

console.log('\n=== BLOG.HTML SCRIPTS E ESTRUTURA ===');
const blog = fs.readFileSync(path.join(dir, 'blog.html'), 'utf8');
console.log('Tamanho de blog.html:', blog.length);
const blogScripts = [...blog.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi)];
blogScripts.forEach(s => console.log('Script em blog.html:', s[1]));
