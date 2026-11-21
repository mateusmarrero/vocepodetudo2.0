const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const htaccessPath = path.join(baseDir, '.htaccess');
let htaccess = fs.readFileSync(htaccessPath, 'utf-8');

if (!htaccess.includes('ErrorDocument 404')) {
  htaccess = 'ErrorDocument 404 /404.html\n\n' + htaccess;
  fs.writeFileSync(htaccessPath, htaccess, 'utf-8');
  console.log('[OK] .htaccess atualizado com ErrorDocument 404 /404.html!');
} else {
  console.log('[INFO] .htaccess já possui ErrorDocument 404.');
}

// Atualizar sw.js para v4.48.0 e incluir 404.html
const swPath = path.join(baseDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf-8');
sw = sw.replace(/vocepodetudo-pwa-v\d+\.\d+\.\d+/g, 'vocepodetudo-pwa-v4.48.0');
if (!sw.includes("'/404.html'")) {
  sw = sw.replace("'/downloads.html',", "'/downloads.html',\n  '/404.html',");
}
fs.writeFileSync(swPath, sw, 'utf-8');
console.log('[OK] sw.js atualizado para v4.48.0 com 404.html no precache!');

// Atualizar scripts/deploy_ftp.js para enviar 404.html
const deployPath = path.join(baseDir, 'scripts', 'deploy_ftp.js');
let deploy = fs.readFileSync(deployPath, 'utf-8');
if (!deploy.includes("'404.html'")) {
  deploy = deploy.replace(
    "{ local: 'downloads.html', remote: 'downloads.html' },",
    "{ local: 'downloads.html', remote: 'downloads.html' },\n      { local: '404.html', remote: '404.html' },"
  );
  fs.writeFileSync(deployPath, deploy, 'utf-8');
  console.log('[OK] scripts/deploy_ftp.js atualizado com 404.html!');
}
