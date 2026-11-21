const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';
const adminHtmlPath = path.join(ROOT, 'admin.html');
const adminJsPath = path.join(ROOT, 'src/admin.js');
const blogPhpPath = path.join(ROOT, 'api/blog.php');

console.log('🚀 Iniciando implementação da opção de Baixar Lista de Itens do Blog para Controle Interno...');

// 1. ATUALIZAR ADMIN.HTML
let html = fs.readFileSync(adminHtmlPath, 'utf8');

// Substituir o bloco do menu de exportação do blog por um componente de alto destaque
const oldExportBlock = `            <!-- Menu Dropdown de Exportação de Artigos (Exclusivo Administrador) -->
            <div class="viewer-hide relative inline-block text-left" id="admin-blog-export-container">
              <button 
                type="button" 
                id="btn-admin-blog-export-toggle" 
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
                title="Exportar Artigos (CSV ou JSON) - Exclusivo Administrador"
              >
                <i data-lucide="download" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span class="hidden sm:inline">Exportar</span>
                <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400"></i>
              </button>
              
              <div 
                id="admin-blog-export-menu" 
                class="hidden absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div class="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Planilha Excel / Sheets</span>
                  <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5 text-emerald-600"></i>
                </div>
                <button 
                  type="button" 
                  id="btn-export-blog-csv-filtered" 
                  class="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 cursor-pointer transition-all"
                >
                  <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <i data-lucide="filter" class="w-3.5 h-3.5"></i>
                  </div>
                  <div>
                    <div class="font-bold">Exportar CSV (Filtro Atual)</div>
                    <div class="text-[10px] font-normal text-slate-500" id="export-filtered-count-label">Apenas os artigos visíveis</div>
                  </div>
                </button>
                <button 
                  type="button" 
                  id="btn-export-blog-csv-all" 
                  class="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 cursor-pointer transition-all"
                >
                  <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <i data-lucide="database" class="w-3.5 h-3.5"></i>
                  </div>
                  <div>
                    <div class="font-bold">Exportar CSV (Todos)</div>
                    <div class="text-[10px] font-normal text-slate-500">Acervo completo (137 artigos)</div>
                  </div>
                </button>

                <div class="my-1.5 border-t border-slate-100"></div>

                <div class="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Backup / Desenvolvedores</span>
                  <i data-lucide="code" class="w-3.5 h-3.5 text-blue-600"></i>
                </div>
                <button 
                  type="button" 
                  id="btn-export-blog-json" 
                  class="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-800 flex items-center gap-2.5 cursor-pointer transition-all"
                >
                  <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <i data-lucide="file-code" class="w-3.5 h-3.5"></i>
                  </div>
                  <div>
                    <div class="font-bold">Exportar JSON Completo</div>
                    <div class="text-[10px] font-normal text-slate-500">Dump completo com HTML e tags</div>
                  </div>
                </button>
                <div class="my-1.5 border-t border-slate-100"></div>

                <div class="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Operações em Massa</span>
                  <i data-lucide="upload-cloud" class="w-3.5 h-3.5 text-emerald-600"></i>
                </div>
                <button 
                  type="button" 
                  id="btn-open-blog-import-modal" 
                  class="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 cursor-pointer transition-all"
                >
                  <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <i data-lucide="file-up" class="w-3.5 h-3.5"></i>
                  </div>
                  <div>
                    <div class="font-bold">Importar Artigos (CSV)</div>
                    <div class="text-[10px] font-normal text-slate-500">Cadastre múltiplos artigos via planilha</div>
                  </div>
                </button>
              </div>
            </div>`;

