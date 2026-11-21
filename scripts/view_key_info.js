const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');
const infoPath = path.join(baseDir, 'android_build', 'extracted', 'signing-key-info.txt');

if (fs.existsSync(infoPath)) {
  console.log('--- SIGNING KEY INFO ---');
  console.log(fs.readFileSync(infoPath, 'utf-8'));
}
