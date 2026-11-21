const fs = require('fs');
const path = require('path');

const artigoPhpPath = path.join(__dirname, '..', 'artigo.php');
let php = fs.readFileSync(artigoPhpPath, 'utf8');

php = php.replace(
  "header('Location: /blog.html');",
  "header('Location: /blog');"
);

php = php.replace(
  "header('Location: /blog.html');",
  "header('Location: /blog');"
);

php = php.replace(
  "$canonicalUrl = 'https://vocepodetudo.com/blog.html?artigo=' . urlencode((string)$post['slug']);",
  "$canonicalUrl = 'https://vocepodetudo.com/artigo/' . urlencode((string)$post['slug']);\n$readerUrl = 'https://vocepodetudo.com/blog?artigo=' . urlencode((string)$post['slug']);"
);

php = php.replace(
  "header('Location: ' . $canonicalUrl);",
  "header('Location: ' . $readerUrl);"
);

fs.writeFileSync(artigoPhpPath, php, 'utf8');
console.log('✅ artigo.php atualizado com URLs amigáveis');
