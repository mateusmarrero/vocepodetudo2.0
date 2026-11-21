const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

// 1. Atualizar index.html
let indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');

// A. Adicionar no Nav Desktop
const desktopDownloadBtn = `
        <!-- Link Direto: Downloads Gratuitos -->
        <a 
          href="downloads.html" 
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-all cursor-pointer group"
          title="Central de Downloads Gratuitos: Modelos de Currículo, Planilhas e Checklists"
        >
          <i data-lucide="download" class="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform"></i>
          <span>Downloads</span>
          <span class="text-[9px] font-black bg-blue-100 text-blue-800 px-1 py-0.2 rounded">Grátis</span>
        </a>
      </nav>`;

if (!indexHtml.includes('href="downloads.html" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700')) {
  // Encontrar o fechamento do nav
  const navEndTarget = '</nav>';
  // Pegamos a primeira ocorrência da tag nav principal
  const navStart = indexHtml.indexOf('<nav class="hidden lg:flex');
  const navEnd = indexHtml.indexOf('</nav>', navStart);
  if (navEnd !== -1) {
    indexHtml = indexHtml.slice(0, navEnd) + desktopDownloadBtn + indexHtml.slice(navEnd + 6);
    console.log('[OK] index.html: Adicionado botão Downloads no Nav Desktop');
  }
}

// B. Adicionar no Mobile Drawer
const mobileDownloadBtn = `
        <!-- Botão Direto Downloads no Celular -->
        <a 
          href="downloads.html" 
          class="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer mb-2"
        >
          <div class="flex items-center gap-2">
            <i data-lucide="download" class="w-4 h-4 text-[#ffdf00]"></i>
            <span>Central de Downloads (Modelos & Planilhas)</span>
          </div>
          <span class="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full uppercase">Grátis</span>
        </a>`;

if (!indexHtml.includes('Central de Downloads (Modelos & Planilhas)')) {
  indexHtml = indexHtml.replace(
    '</button>\n\n        <!-- Accordion Mobile 1: Cursos & Formação',
    '</button>\n' + mobileDownloadBtn + '\n\n        <!-- Accordion Mobile 1: Cursos & Formação'
  );
  console.log('[OK] index.html: Adicionado botão Downloads no Mobile Drawer');
}

fs.writeFileSync(path.join(baseDir, 'index.html'), indexHtml, 'utf-8');

// 2. Atualizar cabeçalhos de outras páginas públicas
const pages = [
  'blog.html',
  'calculadora-trabalhista.html',
  'curriculo.html',
  'simulador-entrevista.html',
  'teste-vocacional.html',
  'vagas.html',
  'materiais-gratuitos.html',
  'downloads.html',
  'politica-privacidade.html',
  'termos-de-uso.html'
];

pages.forEach(p => {
  const filePath = path.join(baseDir, p);
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf-8');
  
  // Se já tiver link para downloads.html no header, pula
  if (html.includes('href="downloads.html"') && html.includes('Downloads</span>')) {
    return;
  }

  // Tentar inserir no header nav
  if (html.includes('<a href="curriculo.html"')) {
    html = html.replace(
      '<a href="curriculo.html"',
      '<a href="downloads.html" class="hover:text-blue-600 transition-colors flex items-center gap-1"><i data-lucide="download" class="w-3.5 h-3.5 text-blue-500"></i><span>Downloads</span></a>\n        <a href="curriculo.html"'
    );
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`[OK] Adicionado link Downloads no menu de ${p}`);
  }
});
