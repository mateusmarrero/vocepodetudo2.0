const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const indexPath = path.join(dir, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');

console.log('=== 1. RESTAURANDO OS SCRIPTS NO FINAL DE INDEX.HTML ===');
// Remover o comentário vazio <!-- Modal de Detalhes da Vaga (Fase 2) --> se existir
index = index.replace('<!-- Modal de Detalhes da Vaga (Fase 2) -->', '');

const scriptTags = `
  <!-- Carregamento dos Scripts da Aplicação (com Cache-Busting v=4.65.0) -->
  <script src="./src/data/courses.js?v=4.65.0"></script>
  <script src="./src/data/career_quiz.js?v=4.65.0"></script>
  <script src="./src/app.js?v=4.65.0"></script>
</body>`;

if (!index.includes('src/app.js')) {
  index = index.replace('</body>', scriptTags);
  console.log('✅ Scripts courses.js, career_quiz.js e app.js restaurados antes de </body>!');
}

console.log('=== 2. ATUALIZANDO CARDS DO TOPO (CURRÍCULO + MURAL DE VAGAS JUNTOS E COMPACTOS) ===');
// Localizar a seção de cards no topo (acima dos cursos)
const topSectionRegex = /<!-- Hub de Ações Rápidas:[\s\S]*?<\/section>/i;

const compactTopSection = `<!-- Hub de Ações Rápidas no Topo dos Cursos: Currículo & Mural de Vagas Juntos (Diminuídos & Compactos) -->
      <section class="mb-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5" aria-label="Ferramentas Principais no Topo">
        
        <!-- Card 1: Criador de Currículos Profissional (Compacto) -->
        <article 
          id="curriculo-home-banner" 
          class="bg-gradient-to-br from-emerald-800 via-[#008031] to-teal-900 rounded-xl p-3 sm:p-3.5 text-white shadow-sm border border-[#ffcc29] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
        >
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffdf00] shadow-xs">
              <i data-lucide="file-check-2" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <h2 class="text-xs sm:text-sm font-black text-white leading-tight">
                  Criador de Currículos em PDF
                </h2>
                <span class="text-[9px] font-black text-[#ffdf00] bg-black/25 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider">
                  12 Modelos
                </span>
              </div>
              <p class="text-[11px] text-emerald-100 font-medium line-clamp-1 leading-snug">
                Pré-visualização em tempo real, assistente de escrita e download em PDF A4.
              </p>
            </div>
          </div>

          <div class="mt-2.5 pt-2 border-t border-white/15 flex items-center gap-2">
            <a 
              href="curriculo.html" 
              class="flex-1 py-1.5 px-3 rounded-lg font-black text-xs bg-white hover:bg-[#ffdf00] text-[#002776] shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <i data-lucide="file-text" class="w-3.5 h-3.5 text-emerald-700"></i>
              <span>Criar Currículo Grátis</span>
              <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </a>
            <a 
              href="curriculo.html" 
              class="py-1.5 px-2 rounded-lg font-bold text-[11px] bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-100 border border-emerald-400/30 transition-all flex items-center justify-center cursor-pointer"
              title="Explorar Modelos"
            >
              Modelos
            </a>
          </div>
        </article>

        <!-- Card 2: Mural de Vagas & Estágios (Compacto e Junto do Currículo no Topo) -->
        <article 
          id="vagas-home-banner" 
          class="bg-gradient-to-br from-[#002776] via-[#091a42] to-[#001f5c] rounded-xl p-3 sm:p-3.5 text-white shadow-sm border border-[#ffcc29] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
        >
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffcc29] shadow-xs">
              <i data-lucide="briefcase" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <h2 class="text-xs sm:text-sm font-black text-white leading-tight">
                  Mural de Vagas & Estágios
                </h2>
                <span class="text-[9px] font-black text-blue-200 bg-black/25 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider">
                  Oportunidades
                </span>
              </div>
              <p class="text-[11px] text-blue-100 font-medium line-clamp-1 leading-snug">
                Estágio, Jovem Aprendiz, Trainee e vagas Júnior com candidatura gratuita direta.
              </p>
            </div>
          </div>

          <div class="mt-2.5 pt-2 border-t border-white/15 flex items-center gap-2">
            <a 
              href="vagas.html" 
              class="flex-1 py-1.5 px-3 rounded-lg font-black text-xs bg-[#ffcc29] hover:bg-amber-300 text-slate-950 shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <i data-lucide="search" class="w-3.5 h-3.5 text-slate-950"></i>
              <span>Ver Vagas Abertas</span>
              <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </a>
            <a 
              href="vagas.html" 
              class="py-1.5 px-2 rounded-lg font-bold text-[11px] bg-blue-950/40 hover:bg-blue-950/60 text-blue-100 border border-blue-400/30 transition-all flex items-center justify-center cursor-pointer"
              title="Filtros de Vagas"
            >
              Filtros
            </a>
          </div>
        </article>

      </section>`;

if (topSectionRegex.test(index)) {
  index = index.replace(topSectionRegex, compactTopSection);
  console.log('✅ Seção do topo atualizada com Currículo e Mural de Vagas lado a lado e compactos!');
} else {
  console.warn('⚠️ topSectionRegex não casou, buscando por ID...');
  const currBannerIdx = index.indexOf('id="curriculo-home-banner"');
  if (currBannerIdx !== -1) {
    const secStart = index.lastIndexOf('<section', currBannerIdx);
    const secEnd = index.indexOf('</section>', currBannerIdx) + '</section>'.length;
    index = index.slice(0, secStart) + compactTopSection + index.slice(secEnd);
    console.log('✅ Seção do topo substituída via index!');
  }
}

console.log('=== 3. ATUALIZANDO SEÇÃO INFERIOR (TESTE VOCACIONAL & BLOG JUNTOS E COMPACTOS) ===');
const bottomSectionRegex = /<!-- =+ -->\s*<!-- PORTAIS INDEPENDENTES:[\s\S]*?<\/section>/i;

const compactBottomSection = `<!-- ======================================================== -->
    <!-- FERRAMENTAS COMPLEMENTARES: TESTE VOCACIONAL & BLOG (DIMINUÍDOS) -->
    <!-- ======================================================== -->
    <section class="mt-8 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5" aria-label="Orientação e Blog de Carreira">
      
      <!-- Card 1: Teste Vocacional & Orientação de Carreira (Compacto) -->
      <article 
        id="career-test-home-card" 
        class="bg-gradient-to-br from-[#002776] via-[#001f5c] to-[#005e24] rounded-xl p-3 sm:p-3.5 text-white shadow-sm border border-[#ffcc29] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
      >
        <div class="flex items-start gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffcc29] shadow-xs">
            <i data-lucide="target" class="w-4 h-4"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <h3 class="text-xs sm:text-sm font-black text-white leading-tight">
                Teste Vocacional & Perfil
              </h3>
              <span class="text-[9px] font-black text-emerald-300 bg-black/25 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider">
                12 Perguntas
              </span>
            </div>
            <p class="text-[11px] text-blue-100 font-medium line-clamp-1 leading-snug">
              Descubra quais áreas combinam com você e receba sua trilha recomendada.
            </p>
          </div>
        </div>

        <div class="mt-2.5 pt-2 border-t border-white/15 flex items-center gap-2">
          <button 
            id="start-career-test-home-btn"
            type="button"
            class="flex-1 py-1.5 px-3 rounded-lg font-black text-xs bg-[#ffcc29] hover:bg-[#ffdf00] text-slate-950 shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-slate-950"></i>
            <span>Fazer Teste Grátis</span>
            <i data-lucide="arrow-right" class="w-3 h-3"></i>
          </button>
          <a 
            href="teste-vocacional.html"
            class="py-1.5 px-2 rounded-lg font-bold text-[11px] bg-blue-950/40 hover:bg-blue-950/60 text-blue-100 border border-blue-400/30 transition-all flex items-center justify-center cursor-pointer"
            title="Página Completa do Teste"
          >
            Abrir
          </a>
        </div>
      </article>

      <!-- Card 2: Blog & Dicas de Carreira (Compacto) -->
      <article 
        class="bg-gradient-to-br from-[#005e24] via-[#00471b] to-[#091a42] rounded-xl p-3 sm:p-3.5 text-white shadow-sm border border-[#ffcc29] relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
      >
        <div class="flex items-start gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffcc29] shadow-xs">
            <i data-lucide="book-open" class="w-4 h-4"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <h3 class="text-xs sm:text-sm font-black text-white leading-tight">
                Blog de Carreira & Dicas
              </h3>
              <span class="text-[9px] font-black text-amber-300 bg-black/25 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider">
                Artigos Práticos
              </span>
            </div>
            <p class="text-[11px] text-emerald-100 font-medium line-clamp-1 leading-snug">
              Guias para currículo ATS, entrevistas de emprego e capacitação profissional.
            </p>
          </div>
        </div>

        <div class="mt-2.5 pt-2 border-t border-white/15 flex items-center gap-2">
          <a 
            href="blog.html" 
            class="flex-1 py-1.5 px-3 rounded-lg font-black text-xs bg-white text-[#005e24] hover:bg-slate-100 shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <i data-lucide="book-marked" class="w-3.5 h-3.5 text-[#005e24]"></i>
            <span>Explorar Artigos</span>
            <i data-lucide="arrow-right" class="w-3 h-3"></i>
          </a>
          <a 
            href="blog.html" 
            class="py-1.5 px-2 rounded-lg font-bold text-[11px] bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-100 border border-emerald-400/30 transition-all flex items-center justify-center cursor-pointer"
            title="Ver Todas as Categorias"
          >
            Categorias
          </a>
        </div>
      </article>

    </section>`;

if (bottomSectionRegex.test(index)) {
  index = index.replace(bottomSectionRegex, compactBottomSection);
  console.log('✅ Seção inferior atualizada com Teste Vocacional e Blog lado a lado e compactos!');
} else {
  console.warn('⚠️ bottomSectionRegex não casou, buscando...');
  const portaisIdx = index.indexOf('PORTAIS INDEPENDENTES:');
  if (portaisIdx !== -1) {
    const secStart = index.lastIndexOf('<section', portaisIdx);
    const secEnd = index.indexOf('</section>', portaisIdx) + '</section>'.length;
    index = index.slice(0, secStart) + compactBottomSection + index.slice(secEnd);
    console.log('✅ Seção inferior substituída via index!');
  }
}

fs.writeFileSync(indexPath, index, 'utf8');
console.log('🎉 index.html ajustado!');
