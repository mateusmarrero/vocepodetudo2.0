const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexPath = path.join(baseDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf-8');

// 1. Inserir no Footer principal do index.html
if (!indexHtml.includes('href="sobre.html"') && indexHtml.includes('href="politica-privacidade.html"')) {
  const institutionalLinks = `          <a href="sobre.html" class="hover:underline flex items-center gap-1 text-[#002776] font-bold">
            <i data-lucide="info" class="w-3.5 h-3.5 text-blue-600"></i>
            <span>Quem Somos</span>
          </a>
          <span>•</span>
          <a href="contato.html" class="hover:underline flex items-center gap-1 text-[#002776] font-bold">
            <i data-lucide="mail" class="w-3.5 h-3.5 text-emerald-600"></i>
            <span>Fale Conosco</span>
          </a>
          <span>•</span>
          <a href="politica-privacidade.html"`;

  indexHtml = indexHtml.replace('<a href="politica-privacidade.html"', institutionalLinks);
  console.log('[OK] index.html: Adicionados Quem Somos e Fale Conosco no rodapé!');
}

// 2. Inserir no Topo (Barra de acessibilidade / topo verde de index.html se houver)
if (!indexHtml.includes('href="sobre.html"') && indexHtml.includes('href="blog.html"')) {
  indexHtml = indexHtml.replace('href="blog.html"', 'href="sobre.html" class="text-white hover:text-[#ffdf00] transition-colors">Quem Somos</a>\n        <span class="text-white/40">•</span>\n        <a href="blog.html"');
}

fs.writeFileSync(indexPath, indexHtml, 'utf-8');
