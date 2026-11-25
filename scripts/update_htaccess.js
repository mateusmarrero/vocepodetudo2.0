const fs = require('fs');
const path = require('path');

const htPath = path.resolve(__dirname, '../.htaccess');
let content = fs.readFileSync(htPath, 'utf8');

const target = 'RewriteRule ^blog/([a-zA-Z0-9_-]+)/?$ artigo.php?slug=$1 [L,QSA]';
const addition = `RewriteRule ^blog/([a-zA-Z0-9_-]+)/?$ artigo.php?slug=$1 [L,QSA]

  # Rotas Amigáveis para Páginas Individuais de Cursos (com redirecionamento canônico de parâmetros legados)
  RewriteCond %{QUERY_STRING} (?:^|&)curso=([a-zA-Z0-9_-]+)(?:&|$)
  RewriteRule ^(?:index\\.html)?$ /curso/%1? [R=301,L]

  RewriteRule ^curso/([a-zA-Z0-9_-]+)/?$ curso.php?id=$1 [L,QSA]
  RewriteRule ^cursos/([a-zA-Z0-9_-]+)/?$ curso.php?id=$1 [L,QSA]`;

if (!content.includes('RewriteRule ^curso/([a-zA-Z0-9_-]+)/?$ curso.php?id=$1')) {
  content = content.replace(target, addition);
  fs.writeFileSync(htPath, content, 'utf8');
  console.log('✅ .htaccess atualizado com as rotas de curso.');
} else {
  console.log('ℹ️ .htaccess já possui as rotas de curso.');
}
