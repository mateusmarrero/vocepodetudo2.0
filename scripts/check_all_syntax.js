const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(baseDir, file), 'utf-8');
  const scriptMatches = content.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi);
  if (scriptMatches) {
    scriptMatches.forEach((sc, i) => {
      const code = sc.replace(/<\/?script[^>]*>/gi, '');
      try {
        new Function(code);
      } catch (err) {
        console.error(`ARQUIVO ${file} -> Script ${i+1}: ERRO:`, err.message);
      }
    });
  }
});
