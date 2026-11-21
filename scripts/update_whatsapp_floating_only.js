const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WHATSAPP_URL = 'https://chat.whatsapp.com/FN9jb73jdKs1UYq0BbIC3j';

// SVG Oficial do WhatsApp para ícone flutuante circular
const WA_SVG_ICON_ROUND = `<svg class="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white flex-shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;

// Widget Flutuante Circular (Apenas Ícone na Lateral Direita com Balão de Notificação e Tooltip)
const NEW_FLOATING_WIDGET_HTML = `
  <!-- Botão Flutuante Oficial do WhatsApp (Apenas Ícone Circular na Lateral) -->
  <aside 
    id="floating-whatsapp-widget" 
    class="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center"
    aria-label="Grupo Oficial do WhatsApp"
  >
    <a 
      href="${WHATSAPP_URL}" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white focus:outline-none focus:ring-4 focus:ring-emerald-400/50 cursor-pointer relative group"
      title="Entrar no Grupo Oficial do WhatsApp"
      aria-label="Entrar no Grupo Oficial do WhatsApp"
    >
      <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#ffdf00] border-2 border-[#25D366]"></span>
      </span>
      ${WA_SVG_ICON_ROUND}
      <span class="absolute right-full mr-3 px-2.5 py-1.5 rounded-xl bg-slate-900/95 text-white text-[11px] font-bold whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
        Grupo Oficial WhatsApp
      </span>
    </a>
  </aside>
`;

// ==========================================
// 1. Atualizar index.html
// ==========================================
const indexPath = path.join(ROOT_DIR, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// A. Remover botão do Top Bar
const topBarRegex = /<!-- Botão Oficial WhatsApp Grupo VIP \(Top Bar\) -->[\s\S]*?<\/a>\s*/;
if (topBarRegex.test(indexHtml)) {
  indexHtml = indexHtml.replace(topBarRegex, '');
  console.log('✅ Botão WhatsApp removido do topo (Top Bar) de index.html');
}

// B. Atualizar o Toast Container para subir um pouco evitando colisão com o ícone flutuante
indexHtml = indexHtml.replace(
  'id="toast-container" class="fixed bottom-5 right-5 z-50',
  'id="toast-container" class="fixed bottom-22 right-5 z-50'
);

// C. Substituir widget flutuante antigo pelo novo (apenas ícone na lateral)
const oldWidgetRegex = /<!-- (?:Botão|Widget) Flutuante Oficial do WhatsApp[\s\S]*?<\/aside>/;
if (oldWidgetRegex.test(indexHtml)) {
  indexHtml = indexHtml.replace(oldWidgetRegex, NEW_FLOATING_WIDGET_HTML.trim());
  console.log('✅ Widget flutuante de index.html atualizado para apenas ícone na lateral');
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');

// ==========================================
// 2. Atualizar vagas.html
// ==========================================
const vagasPath = path.join(ROOT_DIR, 'vagas.html');
if (fs.existsSync(vagasPath)) {
  let vagasHtml = fs.readFileSync(vagasPath, 'utf8');

  // Remover botão WhatsApp do Header
  const vagasHeaderRegex = /<!-- Botão WhatsApp Header -->[\s\S]*?<\/a>\s*/;
  if (vagasHeaderRegex.test(vagasHtml)) {
    vagasHtml = vagasHtml.replace(vagasHeaderRegex, '');
    console.log('✅ Botão WhatsApp removido do Header de vagas.html');
  }

  // Substituir widget flutuante
  if (oldWidgetRegex.test(vagasHtml)) {
    vagasHtml = vagasHtml.replace(oldWidgetRegex, NEW_FLOATING_WIDGET_HTML.trim());
    console.log('✅ Widget flutuante de vagas.html atualizado para apenas ícone na lateral');
  }

  fs.writeFileSync(vagasPath, vagasHtml, 'utf8');
}

// ==========================================
// 3. Atualizar demais páginas
// ==========================================
const pages = [
  'downloads.html',
  'blog.html',
  'curriculo.html',
  'calculadora-trabalhista.html',
  'simulador-entrevista.html',
  'teste-vocacional.html'
];

for (const p of pages) {
  const filePath = path.join(ROOT_DIR, p);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (oldWidgetRegex.test(content)) {
      content = content.replace(oldWidgetRegex, NEW_FLOATING_WIDGET_HTML.trim());
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Widget flutuante de ${p} atualizado para apenas ícone na lateral`);
    }
  }
}

// ==========================================
// 4. Bump Service Worker
// ==========================================
const swPath = path.join(ROOT_DIR, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  sw = sw.replace(/const CACHE_NAME = 'vocepodetudo-pwa-v\d+\.\d+\.\d+';/, "const CACHE_NAME = 'vocepodetudo-pwa-v4.53.0';");
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log('✅ sw.js atualizado para v4.53.0');
}

console.log('🚀 Concluído! O botão do topo foi removido e agora temos apenas o ícone circular flutuante na lateral.');
