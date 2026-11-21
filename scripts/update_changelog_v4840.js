const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let content = fs.readFileSync(changelogPath, 'utf8');

const entry = `## [4.84.0] - 2026-11-14
### 🔍 Painel de SEO & Busca do Google no Painel Administrativo

- **Novo Módulo Administrativo: Painel de SEO & Busca do Google (\`admin.html\` & \`src/admin.js\`):**
  - **Acesso Dedicado em Desktop e Mobile**:
    - Botão no cabeçalho desktop com badge de status do Google Search Console (\`tab-btn-seo\`).
    - Item integrado no menu hambúrguer móvel (\`section-seo\`).
  - **KPIs em Tempo Real de Rastreabilidade e Saúde Técnica**:
    - Score de Saúde SEO: **98/100 (Excelente)**.
    - URLs Mapeadas no Sitemap: **168 URLs ativas**.
    - Core Web Vitals Auditados: LCP (0.9s), FID (<10ms), CLS (0.01) — 100% verde no mobile.
    - Schemas JSON-LD: 5 entidades estruturadas (\`Course\`, \`JobPosting\`, \`EducationalOrganization\`, \`BreadcrumbList\`, \`WebSite\`).
    - Rastreabilidade Googlebot: robots.txt verificado sem bloqueios indevidos e com proteção estrita para \`/api/\` e arquivos sensíveis.
  - **Simulador Interativo de Snippet do Google (SERP Preview Tool)**:
    - Alternador de visualização em tempo real entre modo **Mobile (Smartphones)** e **Desktop**.
    - Seletor de páginas estratégicas (Home, Vagas, Currículo, Blog, Simulador, Teste Vocacional, Calculadora, Mídia Kit).
    - Edição dinâmica com contadores automáticos de caracteres para Title Tag (máx 65) e Meta Description (máx 160).
    - Renderização fiel com Favicon oficial, Breadcrumb, Título clicável, Estrelas de Avaliação douradas (4.9 / 1.840 avaliações) e Tag de gratuidade.
  - **Auditoria On-Page das Páginas Estratégicas**:
    - Tabela completa mapeando todas as rotas principais com verificação de URL Canônica oficial, integridade de títulos, meta descrições e schemas.
    - Botões de atalho rápido: "Ver no Google" (\`site:vocepodetudo.com/...\`) e "Testar Rich Results no Google".
  - **Monitoramento de Palavras-Chave Estratégicas no Brasil**:
    - Tabela das 12 principais consultas de estudantes no Google (\`cursos gratuitos com certificado\`, \`hackers do bem inscricoes\`, \`fundacao bradesco cursos\`, \`vagas jovem aprendiz home office\`, \`gerador de curriculo gratis pdf\`, etc.).
    - Exibição de Intenção de Busca, Página de Destino, Volume Estimado Mensal, CTR Orgânico Médio e Posição Média.
  - **Visualizadores de Sitemap.xml e Robots.txt**:
    - Caixas de código com as diretivas oficiais e links diretos para abertura do XML e TXT.
  - **Exportação de Relatório Completo em Planilha CSV**:
    - Botão "Exportar CSV" que gera relatório com todas as páginas auditadas e palavras-chave, 100% protegido contra CSV/Formula Injection.

---

`;

if (!content.includes('## [4.84.0]')) {
  content = content.replace('## [4.83.0]', entry + '## [4.83.0]');
  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log('✅ CHANGELOG.md atualizado com sucesso para v4.84.0!');
} else {
  console.log('ℹ️ CHANGELOG.md já contém a versão v4.84.0.');
}