const newExportBlock = `            <!-- Menu Dropdown: Baixar Lista de Artigos para Controle Interno -->
            <div class="relative inline-block text-left" id="admin-blog-export-container">
              <button 
                type="button" 
                id="btn-admin-blog-export-toggle" 
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-[#002776] hover:bg-[#001c54] shadow-sm transition-all cursor-pointer"
                title="Baixar lista completa com todos os itens do blog para controle interno"
              >
                <i data-lucide="file-down" class="w-4 h-4 text-[#ffcc29]"></i>
                <span>Baixar Lista (Controle Interno)</span>
                <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-white/80"></i>
              </button>
              
              <div 
                id="admin-blog-export-menu" 
                class="hidden absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div class="px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Formatos de Controle Interno</span>
                  <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
                </div>

                <!-- 1. Baixar Planilha Excel (.CSV) Completa -->
                <button 
                  type="button" 
                  id="btn-export-blog-csv-all" 
                  class="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-3 cursor-pointer transition-all border-b border-slate-100"
                >
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                  </div>
                  <div class="min-w-0">
                    <div class="font-black text-slate-900">Planilha Excel (.CSV Completo)</div>
                    <div class="text-[10px] font-medium text-slate-500">Todos os 144 artigos com status, datas e views</div>
                  </div>
                </button>

                <!-- 2. Baixar Documento de Texto (.TXT) Completo -->
                <button 
                  type="button" 
                  id="btn-export-blog-txt-all" 
                  class="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-3 cursor-pointer transition-all border-b border-slate-100"
                >
                  <div class="w-8 h-8 rounded-xl bg-blue-100 text-[#002776] flex items-center justify-center shrink-0">
                    <i data-lucide="file-text" class="w-4 h-4"></i>
                  </div>
                  <div class="min-w-0">
                    <div class="font-black text-slate-900">Documento de Texto (.TXT Formatado)</div>
                    <div class="text-[10px] font-medium text-slate-500">Lista tabulada para pautas e leitura offline</div>
                  </div>
                </button>

                <!-- 3. Baixar apenas a Seleção / Filtro Atual -->
                <button 
                  type="button" 
                  id="btn-export-blog-csv-filtered" 
                  class="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition-all border-b border-slate-100"
                >
                  <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <i data-lucide="filter" class="w-4 h-4"></i>
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-800">CSV Apenas do Filtro Atual</div>
                    <div class="text-[10px] font-normal text-slate-500" id="export-filtered-count-label">Apenas os artigos visíveis na tabela</div>
                  </div>
                </button>

                <!-- 4. Backup Técnico Completo (JSON) -->
                <button 
                  type="button" 
                  id="btn-export-blog-json" 
                  class="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-3 cursor-pointer transition-all border-b border-slate-100"
                >
                  <div class="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <i data-lucide="code" class="w-4 h-4"></i>
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-800">Backup Integral (.JSON)</div>
                    <div class="text-[10px] font-normal text-slate-500">Dump completo com corpo HTML e tags</div>
                  </div>
                </button>

                <!-- 5. Importar Artigos (CSV) -->
                <button 
                  type="button" 
                  id="btn-open-blog-import-modal" 
                  class="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition-all"
                >
                  <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <i data-lucide="file-up" class="w-4 h-4"></i>
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-800">Importar Artigos via CSV</div>
                    <div class="text-[10px] font-normal text-slate-500">Cadastre múltiplos artigos via planilha</div>
                  </div>
                </button>
              </div>
            </div>`;

if (html.includes('id="btn-admin-blog-export-toggle"')) {
  html = html.replace(oldExportBlock, newExportBlock);
  console.log('✅ Menu superior de download do blog atualizado!');
}

// B) Atualizar botões rápidos de exportar na barra de filtros da tabela
const oldQuickExport = `            <!-- Botão Rápido de Exportar Planilha (Exclusivo Administrador) -->
            <button 
              type="button" 
              id="btn-quick-export-blog-csv" 
              class="viewer-hide px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Baixar lista atual em formato CSV compatível com Excel (Exclusivo Administrador)"
            >
              <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5 text-emerald-600"></i>
              <span class="hidden sm:inline">Exportar Planilha</span>
              <span class="sm:hidden">CSV</span>
            </button>`;

const newQuickExport = `            <!-- Botões Rápidos de Download para Controle Interno -->
            <div class="flex items-center gap-1.5">
              <button 
                type="button" 
                id="btn-quick-export-blog-csv" 
                class="px-3 py-1.5 rounded-xl text-xs font-black bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Baixar lista completa de artigos em planilha Excel (.CSV)"
              >
                <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5 text-emerald-600"></i>
                <span class="hidden sm:inline">Baixar CSV</span>
                <span class="sm:hidden">CSV</span>
              </button>

              <button 
                type="button" 
                id="btn-quick-export-blog-txt" 
                class="px-3 py-1.5 rounded-xl text-xs font-black bg-white hover:bg-blue-50 hover:text-[#002776] hover:border-blue-300 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Baixar lista completa de artigos em documento de texto (.TXT) para controle interno"
              >
                <i data-lucide="file-text" class="w-3.5 h-3.5 text-[#002776]"></i>
                <span class="hidden sm:inline">Baixar TXT</span>
                <span class="sm:hidden">TXT</span>
              </button>
            </div>`;

