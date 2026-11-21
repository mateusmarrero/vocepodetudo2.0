const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');
const androidDir = path.join(baseDir, 'android_build');

if (fs.existsSync(androidDir)) {
  console.log('Conteúdo de android_build:');
  console.log(fs.readdirSync(androidDir));
} else {
  console.log('android_build não existe!');
}

// Procurar por scripts que mencionam apk ou android
const scriptsDir = path.join(baseDir, 'scripts');
if (fs.existsSync(scriptsDir)) {
  const scripts = fs.readdirSync(scriptsDir);
  console.log('\nScripts em scripts/:', scripts.filter(s => s.toLowerCase().includes('apk') || s.toLowerCase().includes('android') || s.toLowerCase().includes('twa')));
}
