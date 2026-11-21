const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const files = fs.readdirSync(baseDir);
console.log('Arquivos na raiz:');
files.forEach(f => console.log('-', f));

console.log('\nVerificando .well-known:');
if (fs.existsSync(path.join(baseDir, '.well-known'))) {
  console.log(fs.readdirSync(path.join(baseDir, '.well-known')));
  if (fs.existsSync(path.join(baseDir, '.well-known', 'assetlinks.json'))) {
    console.log('assetlinks.json:', fs.readFileSync(path.join(baseDir, '.well-known', 'assetlinks.json'), 'utf-8'));
  }
}
