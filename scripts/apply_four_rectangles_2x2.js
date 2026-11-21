const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const indexPath = path.join(dir, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');

console.log('=== ATUALIZANDO OS 4 CARDS: RETÂNGULOS 2 EM CIMA DE 2 FORMANDO UM QUADRADO ===');

const fourRectanglesHtml = `<!-- Hub de Ações Rápidas no Topo dos Cursos: 4 Cards Retangulares (2 em cima de 2 formando um bloco quadrado equilibrado) -->
      <section class="mb-6 max-w-5xl mx-auto" aria-label="Ferramentas Principais em Destaque">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          
          <!-- Card 1: Criador de Currículos (Retângulo Compacto) -->
          <article 
            id="curriculo-home-banner" 
            class="bg-gradient-to-br from-emerald-800 via-[#008031] to-teal-900 rounded-2xl p-3 sm:p-3.5 text-white shadow-sm border-2 border-[#ffcc29] relative overflow-hidden flex items-center justify-between gap-3 group hover:shadow-md hover:border-amber-300 hover:scale-[1.01] transition-all"
          >
            <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffdf00] shadow-2xs group-hover:scale-105 transition-transform">
                <i data-lucide="file-check-2" class="w-4 h-4 sm:w-5 sm:h-5"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h2 class="text-xs sm:text-sm font-black text-white leading-tight">
                    Criador de Currículos
                  </h2>
                  <span class="text-[9px] font-black text-[#ffdf00] bg-black/30 px-1.5 py-0.2 rounded border border-white/10 uppercase tracking-wider">
                    12 Modelos
                  </span>
                </div>
                <p class="text-[10px] sm:text-[11px] text-emerald-100 font-medium line-clamp-1 leading-snug mt-0.5">
                  Modelos modernos em PDF A4 sem cadastro.
                </p>
              </div>
            </div>

            <a 
              href="curriculo.html" 
              class="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl font-black text-[11px] sm:text-xs bg-white hover:bg-[#ffdf00] text-[#002776] shadow-xs transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>Criar Grátis</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
          </article>

          <!-- Card 2: Mural de Vagas (Retângulo Compacto) -->
          <article 
            id="vagas-home-banner" 
            class="bg-gradient-to-br from-[#002776] via-[#091a42] to-[#001f5c] rounded-2xl p-3 sm:p-3.5 text-white shadow-sm border-2 border-[#ffcc29] relative overflow-hidden flex items-center justify-between gap-3 group hover:shadow-md hover:border-amber-300 hover:scale-[1.01] transition-all"
          >
            <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffcc29] shadow-2xs group-hover:scale-105 transition-transform">
                <i data-lucide="briefcase" class="w-4 h-4 sm:w-5 sm:h-5"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h2 class="text-xs sm:text-sm font-black text-white leading-tight">
                    Mural de Vagas
                  </h2>
                  <span class="text-[9px] font-black text-blue-200 bg-black/30 px-1.5 py-0.2 rounded border border-white/10 uppercase tracking-wider">
                    Abertas
                  </span>
                </div>
                <p class="text-[10px] sm:text-[11px] text-blue-100 font-medium line-clamp-1 leading-snug mt-0.5">
                  Estágio, Jovem Aprendiz e vagas Júnior.
                </p>
              </div>
            </div>

            <a 
              href="vagas.html" 
              class="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl font-black text-[11px] sm:text-xs bg-[#ffcc29] hover:bg-amber-300 text-slate-950 shadow-xs transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>Ver Vagas</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
          </article>

          <!-- Card 3: Teste Vocacional (Retângulo Compacto) -->
          <article 
            id="career-test-home-card" 
            class="bg-gradient-to-br from-[#002776] via-[#001f5c] to-[#005e24] rounded-2xl p-3 sm:p-3.5 text-white shadow-sm border-2 border-[#ffcc29] relative overflow-hidden flex items-center justify-between gap-3 group hover:shadow-md hover:border-amber-300 hover:scale-[1.01] transition-all"
          >
            <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffdf00] shadow-2xs group-hover:scale-105 transition-transform">
                <i data-lucide="target" class="w-4 h-4 sm:w-5 sm:h-5"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h2 class="text-xs sm:text-sm font-black text-white leading-tight">
                    Teste Vocacional
                  </h2>
                  <span class="text-[9px] font-black text-emerald-300 bg-black/30 px-1.5 py-0.2 rounded border border-white/10 uppercase tracking-wider">
                    12 Perguntas
                  </span>
                </div>
                <p class="text-[10px] sm:text-[11px] text-blue-100 font-medium line-clamp-1 leading-snug mt-0.5">
                  Descubra seu perfil e receba sua trilha.
                </p>
              </div>
            </div>

            <button 
              id="start-career-test-home-btn"
              type="button" 
              class="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl font-black text-[11px] sm:text-xs bg-[#ffcc29] hover:bg-[#ffdf00] text-slate-950 shadow-xs transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-slate-950"></i>
              <span>Fazer Teste</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </article>

          <!-- Card 4: Blog de Carreira (Retângulo Compacto) -->
          <article 
            id="blog-home-banner" 
            class="bg-gradient-to-br from-[#005e24] via-[#00471b] to-[#091a42] rounded-2xl p-3 sm:p-3.5 text-white shadow-sm border-2 border-[#ffcc29] relative overflow-hidden flex items-center justify-between gap-3 group hover:shadow-md hover:border-amber-300 hover:scale-[1.01] transition-all"
          >
            <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-[#ffdf00]/80 flex items-center justify-center flex-shrink-0 text-[#ffdf00] shadow-2xs group-hover:scale-105 transition-transform">
                <i data-lucide="book-open" class="w-4 h-4 sm:w-5 sm:h-5"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h2 class="text-xs sm:text-sm font-black text-white leading-tight">
                    Blog de Carreira
                  </h2>
                  <span class="text-[9px] font-black text-amber-300 bg-black/30 px-1.5 py-0.2 rounded border border-white/10 uppercase tracking-wider">
                    Artigos
                  </span>
                </div>
                <p class="text-[10px] sm:text-[11px] text-emerald-100 font-medium line-clamp-1 leading-snug mt-0.5">
                  Dicas de currículo ATS e entrevistas.
                </p>
              </div>
            </div>

            <a 
              href="blog.html" 
              class="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl font-black text-[11px] sm:text-xs bg-white text-[#005e24] hover:bg-slate-100 shadow-xs transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <span>Explorar Blog</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
          </article>

        </div>
      </section>`;

const secStart = index.indexOf('<!-- Hub de Ações Rápidas no Topo dos Cursos:');
if (secStart !== -1) {
  const secEnd = index.indexOf('</section>', secStart) + '</section>'.length;
  index = index.slice(0, secStart) + fourRectanglesHtml + index.slice(secEnd);
  console.log('✅ Seção do topo atualizada com os 4 retângulos em grid 2x2!');
} else {
  console.error('❌ Não foi possível encontrar a seção de ações rápidas no topo');
}

fs.writeFileSync(indexPath, index, 'utf8');
console.log('🎉 index.html salvo com sucesso!');
