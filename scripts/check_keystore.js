const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');
const keystorePath = path.join(baseDir, 'android_build', 'extracted', 'signing.keystore');

if (fs.existsSync(keystorePath)) {
  const stat = fs.statSync(keystorePath);
  console.log('Keystore existe! Tamanho:', stat.size, 'bytes');
  const base64 = fs.readFileSync(keystorePath).toString('base64');
  console.log('Base64 length:', base64.length);
} else {
  console.log('Keystore NÃO encontrada!');
}
