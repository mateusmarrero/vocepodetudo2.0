const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');

console.log('=== ATUALIZANDO VERSÃO PARA v4.78.0 (LAYOUT COMPACTO DE CARDS) ===');

// 1. Atualizar sw.js
const swPath = path.join(projectDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/vocepodetudo-pwa-v4\.\d+\.\d+/g, 'vocepodetudo-pwa-v4.78.0');
fs.writeFileSync(swPath, sw, 'utf8');
console.log('✅ sw.js atualizado para v4.78.0');

// 2. Atualizar src/app.js
const appPath = path.join(projectDir, 'src', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/sw\.js\?v=[0-9.]+/g, 'sw.js?v=4.78.0');
app = app.replace(/Service Worker v[0-9.]+ registrado com sucesso/g, 'Service Worker v4.78.0 registrado com sucesso');
fs.writeFileSync(appPath, app, 'utf8');
console.log('✅ src/app.js atualizado com sw.js?v=4.78.0');

// 3. Atualizar src/curriculo.js
const currPath = path.join(projectDir, 'src', 'curriculo.js');
let curr = fs.readFileSync(currPath, 'utf8');
curr = curr.replace(/sw\.js\?v=[0-9.]+/g, 'sw.js?v=4.78.0');
fs.writeFileSync(currPath, curr, 'utf8');
console.log('✅ src/curriculo.js atualizado com sw.js?v=4.78.0');

// 4. Atualizar todos os arquivos HTML
const htmlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.html'));
let countHtml = 0;
htmlFiles.forEach(f => {
  const filePath = path.join(projectDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('4.77.0')) {
    content = content.replace(/4\.77\.0/g, '4.78.0');
    fs.writeFileSync(filePath, content, 'utf8');
    countHtml++;
  }
});
console.log(`✅ ${countHtml} arquivos HTML atualizados com cache-busting v4.78.0`);

// 5. Atualizar CHANGELOG.md
const changelogPath = path.join(projectDir, 'CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');
const newChangelogEntry = `## [4.78.0] - 2026-11-13
### ⚡ Layout Super Compacto e Minimalista dos Cards Expandidos de Cursos

- **Redimensionamento Enxuto da Ementa e Detalhes (\`src/data/course_details.js\` & \`src/style.css\`):**
  - Substituição das 5 seções extensas por um bloco compacto e objetivo de altura reduzida (~140px a 180px).
  - **Ementa Programática Direta:** Lista condensada de 3 a 4 tópicos essenciais em linhas únicas com badge numérico.
  - **Grid de Informações Chave 2x2:** 4 mini cards elegantes destacando Certificado Gratuito, Critério de Avaliação, Pré-requisito e Metodologia Online.
  - **Ações de Rodapé Compactas:** Barra única simplificada com botão de inscrição e botão de recolher discreto, sem botões duplicados.
  - Redução do limite de expansão de 5000px para 420px com scroll suave, mantendo o alinhamento e a proporção da vitrine de cursos.

---

`;

if (!changelog.includes('[4.78.0]')) {
  changelog = changelog.replace('## [4.77.0] - 2026-11-13', newChangelogEntry + '## [4.77.0] - 2026-11-13');
  fs.writeFileSync(changelogPath, changelog, 'utf8');
  console.log('✅ CHANGELOG.md atualizado para v4.78.0');
}

console.log('=== BUMP DE VERSÃO v4.78.0 CONCLUÍDO COM SUCESSO ===');
