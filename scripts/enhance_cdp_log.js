const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'scripts', 'verify_all_pages_cdp.js');
let js = fs.readFileSync(filePath, 'utf8');

const target = "errors.push('EXCEPTION: ' + exc.text);";
const replacement = "errors.push('EXCEPTION: ' + exc.text + ' -> ' + (exc.exception ? exc.exception.description : '') + ' (linha ' + exc.lineNumber + ' col ' + exc.columnNumber + ')');";

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync(filePath, js, 'utf8');
  console.log('✅ verify_all_pages_cdp.js atualizado com log de detalhes.');
} else {
  console.log('Target não encontrado');
}
