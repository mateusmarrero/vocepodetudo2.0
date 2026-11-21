const fs = require('fs');
const path = require('path');

function searchCsv(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (['.git', 'node_modules', 'scratch', 'android_build', 'android_native_app'].includes(f)) continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      searchCsv(full);
    } else if (/\.(html|js|php)$/i.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('text/csv') || content.includes('fputcsv') || content.includes('.csv')) {
        console.log('Found CSV in:', full);
      }
    }
  }
}

searchCsv('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY');
