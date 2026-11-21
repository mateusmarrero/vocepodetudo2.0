const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const mobileDrawerContent = `        <nav class="mt-4 space-y-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <a href="index.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <i data-lucide="graduation-cap" class="w-4 h-4 text-[#009639]"></i>
            <span>Catálogo de Cursos Gratuitos</span>
          </a>
          <a href="vagas.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <i data-lucide="briefcase" class="w-4 h-4 text-[#002776]"></i>
            <span>Mural de Vagas & Estágios</span>
          </a>
          <a href="downloads.html" class="flex items-center gap-2.5 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
            <i data-lucide="download" class="w-4 h-4 text-blue-600"></i>
            <span>Central de Downloads Gratuitos</span>
          </a>
          <a href="curriculo.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <i data-lucide="file-check-2" class="w-4 h-4 text-[#009639]"></i>
            <span>Criador de Currículos PDF</span>
          </a>
          <a href="calculadora-trabalhista.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <i data-lucide="calculator" class="w-4 h-4 text-emerald-600"></i>
            <span>Calculadoras CLT 2026</span>
          </a>
          <a href="blog.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <i data-lucide="book-open" class="w-4 h-4 text-amber-600"></i>
            <span>Blog & Dicas de Carreira</span>
          </a>
          
          <div class="border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1">
            <a href="sobre.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[#00702a] dark:text-emerald-400 font-black">
              <i data-lucide="users" class="w-4 h-4"></i>
              <span>Quem Somos (Sobre o Projeto)</span>
            </a>
            <a href="contato.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[#002776] dark:text-blue-400 font-black">
              <i data-lucide="mail" class="w-4 h-4"></i>
              <span>Fale Conosco & Ouvidoria</span>
            </a>
          </div>
        </nav>`;

['blog.html', 'vagas.html'].forEach(file => {
  const filePath = path.join(baseDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  const navMatch = content.match(/<nav class="mt-4 space-y-1\.5 text-xs font-bold[\s\S]*?<\/nav>/i);
  if (navMatch) {
    content = content.replace(navMatch[0], mobileDrawerContent.trim());
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[OK] Gaveta mobile sincronizada em ${file}`);
  }
});
