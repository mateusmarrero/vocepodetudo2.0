const fs = require('fs');
const path = require('path');

const appJsPath = path.resolve(__dirname, '../src/app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Localizar a função createCourseCardHtml
const targetStart = '  function createCourseCardHtml(course) {';
const targetEnd = '    return `\n      <article \n        class="course-card';

if (!content.includes(targetStart)) {
  console.error('Target function not found!');
  process.exit(1);
}

// Substituir o bloco inicial e o retorno do card
const oldBlock = `  function createCourseCardHtml(course) {
    const isFav = state.favorites.has(course.id);
    const isExpanded = state.expandedCourses && state.expandedCourses.has(course.id);
    const iconInfo = getCourseIconInfo(course);
    const safeTitle = escapeHTML(course.title);
    const safeDesc = escapeHTML(course.description);
    const safeProvider = escapeHTML(course.provider);
    const safeTag = escapeHTML(course.providerTag || course.provider);
    const safeUrl = sanitizeUrl(course.url);`;

const newBlock = `  function createCourseCardHtml(course) {
    const isFav = state.favorites.has(course.id);
    const isExpanded = state.expandedCourses && state.expandedCourses.has(course.id);
    const iconInfo = getCourseIconInfo(course);
    const safeTitle = escapeHTML(course.title);
    const safeDesc = escapeHTML(course.description);
    const safeProvider = escapeHTML(course.provider);
    const safeTag = escapeHTML(course.providerTag || course.provider);
    const safeUrl = sanitizeUrl(course.url);
    const coursePageUrl = \`/curso/\${encodeURIComponent(course.id)}\`;
    const courseCoverImg = escapeHTML(course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80');`;

// Substituir a parte superior do card para incluir a imagem de capa e links
const oldCardArticle = `      <article 
        class="course-card animate-fade-in-up flex flex-col justify-between bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-[#009639] hover:-translate-y-1 transition-all duration-200 relative group cursor-pointer \${isExpanded ? 'is-expanded' : ''}" 
        aria-label="\${safeTitle}"
        data-course-id="\${escapeHTML(course.id)}"
        tabindex="0"
        role="region"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-xl \${iconInfo.bg} border \${iconInfo.border} \${iconInfo.text} flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform" title="\${escapeHTML(course.categoryName || course.category || 'Curso Oficial')}">
                <i data-lucide="\${iconInfo.icon}" class="w-4.5 h-4.5"></i>
              </div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border-2 \${course.providerColor || 'bg-slate-100 text-slate-800 border-slate-300'} truncate">
                \${safeTag}
              </span>
            </div>
            
            <div class="flex items-center gap-1 flex-shrink-0">
              <button 
                data-speak-title="\${safeTitle}"
                data-speak-provider="\${safeProvider}"
                data-speak-workload="\${course.workloadHours}"
                data-speak-desc="\${safeDesc}"
                class="speak-course-btn p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                title="Ouvir em voz alta os dados deste curso"
                aria-label="Ouvir descrição de \${safeTitle} em voz alta"
              >
                <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
              </button>

              <button 
                data-course-id="\${escapeHTML(course.id)}"
                class="fav-btn p-1.5 rounded-lg border transition-colors \${
                  isFav 
                    ? 'text-rose-600 bg-rose-50 border-rose-200' 
                    : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-rose-600 hover:bg-rose-50'
                }"
                title="\${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
                aria-label="\${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
              >
                <i data-lucide="heart" class="w-3.5 h-3.5 \${isFav ? 'fill-current' : ''}"></i>
              </button>
            </div>
          </div>

          <h3 class="text-base font-black text-slate-900 leading-snug mb-1.5 group-hover:text-[#009639] transition-colors">
            \${safeTitle}
          </h3>`;

const newCardArticle = `      <article 
        class="course-card animate-fade-in-up flex flex-col justify-between bg-white border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-[#009639] hover:-translate-y-1 transition-all duration-200 relative group cursor-pointer \${isExpanded ? 'is-expanded' : ''}" 
        aria-label="\${safeTitle}"
        data-course-id="\${escapeHTML(course.id)}"
        tabindex="0"
        role="region"
      >
        <div>
          <!-- Capa do Curso com Imagem em Alta Resolução & Lazy Loading -->
          <a href="\${coursePageUrl}" class="block relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3.5 border border-slate-200 shadow-2xs group-hover:shadow-md transition-all cursor-pointer" title="Ver página e ementa do curso \${safeTitle}">
            <img 
              src="\${courseCoverImg}" 
              alt="\${safeTitle}" 
              loading="lazy" 
              decoding="async" 
              width="600" 
              height="338" 
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
            <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
              <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black border \${course.providerColor || 'bg-white/95 text-slate-800 border-slate-300'} shadow-xs">
                \${safeTag}
              </span>
            </div>
            <div class="absolute bottom-2.5 right-2.5">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-white shadow-xs">
                <i data-lucide="clock" class="w-3 h-3 text-emerald-400"></i>
                \${course.workloadHours}h
              </span>
            </div>
          </a>

          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                \${escapeHTML(course.categoryName || course.category || 'Curso Oficial')}
              </span>
            </div>
            
            <div class="flex items-center gap-1 flex-shrink-0">
              <button 
                data-speak-title="\${safeTitle}"
                data-speak-provider="\${safeProvider}"
                data-speak-workload="\${course.workloadHours}"
                data-speak-desc="\${safeDesc}"
                class="speak-course-btn p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                title="Ouvir em voz alta os dados deste curso"
                aria-label="Ouvir descrição de \${safeTitle} em voz alta"
              >
                <i data-lucide="volume-2" class="w-3.5 h-3.5"></i>
              </button>

              <button 
                data-course-id="\${escapeHTML(course.id)}"
                class="fav-btn p-1.5 rounded-lg border transition-colors \${
                  isFav 
                    ? 'text-rose-600 bg-rose-50 border-rose-200' 
                    : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-rose-600 hover:bg-rose-50'
                }"
                title="\${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
                aria-label="\${isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}"
              >
                <i data-lucide="heart" class="w-3.5 h-3.5 \${isFav ? 'fill-current' : ''}"></i>
              </button>
            </div>
          </div>

          <h3 class="text-base font-black text-slate-900 leading-snug mb-1.5 group-hover:text-[#009639] transition-colors">
            <a href="\${coursePageUrl}" class="hover:underline">
              \${safeTitle}
            </a>
          </h3>`;

// Também atualizar os botões de ação para ter o link para a página própria do curso
const oldActions = `          <div class="flex items-center gap-1.5">
            <a 
              href="\${safeUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="course-access-link flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#009639] via-[#008031] to-[#005e24] hover:from-[#008031] hover:to-[#00471b] text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all truncate group/btn"
              data-course-id="\${course.id}"
              data-course-title="\${safeTitle}"
              data-course-provider="\${safeProvider}"
              data-course-category="\${escapeHTML(course.category || 'Geral')}"
              aria-label="Acessar página oficial do curso \${safeTitle} (abre em nova aba)"
            >
              <span>Acessar Curso Oficial</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 flex-shrink-0 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"></i>
            </a>

            <!-- Compartilhar direto no WhatsApp -->`;

const newActions = `          <div class="flex items-center gap-1.5">
            <a 
              href="\${safeUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="course-access-link flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#009639] via-[#008031] to-[#005e24] hover:from-[#008031] hover:to-[#00471b] text-white shadow-md shadow-emerald-700/20 active:scale-95 transition-all truncate group/btn"
              data-course-id="\${course.id}"
              data-course-title="\${safeTitle}"
              data-course-provider="\${safeProvider}"
              data-course-category="\${escapeHTML(course.category || 'Geral')}"
              aria-label="Acessar página oficial do curso \${safeTitle} (abre em nova aba)"
            >
              <span>Acessar Curso</span>
              <i data-lucide="external-link" class="w-3.5 h-3.5 flex-shrink-0 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"></i>
            </a>

            <!-- Link direto para a página exclusiva de SEO do Curso -->
            <a 
              href="\${coursePageUrl}"
              class="p-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors flex-shrink-0"
              title="Página detalhada do curso com ementa e certificado"
              aria-label="Página do curso \${safeTitle}"
            >
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            </a>

            <!-- Compartilhar direto no WhatsApp -->`;

// Normalizar line endings
const norm = (s) => s.replace(/\r\n/g, '\n');

let normContent = norm(content);
const normOldBlock = norm(oldBlock);
const normNewBlock = norm(newBlock);
const normOldCardArticle = norm(oldCardArticle);
const normNewCardArticle = norm(newCardArticle);
const normOldActions = norm(oldActions);
const normNewActions = norm(newActions);

if (normContent.includes(normOldBlock)) {
  normContent = normContent.replace(normOldBlock, normNewBlock);
  console.log('✅ Bloco de inicialização de variáveis atualizado.');
} else {
  console.warn('⚠️ Bloco de inicialização não encontrado exatamente.');
}

if (normContent.includes(normOldCardArticle)) {
  normContent = normContent.replace(normOldCardArticle, normNewCardArticle);
  console.log('✅ Capa do curso e cabeçalho atualizados.');
} else {
  console.warn('⚠️ Artigo do card não encontrado exatamente.');
}

if (normContent.includes(normOldActions)) {
  normContent = normContent.replace(normOldActions, normNewActions);
  console.log('✅ Botões de ação do card atualizados.');
} else {
  console.warn('⚠️ Ações do card não encontradas exatamente.');
}

fs.writeFileSync(appJsPath, normContent, 'utf8');
console.log('src/app.js gravado com sucesso.');
