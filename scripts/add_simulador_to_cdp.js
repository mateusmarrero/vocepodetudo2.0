const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'scripts', 'verify_all_pages_cdp.js');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes("'/simulador-entrevista'")) {
  code = code.replace("'/admin'", "'/admin',\n  '/simulador-entrevista'");
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✅ /simulador-entrevista adicionado à lista de testes CDP');
} else {
  console.log('Já está presente na lista');
}
