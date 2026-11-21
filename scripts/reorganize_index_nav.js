const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

// 1. O novo NAV Desktop para index.html
const newDesktopNav = `      <!-- Centro (Desktop): Menus em Dropdown Organizados e Limpos -->
      <nav class="hidden lg:flex items-center gap-1 text-xs" aria-label="Navegação Principal">
        
        <!-- Menu 1: Cursos & Trilhas -->
        <div class="nav-cascata">
          <button 
            type="button" 
            id="nav-dropdown-cursos-btn"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-slate-700 hover:text-[#009639] hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all cursor-pointer group"
            aria-expanded="false"
            aria-haspopup="true"
          >
            <i data-lucide="book-open" class="w-3.5 h-3.5 text-[#009639]"></i>
            <span>Cursos & Trilhas</span>
            <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400 nav-cascata-arrow transition-transform"></i>
          </button>

          <div class="nav-cascata-menu w-72">
            <div class="bg-white rounded-xl shadow-xl border border-emerald-100 p-1.5 space-y-1">
              
              <button 
                type="button"
                id="tab-catalog-btn"
                role="tab"
                class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left bg-emerald-50 text-[#009639] font-bold border-l-2 border-[#009639] cursor-pointer"
              >
                <div class="w-6 h-6 rounded-md bg-emerald-100 text-[#009639] flex items-center justify-center flex-shrink-0">
                  <i data-lucide="book-marked" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold block leading-tight">Catálogo Geral</span>
                  <span class="text-[10px] text-slate-500 block">174+ Cursos Oficiais Gratuitos</span>
                </div>
              </button>

              <button 
                type="button"
                id="tab-tracks-btn"
                role="tab"
                class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-slate-50 text-slate-700 hover:text-[#009639] font-bold cursor-pointer transition-colors"
              >
                <div class="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="route" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold block leading-tight">Trilhas Profissionais</span>
                  <span class="text-[10px] text-slate-500 block">8 Formações do Básico ao Avançado</span>
                </div>
              </button>

              <div class="border-t border-slate-100 pt-1 space-y-0.5 text-[11px]">
                <button type="button" onclick="window.selectCategoryFilter('tecnologia')" class="w-full flex items-center justify-between px-2 py-1 rounded text-left text-slate-700 hover:text-[#009639] hover:bg-emerald-50 font-medium cursor-pointer">
                  <span>💻 Tecnologia & TI</span>
                  <span class="text-[9px] font-bold text-slate-400">58 cursos</span>
                </button>
                <button type="button" onclick="window.selectCategoryFilter('profissionalizacao')" class="w-full flex items-center justify-between px-2 py-1 rounded text-left text-slate-700 hover:text-[#009639] hover:bg-emerald-50 font-medium cursor-pointer">
                  <span>📊 Gestão & Negócios</span>
                  <span class="text-[9px] font-bold text-slate-400">29 cursos</span>
                </button>
                <button type="button" onclick="window.selectCategoryFilter('concursos')" class="w-full flex items-center justify-between px-2 py-1 rounded text-left text-slate-700 hover:text-[#009639] hover:bg-emerald-50 font-medium cursor-pointer">
                  <span>🏛️ Concursos Públicos</span>
                  <span class="text-[9px] font-bold text-slate-400">12 cursos</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Menu 2: Carreira & Vagas -->
        <div class="nav-cascata">
          <button 
            type="button" 
            id="nav-dropdown-carreira-btn"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-slate-700 hover:text-[#002776] hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-all cursor-pointer group"
            aria-expanded="false"
            aria-haspopup="true"
          >
            <i data-lucide="briefcase" class="w-3.5 h-3.5 text-[#002776]"></i>
            <span>Carreira & Vagas</span>
            <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400 nav-cascata-arrow transition-transform"></i>
          </button>

          <div class="nav-cascata-menu w-72">
            <div class="bg-white rounded-xl shadow-xl border border-blue-100 p-1.5 space-y-1">
              
              <a href="vagas.html" class="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors group">
                <div class="w-6 h-6 rounded-md bg-blue-100 text-[#002776] flex items-center justify-center flex-shrink-0">
                  <i data-lucide="briefcase" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-900 group-hover:text-[#002776] block leading-tight">Mural de Vagas</span>
                  <span class="text-[10px] text-slate-500 block">Oportunidades em todo o Brasil</span>
                </div>
              </a>

              <a href="vagas-jovem-aprendiz-2026.html" class="flex items-center gap-2 p-2 rounded-lg hover:bg-amber-50 transition-colors group">
                <div class="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-900 group-hover:text-amber-800 block leading-tight">Jovem Aprendiz 2026</span>
                  <span class="text-[10px] text-slate-500 block">Primeiro emprego e estágios</span>
                </div>
              </a>

              <a href="simulador-entrevista.html" class="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-50 transition-colors group">
                <div class="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-900 group-hover:text-purple-700 block leading-tight">Simulador de Entrevista</span>
                  <span class="text-[10px] text-slate-500 block">Treine perguntas reais de RH</span>
                </div>
              </a>

              <a href="teste-vocacional.html" class="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors group">
                <div class="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="compass" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-900 group-hover:text-emerald-700 block leading-tight">Teste Vocacional</span>
                  <span class="text-[10px] text-slate-500 block">Descubra sua vocação profissional</span>
                </div>
              </a>

            </div>
          </div>
        </div>

        <!-- Menu 3: Ferramentas & Downloads -->
        <div class="nav-cascata">
          <button 
            type="button" 
            id="nav-dropdown-ferramentas-btn"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-all cursor-pointer group"
            aria-expanded="false"
            aria-haspopup="true"
          >
            <i data-lucide="wrench" class="w-3.5 h-3.5 text-blue-600"></i>
            <span>Ferramentas & Downloads</span>
            <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400 nav-cascata-arrow transition-transform"></i>
          </button>

          <div class="nav-cascata-menu w-72">
            <div class="bg-white rounded-xl shadow-xl border border-blue-100 p-1.5 space-y-1">
              
              <a href="downloads.html" class="flex items-center gap-2 p-2 rounded-lg bg-blue-50/80 hover:bg-blue-100/80 transition-colors group">
                <div class="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <i data-lucide="download" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-blue-900 block leading-tight">Central de Downloads</span>
                    <span class="text-[9px] font-black bg-blue-200 text-blue-900 px-1 py-0.2 rounded">Grátis</span>
                  </div>
                  <span class="text-[10px] text-blue-700 block">Modelos de currículo, planilhas e cartas</span>
                </div>
              </a>

              <a href="calculadora-trabalhista.html" class="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors group">
                <div class="w-6 h-6 rounded-md bg-emerald-100 text-[#00702a] flex items-center justify-center flex-shrink-0">
                  <i data-lucide="calculator" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-900 group-hover:text-[#00702a] block leading-tight">Calculadoras CLT 2026</span>
                  <span class="text-[10px] text-slate-500 block">Salário, Rescisão, Férias e Seguro</span>
                </div>
              </a>

              <a href="curriculo.html" class="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                <div class="w-6 h-6 rounded-md bg-emerald-100 text-[#009639] flex items-center justify-center flex-shrink-0">
                  <i data-lucide="file-check-2" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-900 group-hover:text-[#009639] block leading-tight">12 Modelos de Currículo A4</span>
                  <span class="text-[10px] text-slate-500 block">Gerador sem cadastro com download</span>
                </div>
              </a>

            </div>
          </div>
        </div>

        <!-- Menu 4: Institucional (QUEM SOMOS, CONTATO, BLOG, TERMOS) -->
        <div class="nav-cascata">
          <button 
            type="button" 
            id="nav-dropdown-institucional-btn"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all cursor-pointer group"
            aria-expanded="false"
            aria-haspopup="true"
          >
            <i data-lucide="info" class="w-3.5 h-3.5 text-emerald-600"></i>
            <span>Institucional</span>
            <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400 nav-cascata-arrow transition-transform"></i>
          </button>

          <div class="nav-cascata-menu w-64">
            <div class="bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 space-y-1">
              
              <a href="sobre.html" class="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors group">
                <div class="w-6 h-6 rounded-md bg-emerald-100 text-[#00702a] flex items-center justify-center flex-shrink-0">
                  <i data-lucide="users" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-900 group-hover:text-[#00702a] block leading-tight">Quem Somos</span>
                  <span class="text-[10px] text-slate-500 block">Missão, equipe e curadoria</span>
                </div>
              </a>

              <a href="contato.html" class="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors group">
                <div class="w-6 h-6 rounded-md bg-blue-100 text-[#002776] flex items-center justify-center flex-shrink-0">
                  <i data-lucide="mail" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-900 group-hover:text-[#002776] block leading-tight">Fale Conosco</span>
                  <span class="text-[10px] text-slate-500 block">Suporte, dúvidas e parcerias</span>
                </div>
              </a>

              <a href="blog.html" class="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                <div class="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                  <i data-lucide="newspaper" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-slate-900 group-hover:text-amber-800 block leading-tight">Blog & Guias</span>
                  <span class="text-[10px] text-slate-500 block">140 artigos práticos</span>
                </div>
              </a>

              <div class="border-t border-slate-100 pt-1 space-y-0.5 text-[11px]">
                <a href="politica-privacidade.html" class="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-slate-600 hover:text-emerald-700 hover:bg-slate-50">
                  <i data-lucide="shield-check" class="w-3 h-3 text-emerald-600"></i>
                  <span>Política de Privacidade</span>
                </a>
                <a href="termos-de-uso.html" class="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-slate-600 hover:text-emerald-700 hover:bg-slate-50">
                  <i data-lucide="file-text" class="w-3 h-3 text-slate-400"></i>
                  <span>Termos de Uso</span>
                </a>
              </div>

            </div>
          </div>
        </div>

      </nav>`;