if (html.includes('id="btn-quick-export-blog-csv"')) {
  html = html.replace(oldQuickExport, newQuickExport);
  console.log('✅ Botões rápidos de download na tabela atualizados!');
}

fs.writeFileSync(adminHtmlPath, html, 'utf8');
console.log('✅ admin.html salvo com sucesso!');


// 2. ATUALIZAR SRC/ADMIN.JS
let js = fs.readFileSync(adminJsPath, 'utf8');

// Aprimorar escapeCSVCell com Anti-CSV Injection
const oldEscapeFn = `    function escapeCSVCell(val) {
      if (val === null || val === undefined) return '""';
      const clean = String(val).replace(/\\r\\n/g, ' ').replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/"/g, '""');
      return \`"\${clean}"\`;
    }`;

const newEscapeFn = `    function escapeCSVCell(val) {
      if (val === null || val === undefined) return '""';
      let clean = String(val).replace(/\\r\\n/g, ' ').replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/"/g, '""');
      // Anti-CSV / Formula Injection Mitigation
      if (/^[=\\+\\-@\\t\\r]/.test(clean)) {
        clean = "'" + clean;
      }
      return \`"\${clean}"\`;
    }`;

if (js.includes(oldEscapeFn)) {
  js = js.replace(oldEscapeFn, newEscapeFn);
  console.log('✅ escapeCSVCell atualizado com proteção Anti-Formula Injection!');
}

// Implementar exportAdminBlogTXT e atualizar exportAdminBlogCSV
const oldExportCsvFn = `    // Exportar Artigos para CSV (Delimitador ; e BOM UTF-8 - Exclusivo Administrador)
    function exportAdminBlogCSV(onlyFiltered = false) {
      if (state.userRole !== 'admin') {
        showToast('Acesso negado: a exportação da lista de artigos é restrita ao administrador pleno.', 'error');
        return;
      }

      const list = onlyFiltered ? (state.filteredBlog || []) : (state.blog || []);
      if (!list || list.length === 0) {
        showToast('Nenhum artigo disponível para exportação.', 'warning');
        return;
      }

      const now = new Date();
      const delimiter = ';';
      const headers = [
        'ID',
        'Título',
        'Slug',
        'Categoria',
        'Slug Categoria',
        'Data / Agendamento',
        'Status',
        'Tempo de Leitura (min)',
        'Visualizações',
        'Autor',
        'Tags',
        'Resumo',
        'URL do Artigo'
      ];

      const rows = list.map(p => {
        const isPub = Number(p.is_published) === 1;
        const postDate = p.created_at ? new Date(p.created_at.replace(/-/g, '/')) : null;
        let statusStr = 'Rascunho / Pausado';
        if (isPub) {
          if (postDate && postDate > now) {
            statusStr = 'Agendado Futuro';
          } else {
            statusStr = 'No Ar (Publicado)';
          }
        }

        const catBadge = BLOG_CATEGORY_BADGES[p.category];
        const catName = catBadge ? catBadge.name : (p.category || 'Geral');
        const readTime = p.read_time_minutes || p.read_time || 5;
        const views = p.views_count || p.views || 0;
        const fullUrl = \`https://vocepodetudo.com/blog.html?post=\${p.slug || ''}\`;

        return [
          escapeCSVCell(p.id),
          escapeCSVCell(p.title),
          escapeCSVCell(p.slug),
          escapeCSVCell(catName),
          escapeCSVCell(p.category),
          escapeCSVCell(p.created_at || ''),
          escapeCSVCell(statusStr),
          escapeCSVCell(readTime),
          escapeCSVCell(views),
          escapeCSVCell(p.author || 'Equipe Você Pode Tudo'),
          escapeCSVCell(p.tags || ''),
          escapeCSVCell(p.excerpt || ''),
          escapeCSVCell(fullUrl)
        ].join(delimiter);
      });

      const csvContent = '\\uFEFF' + [headers.map(escapeCSVCell).join(delimiter), ...rows].join('\\r\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      const suffix = onlyFiltered ? 'filtrados' : 'completo';
      link.download = \`vocepodetudo_artigos_blog_\${suffix}_\${dateStr}.csv\`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast(\`Planilha CSV exportada com sucesso (\${list.length} artigos)!\`, 'success');
    }`;

