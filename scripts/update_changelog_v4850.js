const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let content = fs.readFileSync(changelogPath, 'utf8');

const entry = `## [4.85.0] - 2026-11-14
### 📄 Opções de Download da Lista de Itens do Blog para Controle Interno

- **Central Editorial do Blog (\`admin.html\`, \`src/admin.js\` & \`api/blog.php\`):**
  - **Novo Botão de Destaque na Barra Superior**: \`Baixar Lista (Controle Interno)\` com ícone de download e menu expansível de opções imediatas.
  - **Planilha Excel / Sheets (.CSV)**:
    - Download de todos os 144 artigos com ID, número sequencial, título, slug, categoria, status editorial (No Ar / Agendado / Rascunho), data de agendamento, tempo de leitura, visualizações, autor, palavras-chave/tags, resumo e URL oficial.
    - Sanitização integral contra injeção de fórmulas e delimitador ponto-e-vírgula com BOM UTF-8 para abertura perfeita no Excel.
  - **Documento de Texto (.TXT Formatado para Controle Interno)**:
    - Geração de relatório tabulado e limpo em texto puro, ideal para leitura offline, impressões e controle interno de pautas e redação.
    - Cabeçalho timbrado com data de emissão, contagem de itens, fichamento por artigo com links e resumos.
  - **Botões Rápidos na Tabela**:
    - Inclusão dos botões diretos \`Baixar CSV\` e \`Baixar TXT\` na barra de filtros da tabela de artigos.
  - **Endpoint de Servidor (\`api/blog.php?action=export_txt\`)**:
    - Suporte nativo para download direto do relatório em texto formatado pelo backend.

---

`;

if (!content.includes('## [4.85.0]')) {
  content = content.replace('## [4.84.0]', entry + '## [4.84.0]');
  fs.writeFileSync(changelogPath, content, 'utf8');
  console.log('✅ CHANGELOG.md atualizado com sucesso para v4.85.0!');
} else {
  console.log('ℹ️ CHANGELOG.md já contém a versão v4.85.0.');
}
