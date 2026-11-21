const fs = require('fs');
let deploy = fs.readFileSync('scripts/deploy_ftp.js', 'utf8');

const target = "{ local: 'index.html', remote: 'index.html' },";
if (deploy.includes(target) && !deploy.includes('midia-kit.html')) {
  const rep = target + "\n      { local: 'midia-kit.html', remote: 'midia-kit.html' },";
  deploy = deploy.replace(target, rep);
  fs.writeFileSync('scripts/deploy_ftp.js', deploy, 'utf8');
  console.log('✅ scripts/deploy_ftp.js atualizado com midia-kit.html!');
} else {
  console.log('deploy_ftp.js já contém midia-kit.html ou target não encontrado');
}
