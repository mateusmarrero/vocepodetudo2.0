const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let content = fs.readFileSync(changelogPath, 'utf8');

const marker = '---';
const markerIdx = content.indexOf(marker);

const newEntry = `---

## [4.70.0] - 2026-11-12
### 🚀 Google for Jobs Schema.org, Ícone Oficial do WhatsApp e Gatilhos Virais

- **Correção Visual do Compartilhamento WhatsApp nas Vagas (\`src/vagas.js\`):**
  - Substituído o ícone genérico por SVG oficial e nítido do WhatsApp com cor institucional e preenchimento perfeito.
  - Correção na ordem de montagem do DOM garantindo a execução completa de \`lucide.createIcons\` nos cards de oportunidades.

- **Ativação Oficial do Google for Jobs (\`vagas.html\` & \`src/vagas.js\`):**
  - Implementação completa dos dados estruturados \`JobPosting\` (Schema.org / JSON-LD) estáticos no \`<head>\` e dinâmicos para cada busca/filtro.
  - Campos técnicos mapeados: modalidade (\`TELECOMMUTE\` para remoto e endereço físico para vagas presenciais), salários no padrão ISO, empresa contratante e link oficial de candidatura direta (\`directApply\`).

- **Google Rich Snippets de Cursos Gratuitos (\`index.html\`):**
  - Inserção de dados estruturados Schema.org \`Course\` com credenciais educacionais (\`educationalCredentialAwarded\`), formato online e indicação de gratuidade oficial para rastreamento nos resultados do Google.

- **Gatilhos Virais de Compartilhamento no WhatsApp (\`vagas.html\` & \`curriculo.html\`):**
  - Adicionado card promocional *"Ajude um Amigo"* no final do Mural de Vagas e no Criador de Currículos com mensagens pré-formatadas para indicação rápida via WhatsApp.

- **Auditoria de Qualidade em Tempo Real:**
  - 25 testes do Criador de Currículos aprovados (25/25).
  - Verificação automatizada Edge Headless via CDP em todas as rotas com zero erros de console.
`;

if (!content.includes('[4.70.0]')) {
  content = content.substring(0, markerIdx) + newEntry + '\n' + content.substring(markerIdx + 3);
  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log('✅ CHANGELOG.md atualizado para v4.70.0');
}
