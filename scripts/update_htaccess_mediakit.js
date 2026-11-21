const fs = require('fs');
let htaccess = fs.readFileSync('.htaccess', 'utf8');

const target = 'RewriteRule ^criar-curriculo/?$ /curriculo [R=301,L]';
if (htaccess.includes(target) && !htaccess.includes('/midia-kit')) {
  const rep = target + `\n  RewriteRule ^media-kit/?$ /midia-kit [R=301,L]\n  RewriteRule ^anuncie/?$ /midia-kit [R=301,L]\n  RewriteRule ^publicidade/?$ /midia-kit [R=301,L]`;
  htaccess = htaccess.replace(target, rep);
  fs.writeFileSync('.htaccess', htaccess, 'utf8');
  console.log('✅ .htaccess atualizado com redirecionamentos amigáveis para /midia-kit!');
} else {
  console.log('.htaccess já atualizado ou target não encontrado');
}
