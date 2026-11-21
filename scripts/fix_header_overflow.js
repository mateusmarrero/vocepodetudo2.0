const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEW_VER = '4.57.0';

console.log('🔧 Iniciando correção definitiva de overflow no cabeçalho e barra do topo...');

// 1. Ajustar index.html
const indexPath = path.join(ROOT_DIR, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// A. Blindagem no HTML e BODY
indexHtml = indexHtml.replace(
  /<html lang="pt-BR" class="scroll-smooth">/,
  '<html lang="pt-BR" class="scroll-smooth overflow-x-hidden">'
);

indexHtml = indexHtml.replace(
  /<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased selection:bg-\[#ffcc29\] selection:text-slate-900">/,
  '<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased selection:bg-[#ffcc29] selection:text-slate-900 overflow-x-hidden w-full max-w-full">'
);

// B. Top Utility Bar
const oldTopBar = `<aside id="top-utility-bar" aria-label="Informações do Dia, Clima e Notícias" class="bg-gradient-to-r from-[#005e24] via-[#008031] to-[#005e24] text-white border-b-2 border-[#ffcc29] text-xs py-2 px-3 sm:px-4 select-none relative z-30 shadow-sm transition-colors">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">`;

const newTopBar = `<aside id="top-utility-bar" aria-label="Informações do Dia, Clima e Notícias" class="bg-gradient-to-r from-[#005e24] via-[#008031] to-[#005e24] text-white border-b-2 border-[#ffcc29] text-xs py-1.5 sm:py-2 px-3 sm:px-4 select-none relative z-30 shadow-sm transition-colors overflow-hidden w-full max-w-full">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 overflow-hidden w-full min-w-0">`;

if (indexHtml.includes(oldTopBar)) {
  indexHtml = indexHtml.replace(oldTopBar, newTopBar);
  console.log('✅ Top bar container atualizado em index.html (LF)');
} else if (indexHtml.includes(oldTopBar.replace(/\n/g, '\r\n'))) {
  indexHtml = indexHtml.replace(oldTopBar.replace(/\n/g, '\r\n'), newTopBar.replace(/\n/g, '\r\n'));
  console.log('✅ Top bar container atualizado em index.html (CRLF)');
}

// C. Acessibilidade na Top Bar (ocultar texto no mobile para caber em 1 linha)
const oldAccBtn = `<button 
          id="top-bar-accessibility-btn"
          type="button"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/40 text-white hover:text-[#ffdf00] border border-white/20 transition-all text-[11px] font-bold cursor-pointer shadow-sm active:scale-95"
          title="Opções de Acessibilidade Visual (Alto Contraste, Fontes e Leitor de Tela)"
          aria-label="Abrir menu de acessibilidade visual"
        >
          <i data-lucide="eye" class="w-3.5 h-3.5 text-[#ffdf00]"></i>
          <span>Acessibilidade</span>
        </button>`;

const newAccBtn = `<button 
          id="top-bar-accessibility-btn"
          type="button"
          class="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/40 text-white hover:text-[#ffdf00] border border-white/20 transition-all text-[11px] font-bold cursor-pointer shadow-sm active:scale-95"
          title="Opções de Acessibilidade Visual (Alto Contraste, Fontes e Leitor de Tela)"
          aria-label="Abrir menu de acessibilidade visual"
        >
          <i data-lucide="eye" class="w-3.5 h-3.5 text-[#ffdf00]"></i>
          <span class="hidden sm:inline">Acessibilidade</span>
        </button>`;

if (indexHtml.includes(oldAccBtn)) {
  indexHtml = indexHtml.replace(oldAccBtn, newAccBtn);
  console.log('✅ Botão de acessibilidade atualizado em index.html (LF)');
} else if (indexHtml.includes(oldAccBtn.replace(/\n/g, '\r\n'))) {
  indexHtml = indexHtml.replace(oldAccBtn.replace(/\n/g, '\r\n'), newAccBtn.replace(/\n/g, '\r\n'));
  console.log('✅ Botão de acessibilidade atualizado em index.html (CRLF)');
}

// D. Header Tag e inner container
indexHtml = indexHtml.replace(
  '<header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#009639] shadow-xs">',
  '<header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#009639] shadow-xs w-full max-w-full overflow-hidden">'
);

indexHtml = indexHtml.replace(
  '<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 md:py-0 md:h-14 flex items-center justify-between gap-2 lg:gap-4">',
  '<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 md:py-0 md:h-14 flex items-center justify-between gap-2 lg:gap-4 w-full min-w-0">'
);

// E. Botões do Header Direito (tornar responsivos no mobile para não estourar)
// nav-btn-curriculo: ocultar no mobile (hidden sm:inline-flex)
indexHtml = indexHtml.replace(
  'id="nav-btn-curriculo"\n          class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-[#009B3A]',
  'id="nav-btn-curriculo"\n          class="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-[#009B3A]'
);
indexHtml = indexHtml.replace(
  'id="nav-btn-curriculo"\r\n          class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-[#009B3A]',
  'id="nav-btn-curriculo"\r\n          class="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-[#009B3A]'
);

// nav-btn-jobs: ocultar no mobile/tablet pequeno (hidden md:inline-flex)
indexHtml = indexHtml.replace(
  'id="nav-btn-jobs"\n          class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-white bg-[#002776]',
  'id="nav-btn-jobs"\n          class="hidden md:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-white bg-[#002776]'
);
indexHtml = indexHtml.replace(
  'id="nav-btn-jobs"\r\n          class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-white bg-[#002776]',
  'id="nav-btn-jobs"\r\n          class="hidden md:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-white bg-[#002776]'
);

// nav-btn-blog: ocultar no mobile/tablet (hidden xl:inline-flex)
indexHtml = indexHtml.replace(
  'id="nav-btn-blog"\n          class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-[#00471b]',
  'id="nav-btn-blog"\n          class="hidden xl:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-[#00471b]'
);
indexHtml = indexHtml.replace(
  'id="nav-btn-blog"\r\n          class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-[#00471b]',
  'id="nav-btn-blog"\r\n          class="hidden xl:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black text-[#00471b]'
);

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✅ index.html modificado com sucesso!');

// 2. Ajustar vagas.html
const vagasPath = path.join(ROOT_DIR, 'vagas.html');
if (fs.existsSync(vagasPath)) {
  let vagasHtml = fs.readFileSync(vagasPath, 'utf8');
  vagasHtml = vagasHtml.replace(
    '<header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-4 border-[#002776] shadow-sm transition-colors">',
    '<header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-4 border-[#002776] shadow-sm transition-colors w-full max-w-full overflow-hidden">'
  );
  vagasHtml = vagasHtml.replace(
    'href="vagas.html" \n          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#002776]',
    'href="vagas.html" \n          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#002776]'
  );
  vagasHtml = vagasHtml.replace(
    'href="vagas.html" \r\n          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#002776]',
    'href="vagas.html" \r\n          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#002776]'
  );
  fs.writeFileSync(vagasPath, vagasHtml, 'utf8');
  console.log('✅ vagas.html modificado com sucesso!');
}

// 3. Ajustar blog.html
const blogPath = path.join(ROOT_DIR, 'blog.html');
if (fs.existsSync(blogPath)) {
  let blogHtml = fs.readFileSync(blogPath, 'utf8');
  blogHtml = blogHtml.replace(
    '<header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-4 border-[#009639] shadow-sm transition-colors">',
    '<header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-4 border-[#009639] shadow-sm transition-colors w-full max-w-full overflow-hidden">'
  );
  blogHtml = blogHtml.replace(
    'href="blog.html" \n          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#005e24]',
    'href="blog.html" \n          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#005e24]'
  );
  blogHtml = blogHtml.replace(
    'href="blog.html" \r\n          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#005e24]',
    'href="blog.html" \r\n          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#005e24]'
  );
  fs.writeFileSync(blogPath, blogHtml, 'utf8');
  console.log('✅ blog.html modificado com sucesso!');
}

// 4. Bump Cache-Busting Global para v4.57.0
console.log(`\n🚀 Atualizando versioning para v=${NEW_VER} em todos os arquivos HTML...`);
const allHtmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
allHtmlFiles.forEach(file => {
  const p = path.join(ROOT_DIR, file);
  let html = fs.readFileSync(p, 'utf8');
  html = html.replace(/\?v=\d+\.\d+\.\d+/g, `?v=${NEW_VER}`);
  fs.writeFileSync(p, html, 'utf8');
});
console.log(`✅ ${allHtmlFiles.length} arquivos HTML atualizados com ?v=${NEW_VER}`);

// 5. Atualizar sw.js
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v\d+\.\d+\.\d+';/, `const CACHE_NAME = 'vocepodetudo-pwa-v${NEW_VER}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`✅ sw.js atualizado para CACHE_NAME v=${NEW_VER}`);
}

console.log('\n✨ Concluído com sucesso!');
