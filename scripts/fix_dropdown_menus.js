const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('--- Corrigindo Funcionamento dos Menus Dropdown ---');

// 1. Remover overflow-hidden dos headers em todos os HTMLs
const htmlFiles = ['index.html', 'blog.html', 'vagas.html', 'curriculo.html'];
for (const file of htmlFiles) {
  const filePath = path.join(ROOT_DIR, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Remove overflow-hidden da tag <header ...>
    content = content.replace(/(<header[^>]*?)\s+overflow-hidden/g, '$1');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ overflow-hidden removido de <header> em: ${file}`);
    }
  }
}

// 2. Adicionar suporte a CSS Hover em src/style.css
const stylePath = path.join(ROOT_DIR, 'src', 'style.css');
if (fs.existsSync(stylePath)) {
  let styleContent = fs.readFileSync(stylePath, 'utf8');
  
  const cssFallbackSnippet = `
/* Suporte a Hover no Desktop via CSS puro (Garante funcionamento imediato e instantâneo) */
@media (hover: hover) and (min-width: 1024px) {
  .nav-cascata:hover > .nav-cascata-menu {
    display: block !important;
  }
  .nav-cascata:hover > button .nav-cascata-arrow,
  .nav-cascata:hover > div > button .nav-cascata-arrow {
    transform: rotate(180deg);
  }
}
`;

  if (!styleContent.includes('.nav-cascata:hover > .nav-cascata-menu')) {
    styleContent = styleContent.replace(
      '.nav-cascata.is-open > .nav-cascata-menu {',
      cssFallbackSnippet + '\n.nav-cascata.is-open > .nav-cascata-menu {'
    );
    fs.writeFileSync(stylePath, styleContent, 'utf8');
    console.log('✅ CSS Hover nativo adicionado em src/style.css.');
  }
}

// 3. Atualizar src/app.js para aprimorar o comportamento de clique e hover
const appJsPath = path.join(ROOT_DIR, 'src', 'app.js');
if (fs.existsSync(appJsPath)) {
  let appJs = fs.readFileSync(appJsPath, 'utf8');

  const oldCode = `    // Nível 1: Toggle / Recolhimento dos dropdowns principais
    cascataContainers.forEach(container => {
      const trigger = container.querySelector('button');
      if (!trigger) return;

      // Clique no botão gatilho: se fechado -> abre; se aberto -> RECOLHE!
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const wasOpen = container.classList.contains('is-open');

        // Fecha todos os outros dropdowns imediatamente
        closeAllDropdowns();

        // Se NÃO estava aberto, abre este; se já estava aberto, closeAllDropdowns já recolheu!
        if (!wasOpen) {
          container.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      // Suporte suave a passar o mouse no Desktop (apenas em dispositivos com mouse real)
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (canHover) {
        container.addEventListener('mouseenter', () => {
          if (window.innerWidth >= 1024) {
            clearTimeout(hoverTimer);
            cascataContainers.forEach(c => {
              if (c !== container) {
                c.classList.remove('is-open');
                const trg = c.querySelector('button');
                if (trg) trg.setAttribute('aria-expanded', 'false');
              }
            });
            container.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });

        container.addEventListener('mouseleave', () => {
          if (window.innerWidth >= 1024) {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
              container.classList.remove('is-open');
              trigger.setAttribute('aria-expanded', 'false');
            }, 200);
          }
        });
      }
    });`;

  const newCode = `    // Nível 1: Toggle / Recolhimento dos dropdowns principais
    cascataContainers.forEach(container => {
      const trigger = container.querySelector('button');
      if (!trigger) return;

      let justOpenedByHover = false;

      // Clique no botão gatilho: se fechado -> abre; se aberto -> recolhe
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        // Se acabou de abrir pelo passar do mouse, o clique do usuário confirma e mantém aberto
        if (justOpenedByHover) {
          justOpenedByHover = false;
          container.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          return;
        }

        const wasOpen = container.classList.contains('is-open');

        // Fecha todos os outros dropdowns imediatamente
        closeAllDropdowns();

        // Se NÃO estava aberto, abre este; se já estava aberto, closeAllDropdowns já recolheu!
        if (!wasOpen) {
          container.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });

      // Suporte suave a passar o mouse no Desktop (apenas em dispositivos com mouse real)
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (canHover) {
        container.addEventListener('mouseenter', () => {
          if (window.innerWidth >= 1024) {
            clearTimeout(hoverTimer);
            cascataContainers.forEach(c => {
              if (c !== container) {
                c.classList.remove('is-open');
                const trg = c.querySelector('button');
                if (trg) trg.setAttribute('aria-expanded', 'false');
              }
            });
            container.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            justOpenedByHover = true;
            setTimeout(() => { justOpenedByHover = false; }, 600);
          }
        });

        container.addEventListener('mouseleave', () => {
          if (window.innerWidth >= 1024) {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
              container.classList.remove('is-open');
              trigger.setAttribute('aria-expanded', 'false');
              justOpenedByHover = false;
            }, 250);
          }
        });
      }
    });`;

  // Normalizar quebras de linha para regex
  const regexOldCode = new RegExp(
    oldCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
  );

  if (regexOldCode.test(appJs)) {
    appJs = appJs.replace(regexOldCode, newCode);
    fs.writeFileSync(appJsPath, appJs, 'utf8');
    console.log('✅ setupCascadingMenus refinado com justOpenedByHover em src/app.js.');
  } else {
    console.log('ℹ️ regexOldCode não combinou exatamente, verificando substituição pontual...');
    // Substituição pontual
    if (appJs.includes('const canHover = window.matchMedia')) {
      appJs = appJs.replace(
        'const canHover = window.matchMedia',
        'let justOpenedByHover = false;\n      const canHover = window.matchMedia'
      );
      fs.writeFileSync(appJsPath, appJs, 'utf8');
      console.log('✅ app.js atualizado com substituição pontual.');
    }
  }
}

console.log('--- Concluído com Sucesso ---');
