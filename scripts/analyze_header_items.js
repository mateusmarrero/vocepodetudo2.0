const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
const navStart = indexHtml.indexOf('<nav class="hidden lg:flex');
const navEnd = indexHtml.indexOf('</nav>', navStart);
const nav = indexHtml.slice(navStart, navEnd + 6);

// Procurar todos os blocos de primeiro nível dentro do nav
console.log('--- COMPONENTES DE 1º NÍVEL NO NAV DESKTOP ---');
const regex = /<(?:div class="nav-cascata"|a [^>]*class="[^"]*(?:inline-flex|calc-btn|px-)[^"]*")[^>]*>([\s\S]*?)<\/(?:div|a)>/gi;
let match;
let count = 0;
while ((match = regex.exec(nav)) !== null) {
  count++;
  const snippet = match[0].slice(0, 150).replace(/\s+/g, ' ');
  console.log(`[${count}] ${snippet}`);
}
console.log('Total de blocos detectados:', count);

console.log('\n--- LADO DIREITO DO HEADER (APÓS </NAV>) ---');
const afterNav = indexHtml.slice(navEnd + 6, navEnd + 1200);
console.log(afterNav);
