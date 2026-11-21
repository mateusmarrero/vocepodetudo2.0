const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');
const extDir = path.join(baseDir, 'android_build', 'extracted');

if (fs.existsSync(extDir)) {
  console.log('Conteúdo de android_build/extracted:');
  console.log(fs.readdirSync(extDir));
} else {
  console.log('Pasta extracted não existe');
}
