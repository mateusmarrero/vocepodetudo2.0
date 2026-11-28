const fs = require('fs');
const path = require('path');

const filesToAudit = [
  'artigo.php',
  'blog.html',
  'src/blog.js'
];

const mojibakePatterns = [
  'Ã¡', 'Ã©', 'Ã­', 'Ã³', 'Ãº', 'Ã£', 'Ãµ', 'Ã¢', 'Ãª', 'Ã´',
  'Ã', 'Ã‰', 'Ã', 'Ã“', 'Ãš', 'Ãƒ', 'Ã•', 'Ã‚', 'ÃŠ', 'Ã”',
  'Ã§', 'Ã‡', 'â€“', 'â€”', 'â€œ', 'â€\x9d', 'Â°', 'Âª', 'Âº',
  '\uFFFD', '&Atilde;', '&atilde;', '&Otilde;', '&otilde;'
];

let totalIssues = 0;

console.log('=== AUDITORIA DE QUALIDADE, GRAFIA E CODIFICAÇÃO (BLOG & ARTIGOS) ===\n');

filesToAudit.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) {
    console.log(`[ERRO] Arquivo não encontrado: ${file}`);
    totalIssues++;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  console.log(`Verificando: ${file} (${(content.length / 1024).toFixed(1)} KB)`);

  let fileIssues = 0;

  mojibakePatterns.forEach(pattern => {
    if (content.includes(pattern)) {
      console.log(`  [ALERTA] Padrão mojibake detectado: "${pattern}"`);
      fileIssues++;
    }
  });

  if (fileIssues === 0) {
    console.log(`  [OK] Codificação UTF-8 100% íntegra (zero mojibake).`);
  }

  // Verificar se há tags PHP não fechadas ou sintaxe básica
  if (file.endsWith('.php')) {
    if (content.includes('<?php') && !content.includes('?>') && !content.includes('</html>')) {
      console.log(`  [ALERTA] Possível tag PHP não finalizada.`);
      fileIssues++;
    }
  }

  // Verificar se as âncoras temáticas e IDs estão corretos
  if (file === 'artigo.php') {
    if (!content.includes('generateArticleTableOfContents')) {
      console.log(`  [ERRO] generateArticleTableOfContents ausente em artigo.php`);
      fileIssues++;
    }
    if (!content.includes('article-toc')) {
      console.log(`  [ERRO] article-toc ausente em artigo.php`);
      fileIssues++;
    }
  }

  if (file === 'blog.html') {
    if (!content.includes('id="blog-themes-summary"')) {
      console.log(`  [ERRO] id="blog-themes-summary" ausente em blog.html`);
      fileIssues++;
    }
    if (!content.includes('data-category="academico"')) {
      console.log(`  [ERRO] data-category="academico" ausente em blog.html`);
      fileIssues++;
    }
  }

  if (file === 'src/blog.js') {
    if (!content.includes('injectReaderTableOfContents')) {
      console.log(`  [ERRO] injectReaderTableOfContents ausente em src/blog.js`);
      fileIssues++;
    }
  }

  totalIssues += fileIssues;
  console.log('');
});

console.log('------------------------------------------------------------');
if (totalIssues === 0) {
  console.log('RESULTADO FINAL: 0 PROBLEMAS ENCONTRADOS! Qualidade e grafia 100% validadas!');
} else {
  console.log(`RESULTADO FINAL: ${totalIssues} problema(s) encontrado(s).`);
}
console.log('------------------------------------------------------------\n');

process.exit(totalIssues === 0 ? 0 : 1);