// 2. O novo Drawer Mobile para index.html
const newMobileDrawer = `<div id="mobile-nav-drawer" class="hidden lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-3 py-2.5 shadow-lg animate-fade-in">
      <div class="space-y-1.5">
        
        <!-- Botão Instalar App no Celular -->
        <button 
          id="btn-install-pwa-mobile" 
          type="button" 
          class="hidden w-full items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#009639] text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer mb-1"
        >
          <div class="flex items-center gap-2">
            <i data-lucide="smartphone" class="w-4 h-4 text-[#ffdf00]"></i>
            <span>Instalar Aplicativo no Celular</span>
          </div>
          <span class="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full uppercase">Grátis</span>
        </button>

        <!-- Seção 1: Cursos & Formação -->
        <div class="nav-mobile-accordion border border-slate-200 rounded-xl overflow-hidden">
          <button type="button" class="nav-mobile-accordion-trigger w-full flex items-center justify-between p-2.5 bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer">
            <div class="flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-[#009639]"></i>
              <span>Cursos & Trilhas</span>
            </div>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 nav-mobile-accordion-arrow"></i>
          </button>
          <div class="nav-mobile-accordion-content p-2 bg-white space-y-1">
            <button 
              id="mobile-tab-catalog-btn"
              type="button"
              class="w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold text-left bg-emerald-50 text-[#009639] cursor-pointer"
              onclick="document.getElementById('tab-catalog-btn')?.click(); document.getElementById('mobile-nav-drawer').classList.add('hidden');"
            >
              <span>Catálogo Geral de Cursos</span>
              <span class="text-[9px] font-black bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded">174+</span>
            </button>
            <button 
              id="mobile-tab-tracks-btn"
              type="button"
              class="w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
              onclick="document.getElementById('tab-tracks-btn')?.click(); document.getElementById('mobile-nav-drawer').classList.add('hidden');"
            >
              <span>Trilhas Profissionais Guiadas</span>
              <span class="text-[9px] font-black bg-[#ffcc29] text-slate-950 px-1 py-0.2 rounded">8 Trilhas</span>
            </button>
            <button 
              id="mobile-tab-career-btn"
              type="button"
              class="w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
              onclick="document.getElementById('tab-career-test-btn')?.click(); document.getElementById('mobile-nav-drawer').classList.add('hidden');"
            >
              <span>Teste Vocacional & Perfil</span>
              <span class="text-[9px] font-black bg-amber-100 text-amber-900 px-1 py-0.2 rounded">Novo</span>
            </button>
          </div>
        </div>

        <!-- Seção 2: Carreira & Vagas -->
        <div class="nav-mobile-accordion border border-slate-200 rounded-xl overflow-hidden">
          <button type="button" class="nav-mobile-accordion-trigger w-full flex items-center justify-between p-2.5 bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer">
            <div class="flex items-center gap-2">
              <i data-lucide="briefcase" class="w-4 h-4 text-[#002776]"></i>
              <span>Carreira & Vagas</span>
            </div>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 nav-mobile-accordion-arrow"></i>
          </button>
          <div class="nav-mobile-accordion-content p-2 bg-white space-y-1">
            <a href="vagas.html" class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 text-xs font-bold text-slate-700">
              <div class="flex items-center gap-1.5">
                <i data-lucide="briefcase" class="w-3.5 h-3.5 text-[#002776]"></i>
                <span>Mural de Vagas no Brasil</span>
              </div>
              <span class="text-[9px] font-black bg-blue-100 text-[#002776] px-1 py-0.2 rounded">Vagas</span>
            </a>
            <a href="vagas-jovem-aprendiz-2026.html" class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 text-xs font-bold text-slate-700">
              <div class="flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-600"></i>
                <span>Vagas Jovem Aprendiz 2026</span>
              </div>
              <span class="text-[9px] font-black bg-amber-200 text-amber-900 px-1 py-0.2 rounded">1º Emprego</span>
            </a>
            <a href="curriculo.html" class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 text-xs font-bold text-slate-700">
              <div class="flex items-center gap-1.5">
                <i data-lucide="file-check-2" class="w-3.5 h-3.5 text-[#009B3A]"></i>
                <span>Criador de Currículos em PDF</span>
              </div>
              <span class="text-[9px] font-black bg-[#ffdf00] text-slate-950 px-1 py-0.2 rounded">12 Modelos</span>
            </a>
            <a href="simulador-entrevista.html" class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 text-xs font-bold text-slate-700">
              <div class="flex items-center gap-1.5">
                <i data-lucide="message-square" class="w-3.5 h-3.5 text-purple-600"></i>
                <span>Simulador de Entrevista de Emprego</span>
              </div>
              <span class="text-[9px] font-black bg-purple-100 text-purple-800 px-1 py-0.2 rounded">Com IA</span>
            </a>
          </div>
        </div>

        <!-- Seção 3: Ferramentas & Downloads -->
        <div class="nav-mobile-accordion border border-slate-200 rounded-xl overflow-hidden">
          <button type="button" class="nav-mobile-accordion-trigger w-full flex items-center justify-between p-2.5 bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer">
            <div class="flex items-center gap-2">
              <i data-lucide="wrench" class="w-4 h-4 text-blue-600"></i>
              <span>Ferramentas & Downloads</span>
            </div>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 nav-mobile-accordion-arrow"></i>
          </button>
          <div class="nav-mobile-accordion-content p-2 bg-white space-y-1">
            <a href="downloads.html" class="w-full flex items-center justify-between p-2 rounded-lg bg-blue-50 text-xs font-black text-blue-900">
              <div class="flex items-center gap-1.5">
                <i data-lucide="download" class="w-3.5 h-3.5 text-blue-600"></i>
                <span>Central de Downloads Gratuitos</span>
              </div>
              <span class="text-[9px] font-black bg-blue-200 text-blue-900 px-1 py-0.2 rounded">6 Recursos</span>
            </a>
            <a href="calculadora-trabalhista.html" class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 text-xs font-bold text-slate-700">
              <div class="flex items-center gap-1.5">
                <i data-lucide="calculator" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span>Calculadoras Trabalhistas CLT 2026</span>
              </div>
              <span class="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded">6 Funções</span>
            </a>
          </div>
        </div>

        <!-- Seção 4: Institucional (QUEM SOMOS, CONTATO, BLOG, POLÍTICA) -->
        <div class="nav-mobile-accordion border border-emerald-200 bg-emerald-50/40 rounded-xl overflow-hidden">
          <button type="button" class="nav-mobile-accordion-trigger w-full flex items-center justify-between p-2.5 bg-emerald-50 text-xs font-bold text-emerald-950 cursor-pointer">
            <div class="flex items-center gap-2">
              <i data-lucide="info" class="w-4 h-4 text-[#009639]"></i>
              <span>Institucional & Suporte</span>
            </div>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 nav-mobile-accordion-arrow"></i>
          </button>
          <div class="nav-mobile-accordion-content p-2 bg-white space-y-1">
            <a href="sobre.html" class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 text-xs font-bold text-slate-800">
              <div class="flex items-center gap-1.5">
                <i data-lucide="users" class="w-3.5 h-3.5 text-[#00702a]"></i>
                <span class="text-[#00702a]">Quem Somos (Sobre o Projeto)</span>
              </div>
              <i data-lucide="arrow-right" class="w-3 h-3 text-slate-400"></i>
            </a>
            <a href="contato.html" class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 text-xs font-bold text-slate-800">
              <div class="flex items-center gap-1.5">
                <i data-lucide="mail" class="w-3.5 h-3.5 text-[#002776]"></i>
                <span class="text-[#002776]">Fale Conosco & Ouvidoria</span>
              </div>
              <i data-lucide="arrow-right" class="w-3 h-3 text-slate-400"></i>
            </a>
            <a href="blog.html" class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-700">
              <div class="flex items-center gap-1.5">
                <i data-lucide="newspaper" class="w-3.5 h-3.5 text-amber-600"></i>
                <span>Blog do Conhecimento (140 Artigos)</span>
              </div>
              <span class="text-[9px] font-black bg-amber-100 text-amber-900 px-1 py-0.2 rounded">Dicas</span>
            </a>
            <div class="border-t border-slate-100 pt-1 space-y-0.5 text-[11px]">
              <a href="politica-privacidade.html" class="w-full flex items-center gap-1.5 px-2 py-1 rounded text-slate-600 hover:text-emerald-700">
                <i data-lucide="shield-check" class="w-3 h-3 text-emerald-600"></i>
                <span>Política de Privacidade</span>
              </a>
              <a href="termos-de-uso.html" class="w-full flex items-center gap-1.5 px-2 py-1 rounded text-slate-600 hover:text-emerald-700">
                <i data-lucide="file-text" class="w-3 h-3 text-slate-400"></i>
                <span>Termos de Uso</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Seção 5: Minha Conta -->
        <div class="nav-mobile-accordion border border-slate-200 rounded-xl overflow-hidden">
          <button type="button" class="nav-mobile-accordion-trigger w-full flex items-center justify-between p-2.5 bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer">
            <div class="flex items-center gap-2">
              <i data-lucide="user" class="w-4 h-4 text-[#002776]"></i>
              <span>Minha Conta</span>
            </div>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 nav-mobile-accordion-arrow"></i>
          </button>
          <div class="nav-mobile-accordion-content p-2 bg-white space-y-1">
            <button 
              id="mobile-student-btn"
              type="button"
              class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 text-xs font-bold text-slate-700 cursor-pointer"
              onclick="document.getElementById('open-student-auth-btn')?.click(); document.getElementById('mobile-nav-drawer').classList.add('hidden');"
            >
              <div class="flex items-center gap-1.5">
                <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-purple-700"></i>
                <span>Área do Aluno</span>
              </div>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400"></i>
            </button>
          </div>
        </div>

        <!-- Alternar Modo Noturno -->
        <button 
          id="mobile-dark-mode-toggle"
          type="button" 
          class="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
        >
          <div class="flex items-center gap-2">
            <i data-lucide="moon" id="mobile-dark-mode-icon" class="w-4 h-4 text-amber-500"></i>
            <span id="mobile-dark-mode-text">Modo Escuro (Noturno)</span>
          </div>
          <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">Alternar</span>
        </button>

      </div>
    </div>`;

