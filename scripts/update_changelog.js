const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let content = fs.readFileSync(changelogPath, 'utf8');

const target = '## [4.14.0]';
const newEntry = `## [4.31.0] - 2026-10-31
### 📅 Central Editorial do Blog: 30 Novos Artigos Agendados & Publicação Automática

- **Agenda Editorial de 30 Dias (Novembro/2026):**
  - Implementação de 30 novos artigos completos (IDs 8 a 37), totalizando 37 artigos cadastrados.
  - Estrutura padrão *"Aprenda de Graça"* em todos os posts: o que é a profissão/habilidade, demanda e remuneração média de mercado em 2026, conhecimentos exigidos, onde estudar gratuitamente em órgãos oficiais e trilha passo a passo.
  - CTAs internos integrados direcionando para o Criador de Currículos ATS, Mural de Vagas, Calculadora de Aprendiz e Cursos Gratuitos.
- **Sistema de Agendamento Automático de Posts:**
  - \`api/blog.php\`: Suporte a liberação programada por data (\`created_at <= NOW()\`). Artigos com data futura ficam restritos aos administradores e tornam-se públicos automaticamente na data agendada.
  - \`src/blog.js\`: Fallback no cliente que respeita o agendamento temporal.
- **Painel Administrativo (\`admin.html\` & \`src/admin.js\`):**
  - Identificação de status para artigos agendados com badge \`Agendado (DD/MM)\` e novo filtro no seletor de status.

---

`;

if (!content.includes('[4.31.0]')) {
  content = content.replace(target, newEntry + target);
  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log('CHANGELOG.md atualizado com sucesso!');
} else {
  console.log('CHANGELOG.md já possui a versão 4.31.0');
}