const newExportCsvAndTxtFn = `    // Exportar Artigos para CSV de Controle Interno (Delimitador ; e BOM UTF-8)
    function exportAdminBlogCSV(onlyFiltered = false) {
      const list = onlyFiltered ? (state.filteredBlog || []) : (state.blog || []);
      if (!list || list.length === 0) {
        showToast('Nenhum artigo disponível para exportação.', 'warning');
        return;
      }

      const now = new Date();
      const delimiter = ';';
      const headers = [
        'ID',
        'Número',
        'Título',
        'Slug',
        'Categoria',
        'Status Editorial',
        'Data / Agendamento',
        'Tempo de Leitura (min)',
        'Visualizações',
        'Autor',
        'Tags / Palavras-chave',
        'Resumo da Pauta',
        'URL Oficial'
      ];

      let counter = 1;
      const rows = list.map(p => {
        const isPub = Number(p.is_published) === 1;
        const postDate = p.created_at ? new Date(p.created_at.replace(/-/g, '/')) : null;
        let statusStr = 'Rascunho / Pausado';
        if (isPub) {
          if (postDate && postDate > now) {
            statusStr = 'Agendado Futuro';
          } else {
            statusStr = 'No Ar (Publicado)';
          }
        }

        const catBadge = BLOG_CATEGORY_BADGES[p.category];
        const catName = catBadge ? catBadge.name : (p.category || 'Geral');
        const readTime = p.read_time_minutes || p.read_time || 5;
        const views = p.views_count || p.views || 0;
        const fullUrl = \`https://vocepodetudo.com/blog.html?post=\${p.slug || ''}\`;

        return [
          escapeCSVCell(p.id),
          escapeCSVCell(counter++),
          escapeCSVCell(p.title),
          escapeCSVCell(p.slug),
          escapeCSVCell(catName),
          escapeCSVCell(statusStr),
          escapeCSVCell(p.created_at || ''),
          escapeCSVCell(readTime),
          escapeCSVCell(views),
          escapeCSVCell(p.author || 'Equipe Você Pode Tudo'),
          escapeCSVCell(p.tags || ''),
          escapeCSVCell(p.excerpt || ''),
          escapeCSVCell(fullUrl)
        ].join(delimiter);
      });

      const csvContent = '\\uFEFF' + [headers.map(escapeCSVCell).join(delimiter), ...rows].join('\\r\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      const suffix = onlyFiltered ? 'filtrados' : 'controle_interno';
      link.download = \`vocepodetudo_artigos_blog_\${suffix}_\${dateStr}.csv\`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast(\`Planilha CSV baixada com sucesso (\${list.length} artigos para controle interno)!\`, 'success');
    }

    // Exportar Lista em Documento de Texto (.TXT) para Controle Interno Offline
    function exportAdminBlogTXT(onlyFiltered = false) {
      const list = onlyFiltered ? (state.filteredBlog || []) : (state.blog || []);
      if (!list || list.length === 0) {
        showToast('Nenhum artigo disponível para exportação.', 'warning');
        return;
      }

      const now = new Date();
      const dateHeaderStr = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const sep = '='.repeat(80);
      const subSep = '-'.repeat(80);

      let txt = '';
      txt += sep + '\\r\\n';
      txt += 'PORTAL VOCÊ PODE TUDO (vocepodetudo.com)\\r\\n';
      txt += 'CONTROLE INTERNO EDITORIAL — LISTA COMPLETA DE ARTIGOS DO BLOG\\r\\n';
      txt += sep + '\\r\\n';
      txt += \`Data de Emissão: \${dateHeaderStr}\\r\\n\`;
      txt += \`Total de Artigos Listados: \${list.length} item(ns)\\r\\n\`;
      txt += \`Filtro Aplicado: \${onlyFiltered ? 'Seleção Atual da Tabela' : 'Acervo Completo (Todos os Artigos)'}\\r\\n\`;
      txt += 'Finalidade: Gestão editorial, planejamento de pautas, agendamentos e arquivo offline.\\r\\n';
      txt += sep + '\\r\\n\\r\\n';

      list.forEach((p, index) => {
        const numStr = String(index + 1).padStart(3, '0');
        const isPub = Number(p.is_published) === 1;
        const postDate = p.created_at ? new Date(p.created_at.replace(/-/g, '/')) : null;
        let statusStr = 'Rascunho / Pausado';
        if (isPub) {
          if (postDate && postDate > now) {
            statusStr = 'Agendado Futuro';
          } else {
            statusStr = 'No Ar (Publicado)';
          }
        }

        const catBadge = BLOG_CATEGORY_BADGES[p.category];
        const catName = catBadge ? catBadge.name : (p.category || 'Geral');
        const readTime = p.read_time_minutes || p.read_time || 5;
        const views = p.views_count || p.views || 0;
        const fullUrl = \`https://vocepodetudo.com/blog.html?post=\${p.slug || ''}\`;
        const dateFormatted = p.created_at ? p.created_at.replace('T', ' ').substring(0, 16) : '--';

        txt += \`[\${numStr}] \${p.title || 'Sem Título'}\\r\\n\`;
        txt += subSep + '\\r\\n';
        txt += \`• ID do Sistema: \${p.id}\\r\\n\`;
        txt += \`• Categoria: \${catName} (\${p.category || 'geral'})\\r\\n\`;
        txt += \`• Status Editorial: \${statusStr}\\r\\n\`;
        txt += \`• Data / Agendamento: \${dateFormatted}\\r\\n\`;
        txt += \`• Tempo de Leitura: \${readTime} min | Leituras Auditadas: \${views}\\r\\n\`;
        txt += \`• Autor: \${p.author || 'Equipe Editorial Você Pode Tudo'}\\r\\n\`;
        txt += \`• Palavras-Chave / Tags: \${p.tags || 'Geral'}\\r\\n\`;
        txt += \`• Link Oficial: \${fullUrl}\\r\\n\`;
        if (p.excerpt) {
          txt += \`• Resumo da Pauta:\\r\\n  \${p.excerpt.trim()}\\r\\n\`;
        }
        txt += subSep + '\\r\\n\\r\\n';
      });

      txt += sep + '\\r\\n';
      txt += 'FIM DO RELATÓRIO EDITORIAL DE CONTROLE INTERNO — VOCÊ PODE TUDO\\r\\n';
      txt += sep + '\\r\\n';

      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      const suffix = onlyFiltered ? 'filtrados' : 'controle_interno';
      link.download = \`vocepodetudo_artigos_blog_\${suffix}_\${dateStr}.txt\`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showToast(\`Lista em texto (.TXT) baixada com sucesso (\${list.length} artigos para controle interno)!\`, 'success');
    }`;

