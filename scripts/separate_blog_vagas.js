const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';
const indexPath = path.join(dir, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');

console.log('=== 1. ATUALIZANDO LINKS NO HEADER, DROPDOWNS E MENU MOBILE ===');
// 1. Substituir href="#jobs-section" por href="vagas.html"
index = index.replace(/href="#jobs-section"/g, 'href="vagas.html"');
// 2. Substituir href="#blog-section" por href="blog.html"
index = index.replace(/href="#blog-section"/g, 'href="blog.html"');

console.log('=== 2. LOCALIZANDO E SUBSTITUINDO SEÇÕES EMBUTIDAS POR CARDS DO PORTAL ===');
const startJobsRegex = /<!-- =+ -->\s*<!-- MURAL DE VAGAS[\s\S]*?<section id="jobs-section"[\s\S]*?<\/section>\s*<!-- Chamada para Ação Comunitária/i;

// Encontrar onde começa o jobs-section até o fim do blog-section
const jobsIndex = index.indexOf('<section id="jobs-section"');
const blogEndIndex = index.indexOf('</section>', index.indexOf('<section id="blog-section"'));

if (jobsIndex !== -1 && blogEndIndex !== -1) {
  const fullBlogEnd = blogEndIndex + '</section>'.length;
  
  // Buscar o início do comentário antes de jobs-section se houver
  const commentStart = index.lastIndexOf('<!-- ======================================================== -->', jobsIndex);
  const replaceStart = commentStart !== -1 ? commentStart : jobsIndex;

  const showcaseHtml = `<!-- ======================================================== -->
    <!-- PORTAIS INDEPENDENTES: MURAL DE VAGAS & BLOG DE CARREIRA  -->
    <!-- ======================================================== -->
    <section class="mt-14 mb-10" aria-label="Portais de Vagas e Blog de Carreira">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Card 1: Mural de Vagas & Estágios (Página Independente) -->
        <div class="bg-gradient-to-br from-[#002776] via-[#091a42] to-[#001f5c] rounded-3xl p-6 sm:p-8 text-white shadow-xl border-4 border-[#ffcc29] relative overflow-hidden flex flex-col justify-between group">
          <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="relative z-10">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#ffcc29] text-slate-950 mb-3 shadow-xs uppercase tracking-wider">
              <i data-lucide="briefcase" class="w-3.5 h-3.5 text-slate-950"></i>
              <span>Oportunidades Oficiais</span>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
              Mural de Vagas & Estágios
            </h3>
            <p class="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed mb-6">
              Acesse nosso portal exclusivo e independente com vagas de <strong>Estágio</strong>, <strong>Jovem Aprendiz</strong>, <strong>Trainee</strong> e <strong>Primeiro Emprego</strong> com busca detalhada, filtros de modalidade e inscrição 100% gratuita nas fontes oficiais.
            </p>
          </div>
          <div class="relative z-10 pt-2">
            <a 
              href="vagas.html" 
              class="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs sm:text-sm bg-[#ffcc29] text-slate-950 hover:bg-amber-300 transition-all shadow-md group-hover:translate-x-1"
            >
              <span>Acessar Mural de Vagas Completo</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
          </div>
        </div>

        <!-- Card 2: Blog & Dicas de Carreira (Página Independente) -->
        <div class="bg-gradient-to-br from-[#005e24] via-[#00471b] to-[#091a42] rounded-3xl p-6 sm:p-8 text-white shadow-xl border-4 border-[#ffcc29] relative overflow-hidden flex flex-col justify-between group">
          <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="relative z-10">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#ffcc29] text-slate-950 mb-3 shadow-xs uppercase tracking-wider">
              <i data-lucide="book-open" class="w-3.5 h-3.5 text-slate-950"></i>
              <span>Artigos & Tutoriais</span>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">
              Blog de Carreira & Empregabilidade
            </h3>
            <p class="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed mb-6">
              Artigos práticos, tutoriais passo a passo para currículos otimizados para ATS, orientações diretas para entrevistas de emprego, transição de carreira e capacitação profissional.
            </p>
          </div>
          <div class="relative z-10 pt-2">
            <a 
              href="blog.html" 
              class="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs sm:text-sm bg-white text-[#005e24] hover:bg-slate-100 transition-all shadow-md group-hover:translate-x-1"
            >
              <span>Explorar Artigos do Blog</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
          </div>
        </div>

      </div>
    </section>`;

  index = index.slice(0, replaceStart) + showcaseHtml + index.slice(fullBlogEnd);
  console.log('✅ Seções embutidas substituídas com sucesso pelo Showcase dos Portais!');
} else {
  console.error('❌ Não foi possível encontrar jobs-section e blog-section em index.html');
}

console.log('=== 3. REMOVENDO MODAIS OBSOLETOS DE JOBS E BLOG EM INDEX.HTML ===');
// Remover #job-details-modal
const jobModalStart = index.indexOf('<div id="job-details-modal"');
if (jobModalStart !== -1) {
  const jobModalEnd = index.indexOf('</div>\n  </div>', jobModalStart);
  if (jobModalEnd !== -1) {
    const fullJobModalEnd = jobModalEnd + '</div>\n  </div>'.length;
    index = index.slice(0, jobModalStart) + index.slice(fullJobModalEnd);
    console.log('✅ Modal #job-details-modal removido de index.html');
  }
}

// Remover #blog-reader-modal
const blogModalStart = index.indexOf('<div id="blog-reader-modal"');
if (blogModalStart !== -1) {
  const blogModalEnd = index.indexOf('</div>\n  </div>', blogModalStart);
  if (blogModalEnd !== -1) {
    const fullBlogModalEnd = blogModalEnd + '</div>\n  </div>'.length;
    index = index.slice(0, blogModalStart) + index.slice(fullBlogModalEnd);
    console.log('✅ Modal #blog-reader-modal removido de index.html');
  }
}

console.log('=== 4. ADICIONANDO LINKS NO FOOTER DE INDEX.HTML ===');
if (!index.includes('href="vagas.html" class="hover:underline')) {
  const footerCurrLink = '<a href="curriculo.html" class="hover:underline flex items-center gap-1 text-[#002776] font-black">\n            <i data-lucide="file-text" class="w-3.5 h-3.5 text-[#009639]"></i>\n            <span>Criador de Currículos</span>\n          </a>';
  const newFooterLinks = `${footerCurrLink}
          <span>•</span>
          <a href="vagas.html" class="hover:underline flex items-center gap-1 text-[#002776] font-black">
            <i data-lucide="briefcase" class="w-3.5 h-3.5 text-[#002776]"></i>
            <span>Mural de Vagas</span>
          </a>
          <span>•</span>
          <a href="blog.html" class="hover:underline flex items-center gap-1 text-[#009639] font-black">
            <i data-lucide="book-open" class="w-3.5 h-3.5 text-[#009639]"></i>
            <span>Blog & Dicas</span>
          </a>`;
  index = index.replace(footerCurrLink, newFooterLinks);
  console.log('✅ Links para Vagas e Blog adicionados no rodapé.');
}

fs.writeFileSync(indexPath, index, 'utf8');
console.log('🎉 index.html atualizado com sucesso!');
