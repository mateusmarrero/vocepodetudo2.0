const fs = require('fs');
let index = fs.readFileSync('index.html', 'utf8');

const needle = 'Criador de Currículos</span>\n          </a>\n          <span>•</span>';
const normalized = index.replace(/\r\n/g, '\n');

if (normalized.includes(needle)) {
  const rep = 'Criador de Currículos</span>\n          </a>\n          <span>•</span>\n          <a href="midia-kit" class="hover:underline flex items-center gap-1 text-[#009639] hover:text-[#00702a] font-bold" title="Dossiê Oficial de Audiência & Mídia Kit para Anunciantes">\n            <i data-lucide="award" class="w-3.5 h-3.5 text-[#009639]"></i>\n            <span>Mídia Kit & Publicidade</span>\n          </a>\n          <span>•</span>';
  const updated = normalized.replace(needle, rep);
  fs.writeFileSync('index.html', updated, 'utf8');
  console.log('✅ index.html atualizado com sucesso no footer com quebras normalizadas!');
} else {
  console.log('Needle ainda não encontrado. Buscando substring...');
  const idx = normalized.indexOf('Criador de Currículos');
  console.log(normalized.slice(idx - 50, idx + 150));
}
