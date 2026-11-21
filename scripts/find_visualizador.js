const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (['.git', 'node_modules', 'scratch', 'android_build', 'android_native_app'].includes(f)) continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      search(full);
    } else if (/\.(html|js|php|md|txt|json)$/i.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.toLowerCase().includes('visualizador')) {
        console.log('Found "visualizador" in:', full);
      }
    }
  }
}

search('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY');
