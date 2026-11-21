const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'src', 'app.js');
let js = fs.readFileSync(appJsPath, 'utf8');

// Normalizar temporariamente CRLF para LF para replace
const isCRLF = js.includes('\r\n');
if (isCRLF) {
  js = js.replace(/\r\n/g, '\n');
}

// 1. Função helper para card In-Feed AdSense
const inFeedAdFunction = `
  function createInFeedCourseAdHtml(index) {
    return \`
      <div class="course-card course-ad-card bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 flex flex-col justify-between items-center text-center overflow-hidden min-h-[340px] transition-all hover:shadow-md">
        <div class="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          <span>Parceiro Educacional</span>
          <span class="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-black">Patrocinado</span>
        </div>
        <div class="w-full flex-1 flex flex-col items-center justify-center py-2 overflow-hidden">
          <ins class="adsbygoogle"
               style="display:block; text-align:center; min-width:250px; min-height:200px;"
               data-ad-layout="in-article"
               data-ad-format="fluid"
               data-ad-client="ca-pub-9923838612147321"
               data-ad-slot="1234567890"></ins>
          <div class="ad-fallback text-xs text-slate-500 dark:text-slate-400 font-semibold mt-3 max-w-xs">
            Apoie o portal gratuito Você Pode Tudo conhecendo os cursos recomendados por nossos parceiros!
          </div>
        </div>
        <div class="w-full pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-center gap-2">
          <a href="curriculo.html" class="inline-flex items-center gap-1 text-xs font-black text-[#002776] dark:text-blue-400 hover:underline">
            <i data-lucide="award" class="w-3.5 h-3.5"></i>
            <span>Destaque seu currículo hoje</span>
          </a>
        </div>
      </div>
    \`;
  }
`;

// Injetar função helper antes de renderCourses se ainda não tiver
if (!js.includes('createInFeedCourseAdHtml')) {
  const renderStart = 'function renderCourses(resetPagination = true) {';
  const renderIdx = js.indexOf(renderStart);
  if (renderIdx === -1) {
    console.error('renderCourses não encontrado');
    process.exit(1);
  }
  js = js.substring(0, renderIdx) + inFeedAdFunction + '\n' + js.substring(renderIdx);
  console.log('✅ Função createInFeedCourseAdHtml injetada');
}

// Substituir loop
const targetLoop = `visibleCourses.forEach((course) => {
      cardsHtml.push(createCourseCardHtml(course));
    });`;

const replacementLoop = `visibleCourses.forEach((course, index) => {
      cardsHtml.push(createCourseCardHtml(course));
      // Inserir anúncio AdSense a cada 6 cursos quando não estiver no modo de favoritos
      if (state.viewMode !== 'favorites' && (index + 1) % 6 === 0 && (index + 1) < visibleCourses.length) {
        cardsHtml.push(createInFeedCourseAdHtml((index + 1) / 6));
      }
    });`;

if (js.includes(targetLoop)) {
  js = js.replace(targetLoop, replacementLoop);
  console.log('✅ Loop de renderização dos cards atualizado com anúncios');
} else {
  console.log('Target loop já pode estar modificado ou não encontrado.');
}

// Adicionar disparo adsbygoogle.push
const attachTarget = `attachCourseCardListeners(grid);`;
const attachReplacement = `attachCourseCardListeners(grid);

    try {
      const ads = grid.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
      ads.forEach(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    } catch (_) {}`;

if (js.includes(attachTarget) && !js.includes('.adsbygoogle:not([data-adsbygoogle-status])')) {
  js = js.replace(attachTarget, attachReplacement);
  console.log('✅ adsbygoogle.push adicionado');
}

if (isCRLF) {
  js = js.replace(/\n/g, '\r\n');
}

fs.writeFileSync(appJsPath, js, 'utf8');
console.log('src/app.js atualizado com sucesso.');
