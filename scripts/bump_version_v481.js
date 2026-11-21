const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');

console.log('=== ATUALIZANDO VERSÃO PARA v4.81.0 (PROPOSTAS DE ALUGUEL & GERADOR COMERCIAL) ===');

// 1. Atualizar sw.js
const swPath = path.join(projectDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/vocepodetudo-pwa-v4\.\d+\.\d+/g, 'vocepodetudo-pwa-v4.81.0');
fs.writeFileSync(swPath, sw, 'utf8');
console.log('✅ sw.js atualizado para v4.81.0');

// 2. Atualizar src/app.js
const appPath = path.join(projectDir, 'src', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/sw\.js\?v=[0-9.]+/g, 'sw.js?v=4.81.0');
app = app.replace(/Service Worker v[0-9.]+ registrado com sucesso/g, 'Service Worker v4.81.0 registrado com sucesso');
fs.writeFileSync(appPath, app, 'utf8');
console.log('✅ src/app.js atualizado com sw.js?v=4.81.0');

// 3. Atualizar src/curriculo.js
const currPath = path.join(projectDir, 'src', 'curriculo.js');
let curr = fs.readFileSync(currPath, 'utf8');
curr = curr.replace(/sw\.js\?v=[0-9.]+/g, 'sw.js?v=4.81.0');
fs.writeFileSync(currPath, curr, 'utf8');
console.log('✅ src/curriculo.js atualizado com sw.js?v=4.81.0');

// 4. Atualizar todos os arquivos HTML
const htmlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.html'));
let countHtml = 0;
htmlFiles.forEach(f => {
  const filePath = path.join(projectDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('4.80.0')) {
    content = content.replace(/4\.80\.0/g, '4.81.0');
    fs.writeFileSync(filePath, content, 'utf8');
    countHtml++;
  }
});
console.log(`✅ ${countHtml} arquivos HTML atualizados com cache-busting v4.81.0`);

// 5. Atualizar CHANGELOG.md
const changelogPath = path.join(projectDir, 'CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');
const newChangelogEntry = `## [4.81.0] - 2026-11-14
### 💼 Tabela de Aluguel de Espaços de Propaganda & Gerador Rápido de Proposta Comercial

- **Tabela Comercial de Aluguel de Espaços de Propaganda (\`midia-kit.html\` e \`admin.html\`):**
  - Implementação idêntica ao modelo do guia de sobrevivência, apresentando valores claros de locação mensal, trimestral, semestral e anual.
  - **Cards Estratégicos com Valores & Especificações:**
    - Banner Super Leaderboard Topo (728x90 / 320x100) — **R$ 850,00/mês** (*Disponível*)
    - Card Patrocinado Nativo In-Feed (Grade de Cursos & Mural de Vagas) — **R$ 650,00/mês** (*Mais Escolhido / CTR até 5,2%*)
    - Half-Page Lateral Sticky no Blog (300x600) — **R$ 750,00/mês** (*Disponível / 45s de retenção*)
    - Naming Rights Oficial do Criador de Currículos (Logo no Topo + Selo no PDF) — **R$ 1.500,00/mês** (*Exclusivo*)
    - Patrocínio do Simulador de Entrevistas com IA — **R$ 1.200,00/mês** (*Inovação*)
    - Publieditorial Assinado com Link Dofollow Permanente — **R$ 1.250,00 (único)** (*Recomendado / SEO vitalício*)
  - Descontos contratuais automáticos: Trimestral (10% OFF), Semestral (15% OFF) e Anual (25% OFF).

- **Gerador Dinâmico e Interativo de Proposta Comercial (\`#gerador-proposta-card\`):**
  - Formulário para inserção do Nome da Empresa / Marca, Contato e Telefone/WhatsApp.
  - Seleção dinâmica por checkboxes de todos os 9 formatos disponíveis, com cálculo automático em tempo real do investimento total.
  - Campo de desconto especial adicional (%).
  - Caixa de pré-visualização da **Proposta Comercial Oficial** em texto formatado para envio direto, com saudação personalizada, entregáveis, condições de pagamento (Pix/Boleto com NF) e validade.
  - Botão **"Copiar Proposta"** para transferência imediata e botão **"Abrir WhatsApp Pronto"** com a proposta já codificada para envio via WhatsApp Web/App.
  - Botão **"Copiar Pitch Rápido"** no cabeçalho e na barra de ações administrativa.

---

`;

if (!changelog.includes('[4.81.0]')) {
  changelog = changelog.replace('## [4.80.0] - 2026-11-14', newChangelogEntry + '## [4.80.0] - 2026-11-14');
  fs.writeFileSync(changelogPath, changelog, 'utf8');
  console.log('✅ CHANGELOG.md atualizado para v4.81.0');
}

console.log('=== BUMP DE VERSÃO v4.81.0 CONCLUÍDO COM SUCESSO ===');
