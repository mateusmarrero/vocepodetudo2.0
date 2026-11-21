const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (['node_modules', '.git', 'scratch', 'android_build', 'android_native_app'].includes(f)) continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      searchDir(full);
    } else if (f.endsWith('.js') || f.endsWith('.html')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('Acessar Curso Oficial') || content.includes('certificateNote')) {
        console.log('Found in:', full);
      }
    }
  }
}
searchDir('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY');
