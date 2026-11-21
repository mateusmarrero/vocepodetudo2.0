const fs = require('fs');

// 1. Atualizar .gitignore
const gitignorePath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/.gitignore';
let gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';

const newIgnores = [
  '# Chaves de assinatura e segredos locais',
  'signing-key-info.txt',
  '*.keystore',
  '*.jks',
  '*.idsig',
  '',
  '# Documentos locais confidenciais',
  'CHANGELOG_COMPLETO_VOCEPODETUDO.txt',
  '',
  '# Diretórios de compilação móvel nativa',
  'android_build/',
  'android_native_app/'
].join('\n');

if (!gitignore.includes('signing-key-info.txt')) {
  gitignore = gitignore.trimEnd() + '\n\n' + newIgnores + '\n';
  fs.writeFileSync(gitignorePath, gitignore, 'utf8');
  console.log('✅ .gitignore atualizado com proteção de chaves e changelog local!');
}

// 2. Atualizar .htaccess
const htaccessPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/.htaccess';
let htaccess = fs.readFileSync(htaccessPath, 'utf8');

const oldFilesMatch = `<FilesMatch "\\.(env|sql|zip|7z|tar|gz|log)$">
  Require all denied
</FilesMatch>`;

const newFilesMatch = `<FilesMatch "\\.(env|sql|zip|7z|tar|gz|log|keystore|jks)$">
  Require all denied
</FilesMatch>

<FilesMatch "^(signing-key-info|CHANGELOG_COMPLETO_VOCEPODETUDO)\\.txt$">
  Require all denied
</FilesMatch>`;

if (htaccess.includes(oldFilesMatch)) {
  htaccess = htaccess.replace(oldFilesMatch, newFilesMatch);
  fs.writeFileSync(htaccessPath, htaccess, 'utf8');
  console.log('✅ .htaccess atualizado com bloqueio a signing-key-info.txt, keystores e changelog!');
} else {
  console.warn('Aviso: Bloco FilesMatch em .htaccess não encontrado exatamente.');
}
