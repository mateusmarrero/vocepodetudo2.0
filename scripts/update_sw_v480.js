const fs = require('fs');

let sw = fs.readFileSync('sw.js', 'utf8');

// 1. Atualizar CACHE_NAME
sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v4\.[0-9]+\.[0-9]+';/, "const CACHE_NAME = 'vocepodetudo-pwa-v4.80.0';");

// 2. Adicionar midia-kit em PRECACHE_ASSETS se não existir
if (!sw.includes("'/midia-kit.html'")) {
  const target = "'/downloads.html',";
  const rep = "'/downloads.html',\n  '/midia-kit.html',\n  '/midia-kit',";
  sw = sw.replace(target, rep);
  console.log('✅ midia-kit adicionado em PRECACHE_ASSETS!');
}

fs.writeFileSync('sw.js', sw, 'utf8');
console.log('✅ sw.js atualizado para v4.80.0!');
