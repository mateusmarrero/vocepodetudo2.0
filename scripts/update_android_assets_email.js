const fs = require('fs');
const path = require('path');

const appAssets = [
  'android_native_app/app/src/main/assets/www/index.html',
  'android_native_app/app/src/main/assets/www/politica-privacidade.html',
  'android_native_app/app/src/main/assets/www/termos-de-uso.html'
];

appAssets.forEach(file => {
  if (fs.existsSync(file)) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/contato\.vocepodetudo@gmail\.com/g, 'contato@vocepodetudo.com');
    fs.writeFileSync(file, c, 'utf8');
    console.log(`✅ ${file} updated`);
  }
});
