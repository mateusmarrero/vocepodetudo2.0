const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const mobileDrawerHtml = `  <!-- Gaveta Mobile (Drawer) -->
  <aside id="mobile-nav-drawer" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs hidden transition-opacity">
    <div class="fixed top-0 right-0 h-full w-4/5 max-w-xs bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
      <div>
        <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <img src="./assets/logo-icon.png" alt="Logo Você Pode Tudo" class="h-7 w-auto">
            <span class="text-sm font-black text-slate-900 dark:text-white">Você Pode Tudo</span>
          </div>
          <button type="button" id="btn-close-mobile-drawer" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer" aria-label="Fechar menu">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <nav class="mt-4 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <a href="index.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <i data-lucide="graduation-cap" class="w-4 h-4 text-[#009639]"></i>
            <span>Cursos Gratuitos</span>
          </a>
          <a href="vagas.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <i data-lucide="briefcase" class="w-4 h-4 text-[#002776]"></i>
            <span>Mural de Vagas</span>
          </a>
          <a href="downloads.html" class="flex items-center gap-2.5 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
            <i data-lucide="download" class="w-4 h-4 text-blue-600"></i>
            <span>Central de Downloads (Grátis)</span>
          </a>
          <a href="curriculo.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <i data-lucide="file-check-2" class="w-4 h-4 text-[#009639]"></i>
            <span>Criador de Currículos</span>
          </a>
          <a href="calculadora-trabalhista.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <i data-lucide="calculator" class="w-4 h-4 text-emerald-600"></i>
            <span>Calculadoras CLT</span>
          </a>
          <a href="blog.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <i data-lucide="book-open" class="w-4 h-4 text-amber-600"></i>
            <span>Blog & Dicas</span>
          </a>
          
          <div class="border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1">
            <a href="sobre.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[#00702a] dark:text-emerald-400 font-black">
              <i data-lucide="users" class="w-4 h-4"></i>
              <span>Quem Somos (Sobre Nós)</span>
            </a>
            <a href="contato.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[#002776] dark:text-blue-400 font-black">
              <i data-lucide="mail" class="w-4 h-4"></i>
              <span>Fale Conosco & Ouvidoria</span>
            </a>
          </div>
        </nav>
      </div>

      <div class="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 text-center">
        <span>Você Pode Tudo © 2026</span>
      </div>
    </div>
  </aside>`;

const mobileBtnHtml = `      <button 
        type="button" 
        id="btn-mobile-nav-toggle"
        class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
        aria-label="Abrir Menu de Navegação"
      >
        <i data-lucide="menu" class="w-5 h-5"></i>
      </button>`;

const mobileDrawerScript = `
    // Controle Drawer Mobile
    const mobileToggle = document.getElementById('btn-mobile-nav-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const mobileClose = document.getElementById('btn-close-mobile-drawer');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        mobileDrawer.classList.remove('hidden');
      });
    }
    if (mobileClose && mobileDrawer) {
      mobileClose.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
      });
    }
    if (mobileDrawer) {
      mobileDrawer.addEventListener('click', (e) => {
        if (e.target === mobileDrawer) mobileDrawer.classList.add('hidden');
      });
    }
`;

const pages = [
  'downloads.html',
  'materiais-gratuitos.html',
  'sobre.html',
  'contato.html',
  'calculadora-trabalhista.html',
  'politica-privacidade.html',
  'termos-de-uso.html'
];

pages.forEach(file => {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Inserir botão mobile no header
  if (!content.includes('id="btn-mobile-nav-toggle"')) {
    // Inserir antes de </header>
    content = content.replace('</nav>\n    </div>\n  </header>', '</nav>\n' + mobileBtnHtml + '\n    </div>\n  </header>');
    content = content.replace('</nav>\n    </div>\n</header>', '</nav>\n' + mobileBtnHtml + '\n    </div>\n</header>');
  }

  // 2. Inserir aside drawer logo após </header>
  if (!content.includes('id="mobile-nav-drawer"')) {
    content = content.replace('</header>', '</header>\n\n' + mobileDrawerHtml);
  }

  // 3. Inserir script no final
  if (!content.includes("document.getElementById('btn-mobile-nav-toggle')")) {
    const lucideCall = 'if (window.lucide) window.lucide.createIcons();';
    if (content.includes(lucideCall)) {
      content = content.replace(lucideCall, mobileDrawerScript + '\n    ' + lucideCall);
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`[OK] Suporte Mobile completo adicionado a ${file}!`);
});
