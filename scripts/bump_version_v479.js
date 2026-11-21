const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');

console.log('=== ATUALIZANDO VERSÃO PARA v4.79.0 (EXPANSÃO EXCLUSIVA E POP-OUT) ===');

// 1. Atualizar sw.js
const swPath = path.join(projectDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/vocepodetudo-pwa-v4\.\d+\.\d+/g, 'vocepodetudo-pwa-v4.79.0');
fs.writeFileSync(swPath, sw, 'utf8');
console.log('✅ sw.js atualizado para v4.79.0');

// 2. Atualizar src/app.js
const appPath = path.join(projectDir, 'src', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/sw\.js\?v=[0-9.]+/g, 'sw.js?v=4.79.0');
app = app.replace(/Service Worker v[0-9.]+ registrado com sucesso/g, 'Service Worker v4.79.0 registrado com sucesso');
fs.writeFileSync(appPath, app, 'utf8');
console.log('✅ src/app.js atualizado com sw.js?v=4.79.0');

// 3. Atualizar src/curriculo.js
const currPath = path.join(projectDir, 'src', 'curriculo.js');
let curr = fs.readFileSync(currPath, 'utf8');
curr = curr.replace(/sw\.js\?v=[0-9.]+/g, 'sw.js?v=4.79.0');
fs.writeFileSync(currPath, curr, 'utf8');
console.log('✅ src/curriculo.js atualizado com sw.js?v=4.79.0');

// 4. Atualizar todos os arquivos HTML
const htmlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.html'));
let countHtml = 0;
htmlFiles.forEach(f => {
  const filePath = path.join(projectDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('4.78.0')) {
    content = content.replace(/4\.78\.0/g, '4.79.0');
    fs.writeFileSync(filePath, content, 'utf8');
    countHtml++;
  }
});
console.log(`✅ ${countHtml} arquivos HTML atualizados com cache-busting v4.79.0`);

// 5. Atualizar CHANGELOG.md
const changelogPath = path.join(projectDir, 'CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');
const newChangelogEntry = `## [4.79.0] - 2026-11-13
### 🎯 Expansão Exclusiva (Accordion Único) e Efeito Pop-Out de Elevação nos Cards

- **Isolamento de Expansão por Card (\`src/app.js\` & \`src/style.css\`):**
  - Implementação de fechamento automático: ao clicar em um card, qualquer outro card aberto na tela fecha instantaneamente, mantendo apenas 1 card ativo por vez.
  - Alinhamento de grade independente (\`align-self: start\` e \`items-start\`): impede que os cards vizinhos da mesma linha se estiquem ou deformem quando um card é aberto.
  - **Efeito Pop-Out ("Pular na Tela"):** O card ativo recebe elevação tridimensional (\`transform: translateY(-8px) scale(1.02)\`), sobreposição à frente (\`z-index: 30\`) e sombra profunda (\`shadow-2xl\`), destacando-se nitidamente do restante da página.
  - Rolagem inteligente suave para manter o card confortável no campo de visão do aluno.

---

`;

if (!changelog.includes('[4.79.0]')) {
  changelog = changelog.replace('## [4.78.0] - 2026-11-13', newChangelogEntry + '## [4.78.0] - 2026-11-13');
  fs.writeFileSync(changelogPath, changelog, 'utf8');
  console.log('✅ CHANGELOG.md atualizado para v4.79.0');
}

console.log('=== BUMP DE VERSÃO v4.79.0 CONCLUÍDO COM SUCESSO ===');
