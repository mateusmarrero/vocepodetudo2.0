const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let missing = 0;
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const has = content.includes('midia-kit');
  if (!has) {
    console.log(`❌ FALTANDO: ${f}`);
    missing++;
  } else {
    console.log(`✅ ${f}`);
  }
});
console.log(`\nTotal avaliados: ${files.length}. Faltando: ${missing}`);
