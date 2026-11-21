const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const scriptPath = path.join(baseDir, 'scripts', 'generate_android_bundle.js');
if (fs.existsSync(scriptPath)) {
  console.log(fs.readFileSync(scriptPath, 'utf-8'));
} else {
  console.log('generate_android_bundle.js não existe');
}
