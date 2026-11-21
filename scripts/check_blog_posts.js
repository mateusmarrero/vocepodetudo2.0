const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const blogJson = JSON.parse(fs.readFileSync(path.join(baseDir, 'api', 'cache_blog.json'), 'utf-8'));
console.log('Total de artigos existentes:', blogJson.length);
console.log('Exemplo do primeiro artigo (chaves):', Object.keys(blogJson[0]));
console.log('Últimos 3 títulos:', blogJson.slice(0, 3).map(p => p.titulo));
