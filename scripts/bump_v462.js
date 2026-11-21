const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEW_VER = '4.62.0';

console.log(`--- Iniciando Bump de Versão para v${NEW_VER} ---`);

const files = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

let updatedCount = 0;
for (const file of files) {
  const filePath = path.join(ROOT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(/\?v=\d+\.\d+\.\d+/g, `?v=${NEW_VER}`);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`✅ Cache busting atualizado para v=${NEW_VER} em: ${file}`);
  }
}

// Atualizar sw.js
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v\d+\.\d+\.\d+';/, `const CACHE_NAME = 'vocepodetudo-pwa-v${NEW_VER}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`✅ Service Worker CACHE_NAME atualizado para v=${NEW_VER}`);
}

// Atualizar CHANGELOG.md
const changelogPath = path.join(ROOT_DIR, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  let cl = fs.readFileSync(changelogPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  const newEntry = `## [4.62.0] - ${today}
### Adicionado
- **Central de Mensagens & Fale Conosco (Inbox no Admin):** Visualização completa de mensagens de contato, filtros por status (Não Lida, Respondida, Arquivada), contador de não lidas e resposta com disparo automático de e-mail ao visitante (\`api/contact.php\`).
- **Central de Backups 1-Clique & Saúde do Servidor:** Exportação de Dump MySQL (\`.sql\`) e Dump Completo em JSON (\`.json\`), diagnóstico de saúde (PHP, MySQL, limites de memória, permissões) e botão de purga/recarga segura de caches (\`api/backup.php\`).
- **Moderação de Avaliações & Prova Social:** Painel de notas por estrelas dos cursos, métricas de satisfação da comunidade e aprovação/rejeição/exclusão de comentários (\`api/ratings.php\`).
- **Gestão de Banners de Parceiros & Anunciantes Diretos:** Cadastro, veiculação e monitoramento de anúncios locais/patrocinadores com rastreamento de impressões, cliques e CTR (\`api/banners.php\`).
- **Log de Auditoria & Rastreabilidade de Segurança:** Registro de eventos administrativos (logins, alterações, exclusões) com data, usuário, IP e exportação em CSV (\`api/audit_logs.php\`).

### Corrigido
- **Padronização Canônica de SEO:** Corrigida tag canônica em \`index.html\` para \`https://vocepodetudo.com/\` (eliminando divergência com/sem www apontada no Google Search Console).
- **Consolidação de Domínio no .htaccess:** Adicionado redirecionamento 301 forçado de \`www.vocepodetudo.com\` para \`https://vocepodetudo.com\`, unificando autoridade de SEO e evitando sinalizações de "página alternativa".

`;
  cl = cl.replace('# Changelog\n', '# Changelog\n\n' + newEntry);
  fs.writeFileSync(changelogPath, cl, 'utf8');
  console.log(`✅ CHANGELOG.md atualizado com as notas da v${NEW_VER}`);
}

console.log(`\n🎉 Concluído! ${updatedCount} arquivos HTML e Service Worker atualizados para v${NEW_VER}.`);