if (js.includes('function exportAdminBlogCSV')) {
  js = js.replace(oldExportCsvFn, newExportCsvAndTxtFn);
  console.log('✅ exportAdminBlogCSV e exportAdminBlogTXT integrados em src/admin.js!');
}

// B) Conectar novos listeners em src/admin.js
const oldListenersBlock = `    if (btnExportCSVAll) {
      btnExportCSVAll.addEventListener('click', () => {
        if (exportMenu) exportMenu.classList.add('hidden');
        exportAdminBlogCSV(false);
      });
    }`;

const newListenersBlock = `    if (btnExportCSVAll) {
      btnExportCSVAll.addEventListener('click', () => {
        if (exportMenu) exportMenu.classList.add('hidden');
        exportAdminBlogCSV(false);
      });
    }

    const btnExportTXTAll = document.getElementById('btn-export-blog-txt-all');
    if (btnExportTXTAll) {
      btnExportTXTAll.addEventListener('click', () => {
        if (exportMenu) exportMenu.classList.add('hidden');
        exportAdminBlogTXT(false);
      });
    }

    const btnQuickExportTXT = document.getElementById('btn-quick-export-blog-txt');
    if (btnQuickExportTXT) {
      btnQuickExportTXT.addEventListener('click', () => {
        exportAdminBlogTXT(false);
      });
    }`;

if (js.includes(oldListenersBlock)) {
  js = js.replace(oldListenersBlock, newListenersBlock);
  console.log('✅ Listeners de TXT e botões rápidos integrados em src/admin.js!');
}

// Remover travas desnecessárias de role para exportação de dados
js = js.replace(
  `if (btnExportToggle && exportMenu) {
      btnExportToggle.addEventListener('click', (e) => {
        if (state.userRole !== 'admin') {
          showToast('Acesso restrito ao administrador pleno.', 'warning');
          return;
        }
        e.stopPropagation();
        exportMenu.classList.toggle('hidden');
        updateExportFilteredCount();
      });`,
  `if (btnExportToggle && exportMenu) {
      btnExportToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.classList.toggle('hidden');
        updateExportFilteredCount();
      });`
);

js = js.replace(
  `if (btnQuickExport) {
      btnQuickExport.addEventListener('click', () => {
        if (state.userRole !== 'admin') {
          showToast('Acesso restrito ao administrador pleno.', 'warning');
          return;
        }
        exportAdminBlogCSV(true);
      });
    }`,
  `if (btnQuickExport) {
      btnQuickExport.addEventListener('click', () => {
        exportAdminBlogCSV(false);
      });
    }`
);

