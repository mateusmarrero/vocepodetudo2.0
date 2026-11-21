const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let content = fs.readFileSync(changelogPath, 'utf8');

const marker = '---';
const markerIdx = content.indexOf(marker);

const newEntry = `---

## [4.69.0] - 2026-11-12
### 🚀 Gerador de Carta de Recomendação & PDF A4, Alerta VIP de Vagas e In-Feed AdSense

- **Gerador de Carta de Apresentação e Carta de Recomendação em PDF A4 (\`curriculo.html\` & \`src/curriculo.js\`):**
  - Implementada 4ª aba oficial *"📜 Carta de Recomendação"* no modal de cartas profissionais.
  - Seletor inteligente com 4 modalidades: E-mail Formal, Mensagem Direta para WhatsApp do Recrutador, Abordagem de Conexão no LinkedIn e Modelo Oficial Timbrado de Recomendação Profissional.
  - Novo botão *"📄 Baixar PDF"* gerando documento em alta resolução no padrão A4 oficial timbrado com margens técnicas de 20mm, cabeçalho e rodapé institucionais do Portal Você Pode Tudo via html2pdf.js.
  - Exportação e persistência 100% locais sem envio de dados pessoais para servidores externos.
  - Suíte dos 25 testes do Criador de Currículos aprovada (25/25).

- **Alerta VIP de Novas Vagas & Estágios (\`vagas.html\` & \`src/vagas.js\`):**
  - Adicionado banner interativo no topo do Mural de Vagas com gradiente institucional, selo VIP gratuito e formulário de inscrição.
  - Filtro de recebimento por área de interesse: Jovem Aprendiz, Estágio/Superior, Tecnologia & TI, Administração e Saúde.
  - Conexão assíncrona com fallback local resiliente e feedback com toast visual de confirmação.

- **Monetização Otimizada com Google AdSense In-Feed Fluido (\`src/app.js\` & \`src/vagas.js\`):**
  - Injeção automática e elegante de blocos in-feed patrocinados a cada 6 cursos no catálogo e a cada 6 oportunidades no mural de vagas.
  - Blindagem contra erros de domínio local (\`localhost\` / \`127.0.0.1\`) e controle estrito de status \`pending\` no DOM para evitar repetição de chamadas de anúncio.

- **Expansão Estratégica do Blog & SEO Orgânico (\`api/seed_blog.json\`, \`sitemap.xml\`, \`rss.xml\`):**
  - Publicação de 3 novos artigos pilares (total de 144 artigos): Jovem Aprendiz 2026 (Regras, Salários e Inscrição), Primeiro Emprego sem Experiência e Cursos Gratuitos SENAI/SESI/Bradesco com Certificado MEC.
  - Sitemap e Feed RSS regenerados com canonicalização limpa (sem \`www.\`).

- **Garantia de Qualidade & Testes em Tempo Real:**
  - Verificação automatizada em Edge Headless via protocolo CDP: 100% das páginas com zero erros no console.
`;

if (!content.includes('[4.69.0]')) {
  content = content.substring(0, markerIdx) + newEntry + '\n' + content.substring(markerIdx + 3);
  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log('✅ CHANGELOG.md atualizado para v4.69.0');
} else {
  console.log('v4.69.0 já constava no CHANGELOG.md');
}
