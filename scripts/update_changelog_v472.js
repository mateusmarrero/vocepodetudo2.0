const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let content = fs.readFileSync(changelogPath, 'utf8');

const marker = '---';
const markerIdx = content.indexOf(marker);

const newEntry = `---

## [4.72.0] - 2026-11-13
### 🚀 Simulador de Entrevistas Avançado STAR & Auditoria Ortográfica Global

- **Expansão Profunda do Simulador de Entrevistas (\`simulador-entrevista.html\` & \`src/simulador.js\`):**
  - **9 Trilhas de Carreira Especializadas (45 Perguntas Reais de RH):** Jovem Aprendiz, Administrativo, Atendimento/SAC, Tecnologia, Saúde & Enfermagem, Vendas & Comercial, Logística & Estoque, Liderança & Gestão, e Perguntas Difíceis/Pegadinhas de RH.
  - **Modo Cronometrado Real:** Treino com tempo limite ajustável (Livre, 60s Pressão Rápida, 90s Padrão RH e 120s Caso STAR) com display regressivo, barra de progresso colorida e aviso sonoro.
  - **Motor de Avaliação Multidimensional STAR:** Avaliação detalhada de 0 a 100 pontos dividida em 4 eixos (Clareza, Método STAR Situação-Tarefa-Ação-Resultado, Vocabulário Profissional e Relevância).
  - **Detector de Vícios de Linguagem:** Análise em tempo real de expressões informais como *"tipo assim"*, *"né"*, *"aí"*, *"meio que"*, com alertas construtivos.
  - **Exportação do Relatório em PDF A4 Timbrado:** Download direto do relatório completo de desempenho diagramado para impressão e compartilhamento via WhatsApp.

- **Auditoria e Correção Ortográfica e de Acentuação em Todo o Portal:**
  - Varredura completa em todos os 22 arquivos HTML, descrições do catálogo de cursos (\`src/data/courses.js\`), banco de vagas (\`api/seed_jobs.json\`) e artigos (\`api/seed_blog.json\`).
  - Correção de centenas de palavras sem acentuação gráfica (agudos, circunflexos, crases, tils e cedilhas) em textos visíveis, meta tags, títulos e placeholders segundo o Acordo Ortográfico.

- **Garantia de Qualidade & Testes:**
  - 25 testes do Criador de Currículos aprovados (25/25).
  - 100% das páginas testadas no Edge Headless via protocolo CDP com zero erros de console.
`;

if (!content.includes('[4.72.0]')) {
  content = content.substring(0, markerIdx) + newEntry + '\n' + content.substring(markerIdx + 3);
  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log('✅ CHANGELOG.md atualizado para v4.72.0');
}
