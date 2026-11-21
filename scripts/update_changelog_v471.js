const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let content = fs.readFileSync(changelogPath, 'utf8');

const marker = '---';
const markerIdx = content.indexOf(marker);

const newEntry = `---

## [4.71.0] - 2026-11-13
### 🌐 URLs Amigáveis (Clean URLs) em Todo o Portal e Otimização SEO

- **Eliminação de Extensões \`.html\` em Todas as Rotas Públicas:**
  - Configuração do Apache (\`.htaccess\`) com reescrita transparente (\`mod_rewrite\`) para servir páginas HTML sem extensão na URL (ex: \`/curriculo\`, \`/vagas\`, \`/blog\`, \`/calculadora-trabalhista\`, \`/downloads\`, \`/sobre\`, etc.).
  - Redirecionamento 301 Permanente de URLs antigas com extensão (\`page.html\` -> \`page\`) via \`%{THE_REQUEST}\` para evitar conteúdo duplicado no Google.
  - Conversão de todos os links internos (\`href\`) e metadados (\`canonical\`, \`og:url\`) nos 22 arquivos HTML do portal.

- **URLs Amigáveis para Artigos do Blog (\`/artigo/slug-do-artigo\` & \`/blog/slug-do-artigo\`):**
  - Implementado roteador limpo no \`.htaccess\` e em \`artigo.php\` para exibir URLs elegantes sem query parameters.
  - Atualização no \`src/blog.js\` para gerenciar o histórico do navegador via \`history.replaceState\` ao abrir e fechar artigos.

- **Atualização Canônica no Sitemap & Feed RSS (\`sitemap.xml\` & \`rss.xml\`):**
  - Todas as 19 páginas fixas e os 144 artigos do blog atualizados no \`sitemap.xml\` e \`rss.xml\` para utilizarem exclusivamente URLs amigáveis.

- **Auditoria de Qualidade em Tempo Real:**
  - 25 testes do Criador de Currículos aprovados (25/25).
  - Verificação automatizada Edge Headless via CDP em todas as rotas amigáveis com zero erros no console.
`;

if (!content.includes('[4.71.0]')) {
  content = content.substring(0, markerIdx) + newEntry + '\n' + content.substring(markerIdx + 3);
  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log('✅ CHANGELOG.md atualizado para v4.71.0');
}