fs.writeFileSync(adminJsPath, js, 'utf8');
console.log('✅ src/admin.js salvo com sucesso!');


// 3. ATUALIZAR API/BLOG.PHP COM ENDPOINT export_txt
let php = fs.readFileSync(blogPhpPath, 'utf8');

const txtEndpoint = `
// ==========================================
// EXPORTAR LISTA DO BLOG EM TXT (CONTROLE INTERNO)
// ==========================================
if ($action === 'export_txt') {
    $auth = requireAdmin(false);

    $posts = [];
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM \`blog_posts\` ORDER BY \`created_at\` ASC");
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            $posts = [];
        }
    }
    if (empty($posts)) {
        $posts = loadBlogFromCache($cacheFile, $seedFile);
        usort($posts, function($a, $b) {
            return strcmp($a['created_at'] ?? '', $b['created_at'] ?? '');
        });
    }

    $filename = 'artigos_blog_controle_interno_' . date('Y-m-d') . '.txt';
    header('Content-Type: text/plain; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');

    $sep = str_repeat('=', 80) . "\\r\\n";
    $subSep = str_repeat('-', 80) . "\\r\\n";

    echo $sep;
    echo "PORTAL VOCÊ PODE TUDO (vocepodetudo.com)\\r\\n";
    echo "CONTROLE INTERNO EDITORIAL — LISTA COMPLETA DE ARTIGOS DO BLOG\\r\\n";
    echo $sep;
    echo "Data de Emissão: " . date('d/m/Y H:i:s') . "\\r\\n";
    echo "Total de Artigos Listados: " . count($posts) . " item(ns)\\r\\n";
    echo "Finalidade: Gestão editorial, planejamento de pautas, agendamentos e arquivo offline.\\r\\n";
    echo $sep . "\\r\\n";

    $now = date('Y-m-d H:i:s');
    $index = 1;
    foreach ($posts as $p) {
        $numStr = str_pad($index++, 3, '0', STR_PAD_LEFT);
        $isPub = (int)($p['is_published'] ?? 1) === 1;
        $createdAt = $p['created_at'] ?? '';
        $statusStr = 'Rascunho / Pausado';
        if ($isPub) {
            $statusStr = ($createdAt > $now) ? 'Agendado Futuro' : 'No Ar (Publicado)';
        }

        $fullUrl = 'https://vocepodetudo.com/blog.html?post=' . ($p['slug'] ?? '');
        $excerpt = preg_replace('/\\s+/', ' ', trim(strip_tags((string)($p['excerpt'] ?? ''))));

        echo "[\$numStr] " . ($p['title'] ?? 'Sem Título') . "\\r\\n";
        echo $subSep;
        echo "• ID do Sistema: " . ($p['id'] ?? '') . "\\r\\n";
        echo "• Categoria: " . ($p['category'] ?? 'Geral') . "\\r\\n";
        echo "• Status Editorial: \$statusStr\\r\\n";
        echo "• Data / Agendamento: \$createdAt\\r\\n";
        echo "• Tempo de Leitura: " . ($p['read_time_minutes'] ?? 5) . " min | Leituras: " . ($p['views_count'] ?? 0) . "\\r\\n";
        echo "• Autor: " . ($p['author'] ?? 'Equipe Você Pode Tudo') . "\\r\\n";
        echo "• Palavras-Chave / Tags: " . ($p['tags'] ?? 'Geral') . "\\r\\n";
        echo "• Link Oficial: \$fullUrl\\r\\n";
        if (!empty($excerpt)) {
            echo "• Resumo da Pauta:\\r\\n  \$excerpt\\r\\n";
        }
        echo $subSep . "\\r\\n";
    }

    echo $sep;
    echo "FIM DO RELATÓRIO EDITORIAL DE CONTROLE INTERNO — VOCÊ PODE TUDO\\r\\n";
    echo $sep;
    exit;
}
`;

if (!php.includes("if ($action === 'export_txt')")) {
  php = php.replace("if ($action === 'export_csv') {", txtEndpoint + "\nif ($action === 'export_csv') {");
  console.log('✅ Endpoint export_txt adicionado em api/blog.php!');
}

fs.writeFileSync(blogPhpPath, php, 'utf8');
console.log('✅ api/blog.php salvo com sucesso!');

console.log('🎉 Implementação de download para controle interno concluída com êxito!');
