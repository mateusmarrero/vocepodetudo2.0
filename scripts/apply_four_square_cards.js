const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const indexPath = path.join(dir, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');

console.log('=== 1. SUBSTITUINDO O TOPO COM OS 4 CARDS QUADRADOS JUNTOS ===');

const topSectionStart = index.indexOf('<!-- Hub de Ações Rápidas no Topo dos Cursos:');
let topSectionEnd = -1;
if (topSectionStart !== -1) {
  topSectionEnd = index.indexOf('</section>', topSectionStart) + '</section>'.length;
} else {
  // Tentar encontrar pelo curriculo-home-banner
  const curIdx = index.indexOf('id="curriculo-home-banner"');
  if (curIdx !== -1) {
    const secStart = index.lastIndexOf('<section', curIdx);
    topSectionEnd = index.indexOf('</section>', curIdx) + '</section>'.length;
  }
}

const fourSquareCardsHtml = `<!-- Hub de Ações Rápidas no Topo dos Cursos: 4 Cards Quadrados Juntos (Currículo, Vagas, Teste Vocacional, Blog) -->
      <section class="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-label="Ferramentas Principais em Destaque">
        
        <!-- Card 1: Criador de Currículos (Quadrado) -->
        <article 
          id="curriculo-home-banner" 
          class="aspect-square bg-gradient-to-br from-emerald-800 via-[#008031] to-teal-900 rounded-2xl p-3 sm:p-4 text-white shadow-md border-2 border-[#ffcc29] relative overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl pointer-events-none"></div>
          
          <!-- Topo do Card -->
          <div class="flex items-center justify-between gap-1">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffdf00] shadow-2xs">
              <i data-lucide="file-check-2" class="w-4 h-4 sm:w-5 sm:h-5"></i>
            </div>
            <span class="text-[9px] sm:text-[10px] font-black text-[#ffdf00] bg-black/30 px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider">
              12 Modelos
            </span>
          </div>

          <!-- Conteúdo Central -->
          <div class="my-auto py-1">
            <h2 class="text-xs sm:text-sm md:text-base font-black text-white leading-tight">
              Criador de Currículos
            </h2>
            <p class="text-[10px] sm:text-xs text-emerald-100 font-medium mt-1 line-clamp-2 leading-snug">
              Modelos profissionais com pré-visualização ao vivo e download em PDF A4.
            </p>
          </div>

          <!-- Ação / Botão -->
          <a 
            href="curriculo.html" 
            class="w-full py-2 px-2.5 rounded-xl font-black text-[11px] sm:text-xs bg-white hover:bg-[#ffdf00] text-[#002776] shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <span>Criar Currículo</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </article>

        <!-- Card 2: Mural de Vagas (Quadrado) -->
        <article 
          id="vagas-home-banner" 
          class="aspect-square bg-gradient-to-br from-[#002776] via-[#091a42] to-[#001f5c] rounded-2xl p-3 sm:p-4 text-white shadow-md border-2 border-[#ffcc29] relative overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <!-- Topo do Card -->
          <div class="flex items-center justify-between gap-1">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffcc29] shadow-2xs">
              <i data-lucide="briefcase" class="w-4 h-4 sm:w-5 sm:h-5"></i>
            </div>
            <span class="text-[9px] sm:text-[10px] font-black text-blue-200 bg-black/30 px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider">
              Vagas Abertas
            </span>
          </div>

          <!-- Conteúdo Central -->
          <div class="my-auto py-1">
            <h2 class="text-xs sm:text-sm md:text-base font-black text-white leading-tight">
              Mural de Vagas
            </h2>
            <p class="text-[10px] sm:text-xs text-blue-100 font-medium mt-1 line-clamp-2 leading-snug">
              Estágio, Jovem Aprendiz, Trainee e vagas Júnior com candidatura gratuita direta.
            </p>
          </div>

          <!-- Ação / Botão -->
          <a 
            href="vagas.html" 
            class="w-full py-2 px-2.5 rounded-xl font-black text-[11px] sm:text-xs bg-[#ffcc29] hover:bg-amber-300 text-slate-950 shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <span>Ver Vagas</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </article>

        <!-- Card 3: Teste Vocacional (Quadrado) -->
        <article 
          id="career-test-home-card" 
          class="aspect-square bg-gradient-to-br from-[#002776] via-[#001f5c] to-[#005e24] rounded-2xl p-3 sm:p-4 text-white shadow-md border-2 border-[#ffcc29] relative overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <!-- Topo do Card -->
          <div class="flex items-center justify-between gap-1">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffdf00] shadow-2xs">
              <i data-lucide="target" class="w-4 h-4 sm:w-5 sm:h-5"></i>
            </div>
            <span class="text-[9px] sm:text-[10px] font-black text-emerald-300 bg-black/30 px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider">
              12 Questões
            </span>
          </div>

          <!-- Conteúdo Central -->
          <div class="my-auto py-1">
            <h2 class="text-xs sm:text-sm md:text-base font-black text-white leading-tight">
              Teste Vocacional
            </h2>
            <p class="text-[10px] sm:text-xs text-blue-100 font-medium mt-1 line-clamp-2 leading-snug">
              Descubra quais áreas combinam com você e receba sua trilha recomendada.
            </p>
          </div>

          <!-- Ação / Botão -->
          <button 
            id="start-career-test-home-btn"
            type="button" 
            class="w-full py-2 px-2.5 rounded-xl font-black text-[11px] sm:text-xs bg-[#ffcc29] hover:bg-[#ffdf00] text-slate-950 shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-slate-950"></i>
            <span>Fazer Teste</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </article>

        <!-- Card 4: Blog & Dicas (Quadrado) -->
        <article 
          id="blog-home-banner" 
          class="aspect-square bg-gradient-to-br from-[#005e24] via-[#00471b] to-[#091a42] rounded-2xl p-3 sm:p-4 text-white shadow-md border-2 border-[#ffcc29] relative overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <!-- Topo do Card -->
          <div class="flex items-center justify-between gap-1">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffdf00] shadow-2xs">
              <i data-lucide="book-open" class="w-4 h-4 sm:w-5 sm:h-5"></i>
            </div>
            <span class="text-[9px] sm:text-[10px] font-black text-amber-300 bg-black/30 px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider">
              Artigos
            </span>
          </div>

          <!-- Conteúdo Central -->
          <div class="my-auto py-1">
            <h2 class="text-xs sm:text-sm md:text-base font-black text-white leading-tight">
              Blog de Carreira
            </h2>
            <p class="text-[10px] sm:text-xs text-emerald-100 font-medium mt-1 line-clamp-2 leading-snug">
              Dicas de currículo ATS, entrevistas de emprego e capacitação profissional.
            </p>
          </div>

          <!-- Ação / Botão -->
          <a 
            href="blog.html" 
            class="w-full py-2 px-2.5 rounded-xl font-black text-[11px] sm:text-xs bg-white text-[#005e24] hover:bg-slate-100 shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <span>Explorar Blog</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </article>

      </section>`;

const secStart = index.indexOf('<!-- Hub de Ações Rápidas no Topo dos Cursos:');
const secEnd = index.indexOf('</section>', secStart) + '</section>'.length;
index = index.slice(0, secStart) + fourSquareCardsHtml + index.slice(secEnd);
console.log('✅ Seção do topo atualizada com os 4 cards quadrados juntos!');

console.log('=== 2. REMOVENDO A SEÇÃO INFERIOR PARA NÃO DUPLICAR CARDS ===');
const bottomSecStart = index.indexOf('<!-- ======================================================== -->\n    <!-- FERRAMENTAS COMPLEMENTARES: TESTE VOCACIONAL & BLOG');
if (bottomSecStart !== -1) {
  const bottomSecEnd = index.indexOf('</section>', bottomSecStart) + '</section>'.length;
  index = index.slice(0, bottomSecStart) + index.slice(bottomSecEnd);
  console.log('✅ Seção duplicada da parte inferior removida com sucesso!');
}

fs.writeFileSync(indexPath, index, 'utf8');
console.log('🎉 index.html salvo!');
