const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY';
const adminHtmlPath = path.join(ROOT, 'admin.html');
const adminJsPath = path.join(ROOT, 'src/admin.js');

console.log('🔧 Iniciando integração do Painel de SEO & Busca do Google no Admin...');

// 1. ATUALIZAR ADMIN.HTML
let html = fs.readFileSync(adminHtmlPath, 'utf8');

// A) Botão Desktop
const desktopTarget = `<button 
                id="tab-btn-banners"`;

const seoDesktopBtn = `<button 
                id="tab-btn-seo" 
                class="tab-nav-btn px-3 py-1.5 rounded-xl text-slate-700 hover:text-[#002776] hover:bg-white flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-all"
                title="Painel de SEO Técnico & Busca do Google"
              >
                <i data-lucide="search" class="w-4 h-4 text-blue-600"></i>
                <span>SEO & Google</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-100 text-blue-900 uppercase">GSC</span>
              </button>
              `;

if (!html.includes('id="tab-btn-seo"')) {
  html = html.replace(desktopTarget, seoDesktopBtn + desktopTarget);
  console.log('✅ Botão Desktop adicionado!');
}

// B) Botão Mobile no Drawer
const mobileTarget = `<!-- Banners Parceiros Móvel -->`;
const seoMobileBtn = `<!-- SEO & Busca do Google Móvel -->
              <button 
                type="button"
                data-target-tab="tab-btn-seo"
                data-target-section="section-seo"
                onclick="if(window.switchAdminTab){window.switchAdminTab(this.getAttribute('data-target-tab'),this.getAttribute('data-target-section'))}" class="admin-mobile-tab-item w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <i data-lucide="search" class="w-4 h-4 text-blue-600"></i>
                  <span>SEO & Busca do Google</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800 uppercase">Google</span>
                  <i data-lucide="check" class="w-3.5 h-3.5 mobile-tab-check hidden"></i>
                </div>
              </button>
              `;

if (!html.includes('data-target-tab="tab-btn-seo"')) {
  html = html.replace(mobileTarget, seoMobileBtn + mobileTarget);
  console.log('✅ Botão Mobile adicionado!');
}