// 3. Atualizar index.html
const indexPath = path.join(baseDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');

// Substituir NAV Desktop
const navStart = indexHtml.indexOf('<nav class="hidden lg:flex');
const navEnd = indexHtml.indexOf('</nav>', navStart);
if (navStart !== -1 && navEnd !== -1) {
  indexHtml = indexHtml.slice(0, navStart) + newDesktopNav + indexHtml.slice(navEnd + 6);
  console.log('[OK] index.html: Nav Desktop reorganizado com sucesso em 4 Menus!');
}

// Substituir Drawer Mobile
const drawerStart = indexHtml.indexOf('<div id="mobile-nav-drawer"');
const drawerCloseDiv = indexHtml.indexOf('</header>', drawerStart);
// Encontrar a tag de fechamento do drawer antes do </header>
const lastDivIndex = indexHtml.lastIndexOf('</div>', drawerCloseDiv);

if (drawerStart !== -1 && drawerCloseDiv !== -1) {
  // Vamos buscar até o fechamento correto do drawer
  // Substituir do drawerStart até o final do drawer
  const drawerEnd = indexHtml.indexOf('  </header>', drawerStart);
  // No index original: <div id="mobile-nav-drawer" ...> ... </div>\n  </header>
  const exactDrawerSlice = indexHtml.slice(drawerStart, drawerEnd).trim();
  indexHtml = indexHtml.replace(exactDrawerSlice, newMobileDrawer.trim());
  console.log('[OK] index.html: Drawer Mobile reorganizado com sucesso com Sobre e Contato!');
}

fs.writeFileSync(indexPath, indexHtml, 'utf-8');
