const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';
const NEW_VER = '4.82.0';

const files = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

let updatedCount = 0;
for (const file of files) {
  const filePath = path.join(ROOT_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Substituir ?v=x.y.z por ?v=4.82.0
  content = content.replace(/\?v=\d+\.\d+\.\d+/g, `?v=${NEW_VER}`);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`✅ Cache busting atualizado para v=${NEW_VER} em: ${file}`);
  }
}

// Atualizar sw.js
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v\d+\.\d+\.\d+';/, `const CACHE_NAME = 'vocepodetudo-pwa-v${NEW_VER}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`✅ Service Worker CACHE_NAME atualizado para v=${NEW_VER}`);
}

// Atualizar CHANGELOG.md
const changelogPath = path.join(ROOT_DIR, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  let cl = fs.readFileSync(changelogPath, 'utf8');
  const newEntry = `## [4.82.0] - 2026-11-14

### Adicionado
- **Gráfico Interativo de Tráfego & Audiência em Tempo Real (Chart.js)**:
  - Implementado no Painel Administrativo (\`admin.html\`) na \`section-overview\` e no Modal Analítico da Home (\`index.html\`).
  - Curvas em gradiente suave com as cores institucionais do portal: Azul Marinho (\`#002776\`) para Pageviews e Verde Oficial (\`#009639\`) para Cliques em Cursos/Leads.
  - Seletores de período dinâmicos: "Hoje (24h)", "Últimos 7 Dias" e "Últimos 30 Dias".
  - Alternador de visualização instantânea: Linha/Área Suave (\`line\`) vs Colunas Comparativas (\`bar\`).
  - Indicadores de apoio integrados: Pico estimado de acessos por hora/dia, taxa de conversão CTR média, horário de maior afluência (19h-22h) e distribuição de dispositivos (78% Mobile / 22% Desktop).
  - Destruição limpa de instâncias no canvas para garantir performance e ausência de memory leaks.
- **Robustez na Expansão dos Cards de Cursos**:
  - Garantida a expansão tridimensional com elevação e exibição de ementa completa ao clicar em qualquer ponto do card em todo o catálogo.

---

`;
  if (!cl.includes('## [4.82.0]')) {
    cl = cl.replace('# Changelog\n\n', '# Changelog\n\n' + newEntry);
    fs.writeFileSync(changelogPath, cl, 'utf8');
    console.log('✅ CHANGELOG.md atualizado para v4.82.0');
  }
}

console.log(`\n🎉 Concluído! Versão atualizada para v=${NEW_VER}.`);