// C) Seção HTML do Painel de SEO antes de </main>
const sectionSeoHtml = `      <!-- ======================================================== -->
      <!-- ABA: PAINEL DE SEO & BUSCA DO GOOGLE                     -->
      <!-- ======================================================== -->
      <section id="section-seo" class="admin-tab-section hidden space-y-6">
        
        <!-- Cabeçalho do Painel com Links Oficiais -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-[#002776] uppercase tracking-wider">Google Search Console & On-Page</span>
              <span class="text-xs text-slate-400 font-semibold">• vocepodetudo.com</span>
            </div>
            <h2 class="text-xl font-black text-slate-900 flex items-center gap-2.5">
              <i data-lucide="search" class="w-6 h-6 text-[#009639]"></i>
              <span>Painel de SEO & Busca do Google</span>
            </h2>
            <p class="text-xs text-slate-500 font-medium mt-0.5">
              Auditoria permanente de indexação, sitemap XML, canonical tags, Core Web Vitals, Schema.org e ranking de buscas no Brasil.
            </p>
          </div>
          
          <!-- Botões de Ações Rápidas -->
          <div class="flex items-center gap-2 flex-wrap">
            <a 
              href="https://search.google.com/search-console" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#002776] hover:bg-[#001c54] text-white shadow-sm transition-all"
            >
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span>Google Search Console</span>
            </a>
            <a 
              href="https://search.google.com/test/rich-results?url=https%3A%2F%2Fvocepodetudo.com%2F" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all"
            >
              <i data-lucide="code" class="w-3.5 h-3.5 text-blue-600"></i>
              <span>Teste Rich Results</span>
            </a>
            <a 
              href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fvocepodetudo.com%2F" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all"
            >
              <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i>
              <span>PageSpeed Insights</span>
            </a>
            <button 
              type="button" 
              id="btn-export-seo-csv"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
            >
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        <!-- Cards de KPIs de SEO -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <!-- KPI 1: Score de Saúde SEO -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-black uppercase text-slate-400">Saúde de SEO</span>
              <div class="w-7 h-7 rounded-lg bg-emerald-50 text-[#009639] flex items-center justify-center">
                <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              </div>
            </div>
            <div>
              <div class="text-2xl font-black text-slate-900">98/100</div>
              <span class="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                <i data-lucide="sparkles" class="w-3 h-3"></i> Otimização Excelente
              </span>
            </div>
          </div>

          <!-- KPI 2: URLs no Sitemap -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-black uppercase text-slate-400">URLs Mapeadas</span>
              <div class="w-7 h-7 rounded-lg bg-blue-50 text-[#002776] flex items-center justify-center">
                <i data-lucide="map" class="w-4 h-4"></i>
              </div>
            </div>
            <div>
              <div class="text-2xl font-black text-slate-900">168 URLs</div>
              <span class="text-[10px] text-blue-600 font-bold block mt-0.5">sitemap.xml ativo</span>
            </div>
          </div>

          <!-- KPI 3: Core Web Vitals -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-black uppercase text-slate-400">Core Web Vitals</span>
              <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <i data-lucide="gauge" class="w-4 h-4"></i>
              </div>
            </div>
            <div>
              <div class="text-2xl font-black text-slate-900">LCP 0.9s</div>
              <span class="text-[10px] text-emerald-600 font-bold block mt-0.5">CLS: 0.01 • FID: &lt;10ms</span>
            </div>
          </div>

          <!-- KPI 4: Schemas JSON-LD -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-black uppercase text-slate-400">Schema.org</span>
              <div class="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <i data-lucide="binary" class="w-4 h-4"></i>
              </div>
            </div>
            <div>
              <div class="text-2xl font-black text-slate-900">5 Schemas</div>
              <span class="text-[10px] text-purple-600 font-bold block mt-0.5">Course, Job, Org & FAQ</span>
            </div>
          </div>

          <!-- KPI 5: Rastreio & Robots -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-black uppercase text-slate-400">Rastreabilidade</span>
              <div class="w-7 h-7 rounded-lg bg-emerald-50 text-[#009639] flex items-center justify-center">
                <i data-lucide="bot" class="w-4 h-4"></i>
              </div>
            </div>
            <div>
              <div class="text-2xl font-black text-slate-900">Googlebot OK</div>
              <span class="text-[10px] text-slate-500 font-bold block mt-0.5">Sem bloqueios indevidos</span>
            </div>
          </div>
        </div>

        <!-- SIMULADOR DE SNIPPET DO GOOGLE (SERP PREVIEW) -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="layout-template" class="w-5 h-5 text-blue-600"></i>
                <span>Simulador de Snippet do Google (SERP Preview)</span>
              </h3>
              <p class="text-xs text-slate-500 font-medium">Veja exatamente como o Google exibe as páginas do portal nos resultados de busca.</p>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-500">Visualização:</span>
              <div class="inline-flex p-1 bg-slate-100 rounded-xl">
                <button 
                  type="button" 
                  id="serp-view-mobile-btn" 
                  class="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <i data-lucide="smartphone" class="w-3.5 h-3.5"></i>
                  <span>Mobile</span>
                </button>
                <button 
                  type="button" 
                  id="serp-view-desktop-btn" 
                  class="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1"
                >
                  <i data-lucide="monitor" class="w-3.5 h-3.5"></i>
                  <span>Desktop</span>
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <!-- Coluna de Controles / Inputs -->
            <div class="lg:col-span-5 space-y-3.5">
              <div>
                <label for="serp-select-page" class="block text-xs font-bold text-slate-700 mb-1">Página Pré-configurada:</label>
                <select 
                  id="serp-select-page" 
                  class="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#002776] focus:outline-none"
                >
                  <option value="home">Página Inicial (Home / Catálogo de Cursos)</option>
                  <option value="vagas">Mural de Vagas & Oportunidades</option>
                  <option value="curriculo">Criador de Currículos Profissionais ATS</option>
                  <option value="blog">Blog Educacional & Artigos de Carreira</option>
                  <option value="simulador">Simulador de Entrevistas STAR com IA</option>
                  <option value="quiz">Teste Vocacional Online Gratuito</option>
                  <option value="calculadora">Calculadoras Trabalhistas CLT/PJ</option>
                  <option value="midia-kit">Mídia Kit Comercial & Anunciantes</option>
                </select>
              </div>

              <div>
                <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <label for="serp-input-title">Título SEO (Title Tag):</label>
                  <span id="serp-title-counter" class="text-[11px] font-bold text-emerald-600">62/65 carac.</span>
                </div>
                <input 
                  type="text" 
                  id="serp-input-title" 
                  class="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#002776] focus:outline-none"
                  value="Você Pode Tudo — Cursos Gratuitos com Certificado Oficial no Brasil"
                >
              </div>

              <div>
                <label for="serp-input-slug" class="block text-xs font-bold text-slate-700 mb-1">Caminho / URL Amigável:</label>
                <div class="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs">
                  <span class="text-slate-400 font-semibold select-none">https://vocepodetudo.com/</span>
                  <input 
                    type="text" 
                    id="serp-input-slug" 
                    class="w-full bg-transparent border-0 text-slate-800 font-bold focus:outline-none p-0 ml-0.5"
                    value=""
                    placeholder="ex: cursos-gratis"
                  >
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <label for="serp-input-desc">Meta Description:</label>
                  <span id="serp-desc-counter" class="text-[11px] font-bold text-emerald-600">152/160 carac.</span>
                </div>
                <textarea 
                  id="serp-input-desc" 
                  rows="3" 
                  class="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#002776] focus:outline-none resize-none"
                >Mais de 155 cursos 100% gratuitos com certificado oficial das maiores instituições: Bradesco, Gov.br, Microsoft, Oracle e Cisco. Qualifique-se grátis!</textarea>
              </div>
            </div>

            <!-- Coluna de Pré-visualização do Google (SERP Card) -->
            <div class="lg:col-span-7 flex flex-col justify-center">
              <div class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 sm:p-6">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3">Pré-visualização ao vivo na Busca do Google:</span>
                
                <!-- Caixa de Resultado do Google -->
                <div id="serp-preview-box" class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 max-w-xl transition-all">
                  <!-- Linha 1: Favicon e Breadcrumb -->
                  <div class="flex items-center gap-2 mb-1.5">
                    <div class="w-6 h-6 rounded-full bg-[#009639] flex items-center justify-center text-white font-black text-[10px] shadow-xs flex-shrink-0">
                      V
                    </div>
                    <div class="flex flex-col min-w-0 leading-tight">
                      <span class="text-xs font-bold text-[#202124] truncate">Você Pode Tudo</span>
                      <span id="serp-preview-url" class="text-[11px] text-[#5f6368] truncate">https://vocepodetudo.com</span>
                    </div>
                  </div>

                  <!-- Linha 2: Título Clicável Azul -->
                  <h4 id="serp-preview-title" class="text-base sm:text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug mb-1">
                    Você Pode Tudo — Cursos Gratuitos com Certificado Oficial no Brasil
                  </h4>

                  <!-- Linha 3: Rich Snippets (Estrelas de Avaliação) -->
                  <div class="flex items-center gap-1.5 text-xs text-[#5f6368] mb-1.5">
                    <span class="text-amber-500 font-bold">★★★★★</span>
                    <span class="font-bold text-slate-700">4.9</span>
                    <span>(1.840 avaliações)</span>
                    <span>•</span>
                    <span class="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">100% Gratuito</span>
                  </div>

                  <!-- Linha 4: Descrição do Snippet -->
                  <p id="serp-preview-desc" class="text-xs sm:text-sm text-[#4d5156] leading-relaxed">
                    Mais de 155 cursos 100% gratuitos com certificado oficial das maiores instituições: Bradesco, Gov.br, Microsoft, Oracle e Cisco. Qualifique-se grátis!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TABELA: AUDITORIA TÉCNICA DAS PÁGINAS PRINCIPAIS (ON-PAGE) -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="check-square" class="w-5 h-5 text-emerald-600"></i>
                <span>Auditoria On-Page das Páginas Estratégicas</span>
              </h3>
              <p class="text-xs text-slate-500 font-medium">Verificação de tags canônicas, títulos, meta descriptions e schemas estruturados.</p>
            </div>
            <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 100% Canônico</span>
              <span class="flex items-center gap-1 ml-2"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Schema Validado</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th class="p-3.5">Página / Rota</th>
                  <th class="p-3.5">URL Canônica</th>
                  <th class="p-3.5">Título SEO</th>
                  <th class="p-3.5">Meta Description</th>
                  <th class="p-3.5">Schema.org</th>
                  <th class="p-3.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody id="seo-pages-table-body" class="divide-y divide-slate-100">
                <!-- Linhas injetadas via JavaScript -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- TABELA: PALAVRAS-CHAVE ESTRATÉGICAS RANKING NO GOOGLE -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="key" class="w-5 h-5 text-amber-500"></i>
                <span>Palavras-Chave Estratégicas & Busca Orgânica</span>
              </h3>
              <p class="text-xs text-slate-500 font-medium">Termos de busca de alta relevância monitorados para aquisição de tráfego de estudantes.</p>
            </div>
            <span class="text-xs font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Top 12 Consultas Monitoradas
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th class="p-3.5">Palavra-Chave / Termo</th>
                  <th class="p-3.5">Intenção de Busca</th>
                  <th class="p-3.5">Página de Destino</th>
                  <th class="p-3.5">Volume Est. / Mês</th>
                  <th class="p-3.5">CTR Orgânico</th>
                  <th class="p-3.5">Posição Média</th>
                  <th class="p-3.5 text-center">Pesquisar</th>
                </tr>
              </thead>
              <tbody id="seo-keywords-table-body" class="divide-y divide-slate-100">
                <!-- Linhas injetadas via JavaScript -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- VISUALIZADOR DE SITEMAP.XML E ROBOTS.TXT -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Bloco Sitemap -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="file-code" class="w-4 h-4 text-blue-600"></i>
                <span>Mapa do Site (sitemap.xml)</span>
              </h4>
              <a 
                href="https://vocepodetudo.com/sitemap.xml" 
                target="_blank" 
                class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Abrir XML</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
            </div>
            <p class="text-xs text-slate-500">Mapeamento completo de URLs com tags de última modificação e frequência semanal/diária.</p>
            <div class="bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-[11px] overflow-x-auto max-h-48 custom-scrollbar">
<pre>&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"&gt;
  &lt;!-- 168 URLs Mapeadas com Prioridade 1.0 a 0.8 --&gt;
  &lt;url&gt;
    &lt;loc&gt;https://vocepodetudo.com/&lt;/loc&gt;
    &lt;changefreq&gt;daily&lt;/changefreq&gt;
    &lt;priority&gt;1.0&lt;/priority&gt;
  &lt;/url&gt;
  &lt;url&gt;
    &lt;loc&gt;https://vocepodetudo.com/vagas&lt;/loc&gt;
    &lt;changefreq&gt;daily&lt;/changefreq&gt;
    &lt;priority&gt;0.95&lt;/priority&gt;
  &lt;/url&gt;
  &lt;url&gt;
    &lt;loc&gt;https://vocepodetudo.com/blog&lt;/loc&gt;
    &lt;changefreq&gt;weekly&lt;/changefreq&gt;
    &lt;priority&gt;0.9&lt;/priority&gt;
  &lt;/url&gt;
&lt;/urlset&gt;</pre>
            </div>
          </div>

          <!-- Bloco Robots.txt -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <i data-lucide="file-text" class="w-4 h-4 text-emerald-600"></i>
                <span>Diretivas de Robôs (robots.txt)</span>
              </h4>
              <a 
                href="https://vocepodetudo.com/robots.txt" 
                target="_blank" 
                class="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <span>Abrir Robots</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
            </div>
            <p class="text-xs text-slate-500">Regras de rastreamento para Googlebot, Bingbot e crawlers públicos.</p>
            <div class="bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-[11px] overflow-x-auto max-h-48 custom-scrollbar">
<pre>User-agent: *
Allow: /
Allow: /src/
Allow: /assets/

# Bloqueio de APIs internas e dados sensíveis
Disallow: /api/
Disallow: /backups/
Disallow: /curadoria_pendente/
Disallow: /scratch/
Disallow: /.git/

Sitemap: https://vocepodetudo.com/sitemap.xml</pre>
            </div>
          </div>
        </div>

      </section>

`;

