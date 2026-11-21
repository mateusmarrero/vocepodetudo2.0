const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const internalNavHtml = `<nav class="hidden md:flex items-center gap-3.5 text-xs font-bold text-slate-600 dark:text-slate-300">
        <a href="index.html" class="hover:text-emerald-600 transition-colors">Cursos</a>
        <a href="vagas.html" class="hover:text-emerald-600 transition-colors">Vagas</a>
        <a href="downloads.html" class="hover:text-blue-600 transition-colors text-blue-600 dark:text-blue-400 font-black flex items-center gap-1">
          <i data-lucide="download" class="w-3.5 h-3.5"></i>
          <span>Downloads</span>
        </a>
        <a href="calculadora-trabalhista.html" class="hover:text-emerald-600 transition-colors">Calculadoras</a>
        <a href="sobre.html" class="hover:text-emerald-600 transition-colors font-bold text-slate-800 dark:text-slate-200">Quem Somos</a>
        <a href="contato.html" class="hover:text-emerald-600 transition-colors font-bold text-slate-800 dark:text-slate-200">Contato</a>
        <a href="blog.html" class="hover:text-emerald-600 transition-colors">Blog</a>
        <a href="curriculo.html" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors shadow-xs">Criar Currículo</a>
      </nav>`;

const targetPages = [
  'downloads.html',
  'materiais-gratuitos.html',
  'sobre.html',
  'contato.html',
  'calculadora-trabalhista.html',
  'simulador-entrevista.html',
  'teste-vocacional.html',
  'politica-privacidade.html',
  'termos-de-uso.html'
];

targetPages.forEach(file => {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  // Encontrar o nav dentro do header
  const headerStart = content.indexOf('<header');
  const headerEnd = content.indexOf('</header>', headerStart);
  if (headerStart === -1 || headerEnd === -1) return;

  const headerContent = content.slice(headerStart, headerEnd + 9);
  const navStart = headerContent.indexOf('<nav class="hidden md:flex');
  const navEnd = headerContent.indexOf('</nav>', navStart);

  if (navStart !== -1 && navEnd !== -1) {
    const oldNav = headerContent.slice(navStart, navEnd + 6);
    const newHeader = headerContent.replace(oldNav, internalNavHtml);
    content = content.replace(headerContent, newHeader);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[OK] Cabeçalho padronizado e limpo em ${file}`);
  }
});
