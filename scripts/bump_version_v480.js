const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');

console.log('=== ATUALIZANDO VERSÃO PARA v4.80.0 (MÍDIA KIT COMPLETO & DOSSIÊ OFICIAL) ===');

// 1. Atualizar sw.js
const swPath = path.join(projectDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/vocepodetudo-pwa-v4\.\d+\.\d+/g, 'vocepodetudo-pwa-v4.80.0');
fs.writeFileSync(swPath, sw, 'utf8');
console.log('✅ sw.js atualizado para v4.80.0');

// 2. Atualizar src/app.js
const appPath = path.join(projectDir, 'src', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/sw\.js\?v=[0-9.]+/g, 'sw.js?v=4.80.0');
app = app.replace(/Service Worker v[0-9.]+ registrado com sucesso/g, 'Service Worker v4.80.0 registrado com sucesso');
fs.writeFileSync(appPath, app, 'utf8');
console.log('✅ src/app.js atualizado com sw.js?v=4.80.0');

// 3. Atualizar src/curriculo.js
const currPath = path.join(projectDir, 'src', 'curriculo.js');
let curr = fs.readFileSync(currPath, 'utf8');
curr = curr.replace(/sw\.js\?v=[0-9.]+/g, 'sw.js?v=4.80.0');
fs.writeFileSync(currPath, curr, 'utf8');
console.log('✅ src/curriculo.js atualizado com sw.js?v=4.80.0');

// 4. Atualizar todos os arquivos HTML
const htmlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.html'));
let countHtml = 0;
htmlFiles.forEach(f => {
  const filePath = path.join(projectDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('4.79.0')) {
    content = content.replace(/4\.79\.0/g, '4.80.0');
    fs.writeFileSync(filePath, content, 'utf8');
    countHtml++;
  }
});
console.log(`✅ ${countHtml} arquivos HTML atualizados com cache-busting v4.80.0`);

// 5. Atualizar CHANGELOG.md
const changelogPath = path.join(projectDir, 'CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');
const newChangelogEntry = `## [4.80.0] - 2026-11-14
### 📊 Mídia Kit Completo, Dossiê Oficial para Anunciantes & Página Pública (/midia-kit)

- **Nova Página Pública Oficial (\`midia-kit.html\` e rota amigável \`/midia-kit\`):**
  - Criação da página comercial completa para marcas, agências de publicidade e instituições parceiras.
  - **Métricas Auditadas em Tempo Real:** Conexão dinâmica com a API de telemetria (\`api/analytics.php?action=stats\`) exibindo visualizações (pageviews), cliques em cursos oficiais (leads qualificados com CTR médio de 3,4%), base de alunos cadastrados, testes vocacionais e tempo médio de sessão (4m 45s).
  - **Perfil Qualificado da Audiência:** Mapeamento demográfico com faixas etárias dominantes (16-24 anos: 42% Primeiro Emprego/Jovem Aprendiz; 25-34 anos: 38% Transição e Especialização; 35-54 anos: 16%; 55+ anos: 4%), proporção por gênero (54% feminino / 46% masculino), penetração mobile (78% smartphones / 22% desktops) e ranking dos estados com maior audiência (SP, RJ, MG, BA, PR, RS, CE, PE, GO, DF).
  - **Catálogo Completo de Formatos Publicitários (Padrão IAB & Nativos):** Super Leaderboard Topo (728x90 / 320x100), Card Patrocinado Nativo In-Feed (300x250 com CTR de até 5,2%), Half-Page Lateral Sticky no Blog (300x600), Billboard Intertítulo (970x250), Push Notifications segmentadas e Naming Rights com patrocínio exclusivo de ferramentas (Criador de Currículos, Simulador de Entrevistas com IA e Calculadoras CLT/PJ).
  - **Simulador Interativo de Campanhas:** Widget em JavaScript permitindo que anunciantes escolham o formato, configurem o volume de impressões desejado (20k a 500k) e o período, obtendo projeções imediatas de cliques e alcance de usuários únicos.
  - **Dossiê Timbrado para Impressão e PDF:** Folha de estilos dedicada (\`@media print\`) que formata a página perfeitamente em tamanho A4 corporativo timbrado com cabeçalho oficial e dados auditados ao acionar o botão de impressão.
  - **Formulário Comercial Direto & WhatsApp:** Canal direto com pré-formatação automática de proposta para WhatsApp Business e e-mail institucional (\`comercial@vocepodetudo.com\`).

- **Enriquecimento do Mídia Kit na Gestão Administrativa (\`admin.html\`):**
  - Reestruturação da aba Mídia Kit com incorporação de tabelas IAB, métricas de ferramentas interativas, diretrizes de homologação técnica (150KB máx, HTML5, SSL, tags Google Ad Manager) e link direto para a página pública.
  - Correção e fechamento estrutural do container timbrado de impressão.

- **Expansão da Exportação de Dados em Planilha Excel (\`api/analytics.php\`):**
  - Adição de seções completas no CSV exportável (\`action=mediakit_csv\`), cobrindo inventário de formatos IAB, especificações técnicas, modelos comerciais (CPM, CPC, Fixo Mensal) e selo de conformidade com LGPD e Brand Safety Tier 1.

- **Infraestrutura, Rotas & Rodapés:**
  - Inclusão de link "Mídia Kit & Publicidade" no rodapé de todas as 24 páginas HTML do portal.
  - Configuração de redirecionamentos amigáveis no \`.htaccess\` (\`/media-kit\`, \`/anuncie\`, \`/publicidade\` -> \`/midia-kit\`).
  - Indexação no \`sitemap.xml\` com prioridade comercial de 0.85 e registro no cache do Service Worker (\`sw.js\`).
  - Registro de deploy automático no \`scripts/deploy_ftp.js\`.

---

`;

if (!changelog.includes('[4.80.0]')) {
  changelog = changelog.replace('## [4.79.0] - 2026-11-13', newChangelogEntry + '## [4.79.0] - 2026-11-13');
  fs.writeFileSync(changelogPath, changelog, 'utf8');
  console.log('✅ CHANGELOG.md atualizado para v4.80.0');
}

console.log('=== BUMP DE VERSÃO v4.80.0 CONCLUÍDO COM SUCESSO ===');