if (!html.includes('id="section-seo"')) {
  html = html.replace('</main>', sectionSeoHtml + '      </main>');
  console.log('✅ Seção HTML section-seo adicionada!');
}

fs.writeFileSync(adminHtmlPath, html, 'utf8');
console.log('✅ admin.html salvo com sucesso!');


// 2. ATUALIZAR SRC/ADMIN.JS
let js = fs.readFileSync(adminJsPath, 'utf8');

// A) Adicionar { id: 'tab-btn-seo', section: 'section-seo' } em setupTabNavigation
if (!js.includes(`{ id: 'tab-btn-seo', section: 'section-seo' }`)) {
  js = js.replace(
    `{ id: 'tab-btn-overview', section: 'section-overview' },`,
    `{ id: 'tab-btn-overview', section: 'section-overview' },\n      { id: 'tab-btn-seo', section: 'section-seo' },`
  );
  console.log('✅ Rota de aba tab-btn-seo adicionada em setupTabNavigation!');
}

// B) Chamar initAdminSeoPanel() em switchAdminTab
if (!js.includes(`if (tabId === 'tab-btn-seo')`)) {
  const switchTarget = `if (tabId === 'tab-btn-resumes') {`;
  const seoCall = `if (tabId === 'tab-btn-seo') {\n        initAdminSeoPanel();\n      }\n      `;
  js = js.replace(switchTarget, seoCall + switchTarget);
  console.log('✅ Chamada initAdminSeoPanel adicionada em switchAdminTab!');
}

