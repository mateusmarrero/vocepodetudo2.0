const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

console.log('=== TAGS CANÔNICAS EM TODOS OS HTMLS ===');
files.forEach(f => {
  const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const m = content.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  if (m) {
    const href = m[0].match(/href=["']([^"']+)["']/i);
    console.log(`${f}: ${href ? href[1] : 'sem href'}`);
  } else {
    console.log(`${f}: [SEM CANONICAL]`);
  }
});
