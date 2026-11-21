const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const dlHtml = fs.readFileSync(path.join(baseDir, 'downloads.html'), 'utf-8');

console.log('Tamanho de downloads.html:', dlHtml.length);

// Extrair todos os blocos de <script> para testar sintaxe JS
const scriptMatches = dlHtml.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
console.log('Quantidade de blocos <script> inline:', scriptMatches ? scriptMatches.length : 0);

if (scriptMatches) {
  scriptMatches.forEach((sc, i) => {
    const code = sc.replace(/<\/?script[^>]*>/gi, '');
    try {
      new Function(code);
      console.log(`Script ${i+1}: Sintaxe JS OK!`);
    } catch (err) {
      console.error(`Script ${i+1}: ERRO DE SINTAXE JS:`, err.message);
      console.log('Trecho do código com erro:');
      console.log(code.slice(0, 500));
    }
  });
}