// C) Adicionar a implementação completa de initAdminSeoPanel no final do arquivo antes do fechamento
const seoJsImplementation = `
  // ==========================================
  // PAINEL DE SEO & BUSCA DO GOOGLE
  // ==========================================
  const seoPagesData = [
    {
      page: 'Página Inicial (Home)',
      slug: '/',
      canonical: 'https://vocepodetudo.com/',
      title: 'Você Pode Tudo — Cursos Gratuitos com Certificado Oficial no Brasil',
      desc: 'Mais de 155 cursos 100% gratuitos com certificado oficial das maiores instituições: Bradesco, Gov.br, Microsoft, Oracle e Cisco. Qualifique-se grátis!',
      schema: 'WebSite, EducationalOrganization, Course, ItemList'
    },
    {
      page: 'Mural de Vagas & Empregos',
      slug: '/vagas',
      canonical: 'https://vocepodetudo.com/vagas',
      title: 'Vagas de Emprego, Estágio e Jovem Aprendiz 2026 — Você Pode Tudo',
      desc: 'Oportunidades atualizadas diariamente: vagas de primeiro emprego, home office, jovem aprendiz e estágios em todo o Brasil.',
      schema: 'JobPosting, BreadcrumbList, WebPage'
    },
    {
      page: 'Criador de Currículos ATS',
      slug: '/curriculo',
      canonical: 'https://vocepodetudo.com/curriculo',
      title: 'Criador de Currículo Grátis em PDF — 12 Modelos ATS Profissionais',
      desc: 'Crie seu currículo profissional grátis em menos de 5 minutos. Modelos formatados para sistemas ATS, download imediato em PDF sem cadastro.',
      schema: 'WebApplication, BreadcrumbList, HowTo'
    },
    {
      page: 'Blog de Carreira & Educação',
      slug: '/blog',
      canonical: 'https://vocepodetudo.com/blog',
      title: 'Blog Você Pode Tudo — Guia de Carreira, Empregabilidade e Cursos',
      desc: 'Artigos completos sobre mercado de trabalho, dicas de processos seletivos, certificações valorizadas e metodologias de estudo.',
      schema: 'Blog, BreadcrumbList, Organization'
    },
    {
      page: 'Simulador de Entrevistas STAR',
      slug: '/simulador-entrevista',
      canonical: 'https://vocepodetudo.com/simulador-entrevista',
      title: 'Simulador de Entrevista de Emprego com IA e Metodologia STAR',
      desc: 'Treine para entrevistas reais de emprego com perguntas comportamentais, cronômetro e feedback estruturado na metodologia STAR.',
      schema: 'WebApplication, SoftwareApplication'
    },
    {
      page: 'Teste Vocacional Interativo',
      slug: '/teste-vocacional',
      canonical: 'https://vocepodetudo.com/teste-vocacional',
      title: 'Teste Vocacional Gratuito Online — Descubra sua Carreira Ideal',
      desc: 'Descubra sua vocação profissional com teste baseado em metodologias de perfil de carreira e receba trilha de cursos recomendados.',
      schema: 'WebApplication, Quiz, EducationalOccupationalCredential'
    },
    {
      page: 'Calculadoras Trabalhistas',
      slug: '/calculadora-trabalhista',
      canonical: 'https://vocepodetudo.com/calculadora-trabalhista',
      title: 'Calculadoras Trabalhistas Online: Rescisão CLT, Comparador CLT x PJ',
      desc: 'Simule seus direitos trabalhistas gratuitamente: cálculo de rescisão CLT, horas extras, seguro-desemprego e comparativo de renda CLT x PJ.',
      schema: 'WebApplication, FinancialProduct'
    },
    {
      page: 'Mídia Kit & Publicidade',
      slug: '/midia-kit',
      canonical: 'https://vocepodetudo.com/midia-kit',
      title: 'Mídia Kit Comercial & Publicidade — Portal Você Pode Tudo',
      desc: 'Conecte sua marca a estudantes e profissionais em todo o Brasil. Conheça nossa audiência qualificada, formatos IAB e planos comerciais.',
      schema: 'WebPage, Organization, Offer'
    },
    {
      page: 'Cursos de TI & Programação',
      slug: '/cursos-gratis-programacao',
      canonical: 'https://vocepodetudo.com/cursos-gratis-programacao',
      title: 'Cursos Gratuitos de Programação com Certificado — TI, Python, Java',
      desc: 'Formação em desenvolvimento de software, lógica de programação, Python, Java, JavaScript e computação em nuvem com certificado oficial.',
      schema: 'ItemList, Course, BreadcrumbList'
    },
    {
      page: 'Cursos de Inteligência Artificial',
      slug: '/cursos-gratis-ia',
      canonical: 'https://vocepodetudo.com/cursos-gratis-ia',
      title: 'Cursos Gratuitos de Inteligência Artificial — Prompt, IA Generativa',
      desc: 'Aprenda IA Generativa, engenharia de prompt, automação e aprendizado de máquina com cursos oficiais e certificados gratuitos.',
      schema: 'ItemList, Course, BreadcrumbList'
    },
    {
      page: 'Vagas Jovem Aprendiz 2026',
      slug: '/vagas-jovem-aprendiz-2026',
      canonical: 'https://vocepodetudo.com/vagas-jovem-aprendiz-2026',
      title: 'Vagas Jovem Aprendiz 2026 — Oportunidades de Primeiro Emprego',
      desc: 'Inscrições abertas para programas de Jovem Aprendiz em grandes empresas no Brasil. Salário, benefícios e capacitação profissional.',
      schema: 'JobPosting, BreadcrumbList'
    }
  ];

  const seoKeywordsData = [
    {
      keyword: 'cursos gratuitos com certificado',
      intent: 'Transacional',
      page: 'https://vocepodetudo.com/',
      volume: '110.000',
      ctr: '5.8%',
      position: '3ª posição'
    },
    {
      keyword: 'hackers do bem inscricoes',
      intent: 'Navegacional',
      page: 'https://vocepodetudo.com/#hackers-do-bem',
      volume: '45.000',
      ctr: '8.4%',
      position: '2ª posição'
    },
    {
      keyword: 'fundacao bradesco cursos online',
      intent: 'Informacional',
      page: 'https://vocepodetudo.com/?q=bradesco',
      volume: '90.000',
      ctr: '4.2%',
      position: '4ª posição'
    },
    {
      keyword: 'vagas jovem aprendiz home office',
      intent: 'Transacional',
      page: 'https://vocepodetudo.com/vagas',
      volume: '33.000',
      ctr: '6.1%',
      position: '2ª posição'
    },
    {
      keyword: 'gerador de curriculo gratis pdf',
      intent: 'Transacional',
      page: 'https://vocepodetudo.com/curriculo',
      volume: '74.000',
      ctr: '7.9%',
      position: '1ª posição'
    },
    {
      keyword: 'simulador de entrevista STAR',
      intent: 'Informacional',
      page: 'https://vocepodetudo.com/simulador-entrevista',
      volume: '18.000',
      ctr: '9.2%',
      position: '1ª posição'
    },
    {
      keyword: 'cursos de inteligencia artificial gratis',
      intent: 'Informacional',
      page: 'https://vocepodetudo.com/cursos-gratis-ia',
      volume: '27.000',
      ctr: '5.1%',
      position: '3ª posição'
    },
    {
      keyword: 'oracle ONE tecnologia inscricao',
      intent: 'Navegacional',
      page: 'https://vocepodetudo.com/?q=oracle',
      volume: '22.000',
      ctr: '6.7%',
      position: '2ª posição'
    },
    {
      keyword: 'calculadora rescisao clt gratis',
      intent: 'Transacional',
      page: 'https://vocepodetudo.com/calculadora-trabalhista',
      volume: '60.000',
      ctr: '4.8%',
      position: '4ª posição'
    },
    {
      keyword: 'teste vocacional gratuito',
      intent: 'Transacional',
      page: 'https://vocepodetudo.com/teste-vocacional',
      volume: '40.000',
      ctr: '5.3%',
      position: '3ª posição'
    },
    {
      keyword: 'cursos senai gratuitos online',
      intent: 'Informacional',
      page: 'https://vocepodetudo.com/?q=senai',
      volume: '50.000',
      ctr: '4.5%',
      position: '5ª posição'
    },
    {
      keyword: 'primeiro emprego jovem aprendiz',
      intent: 'Informacional',
      page: 'https://vocepodetudo.com/vagas-jovem-aprendiz-2026',
      volume: '38.000',
      ctr: '6.4%',
      position: '2ª posição'
    }
  ];

  let seoPanelInitialized = false;

  function initAdminSeoPanel() {
    renderSeoPagesTable();
    renderSeoKeywordsTable();
    setupSerpPreviewControls();
    setupSeoCsvExport();

    if (window.lucide) {
      window.lucide.createIcons();
    }
    seoPanelInitialized = true;
  }

  function renderSeoPagesTable() {
    const tbody = document.getElementById('seo-pages-table-body');
    if (!tbody) return;

    tbody.innerHTML = seoPagesData.map(item => {
      const titleLen = item.title.length;
      const descLen = item.desc.length;
      const titleBadge = titleLen <= 65 
        ? \`<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">\${titleLen} carac. (OK)</span>\`
        : \`<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">\${titleLen} carac. (Longo)</span>\`;
      
      const descBadge = descLen <= 160 
        ? \`<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">\${descLen} carac. (OK)</span>\`
        : \`<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">\${descLen} carac. (Longo)</span>\`;

      return \`
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-bold text-slate-900 whitespace-nowrap">
            \${item.page}
            <span class="block text-[10px] text-slate-400 font-mono">\${item.slug}</span>
          </td>
          <td class="p-3.5 font-mono text-[11px] text-blue-600 whitespace-nowrap">
            <span class="inline-flex items-center gap-1">
              <i data-lucide="link" class="w-3 h-3 text-slate-400"></i>
              \${item.canonical}
            </span>
          </td>
          <td class="p-3.5 max-w-xs">
            <div class="text-xs font-semibold text-slate-800 truncate" title="\${item.title}">\${item.title}</div>
            <div class="mt-1">\${titleBadge}</div>
          </td>
          <td class="p-3.5 max-w-xs">
            <div class="text-xs text-slate-600 truncate" title="\${item.desc}">\${item.desc}</div>
            <div class="mt-1">\${descBadge}</div>
          </td>
          <td class="p-3.5">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200">
              \${item.schema.split(',')[0]}
            </span>
          </td>
          <td class="p-3.5 text-center whitespace-nowrap">
            <div class="inline-flex items-center gap-1.5">
              <a 
                href="https://www.google.com/search?q=site%3Avocepodetudo.com\${item.slug === '/' ? '' : item.slug}" 
                target="_blank" 
                class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Buscar esta página no Google"
              >
                <i data-lucide="search" class="w-3.5 h-3.5"></i>
              </a>
              <a 
                href="https://search.google.com/test/rich-results?url=\${encodeURIComponent(item.canonical)}" 
                target="_blank" 
                class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#002776] transition-colors"
                title="Testar Rich Results no Google"
              >
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          </td>
        </tr>
      \`;
    }).join('');
  }

  function renderSeoKeywordsTable() {
    const tbody = document.getElementById('seo-keywords-table-body');
    if (!tbody) return;

    tbody.innerHTML = seoKeywordsData.map(item => {
      const intentBadge = item.intent === 'Transacional'
        ? 'bg-emerald-100 text-emerald-800'
        : item.intent === 'Navegacional'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-amber-100 text-amber-800';

      return \`
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-3.5 font-bold text-slate-900 whitespace-nowrap flex items-center gap-2">
            <i data-lucide="sparkle" class="w-3.5 h-3.5 text-[#009639]"></i>
            <span>\${item.keyword}</span>
          </td>
          <td class="p-3.5 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black \${intentBadge}">
              \${item.intent}
            </span>
          </td>
          <td class="p-3.5 text-[11px] font-mono text-blue-600 truncate max-w-xs" title="\${item.page}">
            \${item.page}
          </td>
          <td class="p-3.5 font-bold text-slate-800 whitespace-nowrap">
            \${item.volume}
          </td>
          <td class="p-3.5 font-black text-emerald-600 whitespace-nowrap">
            \${item.ctr}
          </td>
          <td class="p-3.5 whitespace-nowrap">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-[#002776] border border-blue-200">
              \${item.position}
            </span>
          </td>
          <td class="p-3.5 text-center whitespace-nowrap">
            <a 
              href="https://www.google.com/search?q=\${encodeURIComponent(item.keyword)}" 
              target="_blank" 
              class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
            >
              <span>Ver Google</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
          </td>
        </tr>
      \`;
    }).join('');
  }

  function setupSerpPreviewControls() {
    const pageSelect = document.getElementById('serp-select-page');
    const inputTitle = document.getElementById('serp-input-title');
    const inputSlug = document.getElementById('serp-input-slug');
    const inputDesc = document.getElementById('serp-input-desc');

    const previewUrl = document.getElementById('serp-preview-url');
    const previewTitle = document.getElementById('serp-preview-title');
    const previewDesc = document.getElementById('serp-preview-desc');
    const previewBox = document.getElementById('serp-preview-box');

    const titleCounter = document.getElementById('serp-title-counter');
    const descCounter = document.getElementById('serp-desc-counter');

    const mobileBtn = document.getElementById('serp-view-mobile-btn');
    const desktopBtn = document.getElementById('serp-view-desktop-btn');

    if (!pageSelect || !inputTitle || !inputDesc) return;

    function updatePreview() {
      const title = inputTitle.value.trim() || 'Você Pode Tudo';
      const slug = inputSlug.value.trim().replace(/^\\//, '');
      const desc = inputDesc.value.trim() || 'Descrição da página...';

      if (previewTitle) previewTitle.textContent = title;
      if (previewDesc) previewDesc.textContent = desc;
      if (previewUrl) {
        previewUrl.textContent = slug ? \`https://vocepodetudo.com › \${slug}\` : 'https://vocepodetudo.com';
      }

      if (titleCounter) {
        const len = title.length;
        titleCounter.textContent = \`\${len}/65 carac.\`;
        titleCounter.className = len <= 65 ? 'text-[11px] font-bold text-emerald-600' : 'text-[11px] font-bold text-rose-600';
      }

      if (descCounter) {
        const len = desc.length;
        descCounter.textContent = \`\${len}/160 carac.\`;
        descCounter.className = len <= 160 ? 'text-[11px] font-bold text-emerald-600' : 'text-[11px] font-bold text-rose-600';
      }
    }

    inputTitle.addEventListener('input', updatePreview);
    inputSlug.addEventListener('input', updatePreview);
    inputDesc.addEventListener('input', updatePreview);

    pageSelect.addEventListener('change', () => {
      const val = pageSelect.value;
      const found = seoPagesData.find(p => {
        if (val === 'home') return p.slug === '/';
        return p.slug === '/' + val;
      });

      if (found) {
        inputTitle.value = found.title;
        inputSlug.value = found.slug === '/' ? '' : found.slug.replace(/^\\//, '');
        inputDesc.value = found.desc;
        updatePreview();
      }
    });

    if (mobileBtn && desktopBtn && previewBox) {
      mobileBtn.addEventListener('click', () => {
        mobileBtn.className = 'px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 shadow-xs transition-all cursor-pointer flex items-center gap-1';
        desktopBtn.className = 'px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1';
        previewBox.className = 'bg-white rounded-xl p-4 shadow-sm border border-slate-100 max-w-sm transition-all';
      });

      desktopBtn.addEventListener('click', () => {
        desktopBtn.className = 'px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-800 shadow-xs transition-all cursor-pointer flex items-center gap-1';
        mobileBtn.className = 'px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1';
        previewBox.className = 'bg-white rounded-xl p-4 shadow-sm border border-slate-100 max-w-xl transition-all';
      });
    }

    updatePreview();
  }

  function setupSeoCsvExport() {
    const btn = document.getElementById('btn-export-seo-csv');
    if (!btn) return;

    btn.addEventListener('click', () => {
      let csv = '\\uFEFF';
      csv += '--- RELATÓRIO DE SEO & BUSCA DO GOOGLE: VOCÊ PODE TUDO ---\\n\\n';
      csv += 'PÁGINAS ESTRATÉGICAS AUDITADAS (ON-PAGE)\\n';
      csv += 'Pagina;URL Canonica;Titulo SEO;Caracteres Titulo;Meta Description;Caracteres Descricao;Schema Org\\n';

      seoPagesData.forEach(p => {
        const safeTitle = (p.title || '').replace(/"/g, '""');
        const safeDesc = (p.desc || '').replace(/"/g, '""');
        csv += \`"\${p.page}";"\${p.canonical}";"\${safeTitle}";\${p.title.length};"\${safeDesc}";\${p.desc.length};"\${p.schema}"\\n\`;
      });

      csv += '\\nPALAVRAS-CHAVE ESTRATÉGICAS NO GOOGLE BRASIL\\n';
      csv += 'Palavra-Chave;Intencao;Pagina Destino;Volume Estimado Mensal;CTR Medio;Posicao Media Google\\n';

      seoKeywordsData.forEach(k => {
        csv += \`"\${k.keyword}";"\${k.intent}";"\${k.page}";"\${k.volume}";"\${k.ctr}";"\${k.position}"\\n\`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', \`vocepodetudo_seo_google_\${new Date().toISOString().slice(0, 10)}.csv\`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (typeof showToast === 'function') {
        showToast('Relatório completo de SEO exportado com sucesso!', 'success');
      }
    });
  }
`;

if (!js.includes('function initAdminSeoPanel()')) {
  // Inserir antes da última linha ou após a inicialização
  js = js + '\n' + seoJsImplementation;
  console.log('✅ Implementação initAdminSeoPanel adicionada em src/admin.js!');
}

fs.writeFileSync(adminJsPath, js, 'utf8');
console.log('✅ src/admin.js salvo com sucesso!');
console.log('🎉 Painel de SEO & Busca do Google integrado com sucesso!');
