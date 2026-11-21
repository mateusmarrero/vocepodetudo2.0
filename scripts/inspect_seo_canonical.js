const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 1. Inspecionar .htaccess
const htaccessPath = path.join(ROOT, '.htaccess');
if (fs.existsSync(htaccessPath)) {
  console.log('=== .htaccess (trecho de regras de redirecionamento/canônicas) ===');
  const ht = fs.readFileSync(htaccessPath, 'utf8');
  console.log(ht.slice(0, 1000));
}

// 2. Inspecionar tags canônicas em index.html
const indexPath = path.join(ROOT, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const canonicalMatch = indexHtml.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
console.log('\n=== Canonical em index.html ===');
console.log(canonicalMatch ? canonicalMatch[0] : 'NÃO ENCONTRADO');
