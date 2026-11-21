const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('--- Padronizando SEO Canônico e Regras de Redirecionamento ---');

// 1. Atualizar tag canônica em index.html
const indexPath = path.join(ROOT, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

indexHtml = indexHtml.replace(
  '<link rel="canonical" href="https://www.vocepodetudo.com/">',
  '<link rel="canonical" href="https://vocepodetudo.com/">'
);
fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✅ Canonical de index.html padronizado para https://vocepodetudo.com/');

// 2. Atualizar .htaccess com regra 301 de WWW -> sem WWW
const htaccessPath = path.join(ROOT, '.htaccess');
let htaccess = fs.readFileSync(htaccessPath, 'utf8');

const targetRewrite = `  RewriteCond %{HTTPS} off
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`;

const replacementRewrite = `  # Redirecionamento 301 de www para sem www (Consolidação Canônica de SEO)
  RewriteCond %{HTTP_HOST} ^www\\.vocepodetudo\\.com$ [NC]
  RewriteRule ^(.*)$ https://vocepodetudo.com/$1 [L,R=301]

  # Forçar HTTPS
  RewriteCond %{HTTPS} off
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`;

if (!htaccess.includes('^www\\.vocepodetudo\\.com$')) {
  htaccess = htaccess.replace(targetRewrite, replacementRewrite);
  fs.writeFileSync(htaccessPath, htaccess, 'utf8');
  console.log('✅ .htaccess atualizado com redirecionamento 301 de www -> sem www.');
}

console.log('--- Padronização SEO Concluída ---');
