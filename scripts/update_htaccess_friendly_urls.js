const fs = require('fs');
const path = require('path');

const htaccessPath = path.join(__dirname, '..', '.htaccess');
let ht = fs.readFileSync(htaccessPath, 'utf8');

// Montar a seção 1 moderna com suporte completo a URLs Amigáveis
const newSection1 = `<IfModule mod_rewrite.c>
  RewriteEngine On

  # Repassar Authorization Header de forma segura para o PHP (FastCGI / FPM / StackCP)
  RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
  
  # Redirecionamento 301 de www para sem www (Consolidação Canônica de SEO)
  RewriteCond %{HTTP_HOST} ^www\\.vocepodetudo\\.com$ [NC]
  RewriteRule ^(.*)$ https://vocepodetudo.com/$1 [L,R=301]

  # Forçar HTTPS
  RewriteCond %{HTTPS} off
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Redirecionar /index.html para a raiz / (Evitar conteúdo duplicado)
  RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\\ /index\\.html\\ HTTP/ [NC]
  RewriteRule ^index\\.html$ https://vocepodetudo.com/ [R=301,L]

  # Redirecionamento 301 de URLs com .html para a URL amigável sem extensão
  # Ignora 404.html e arquivos reais que não sejam páginas HTML públicas
  RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\\ /([^.]+)\\.html(\\?[^\\ ]*)?\\ HTTP/ [NC]
  RewriteCond %{REQUEST_URI} !^/404\\.html$ [NC]
  RewriteRule ^([^.]+)\\.html$ https://vocepodetudo.com/$1 [R=301,L]

  # Redirecionamentos de Legado para URLs Canônicas Amigáveis
  RewriteRule ^materiais-gratuitos/?$ /downloads [R=301,L]
  RewriteRule ^download/?$ /downloads [R=301,L]
  RewriteRule ^criar-curriculo/?$ /curriculo [R=301,L]

  # Rotas Amigáveis para os Artigos do Blog
  RewriteRule ^artigo/([a-zA-Z0-9_-]+)/?$ artigo.php?slug=$1 [L,QSA]
  RewriteRule ^blog/([a-zA-Z0-9_-]+)/?$ artigo.php?slug=$1 [L,QSA]

  # Rotas Amigáveis para o Painel Administrativo
  RewriteRule ^painel-gestao/?$ admin.html [L,QSA]
  RewriteRule ^gestao-interna/?$ admin.html [L,QSA]

  # Servir internamente arquivos .html quando requisitados sem extensão
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{DOCUMENT_ROOT}/$1.html -f
  RewriteRule ^([^/]+)/?$ $1.html [L,QSA]
</IfModule>`;

const oldSection1Regex = /<IfModule mod_rewrite\.c>[\s\S]*?<\/IfModule>/;
if (oldSection1Regex.test(ht)) {
  ht = ht.replace(oldSection1Regex, newSection1);
  console.log('✅ Seção mod_rewrite principal atualizada com URLs amigáveis');
}

// Limpar regras duplicadas na seção 4
const oldSection4Target = `  # Rota Amigável para o Criador de Currículos
  RewriteRule ^criar-curriculo/?$ /curriculo.html [R=301,L]
  
  # Rotas Amigáveis e Camufladas para o Painel Administrativo
  RewriteRule ^painel-gestao/?$ admin.html [L]
  RewriteRule ^gestao-interna/?$ admin.html [L]`;

if (ht.includes(oldSection4Target)) {
  ht = ht.replace(oldSection4Target, '  # (Rotas migradas para a seção principal de mod_rewrite)');
}

fs.writeFileSync(htaccessPath, ht, 'utf8');
console.log('✅ .htaccess atualizado com sucesso.');
