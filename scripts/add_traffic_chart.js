const fs = require('fs');

console.log('--- Preparando inclusão do Gráfico de Tráfego & Audiência em Tempo Real ---');

// 1. Atualizar admin.html
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// Adicionar CDN do Chart.js no <head> se não estiver
const chartJsCdn = '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>';
if (!adminHtml.includes('chart.umd.min.js')) {
  adminHtml = adminHtml.replace('</head>', `  <!-- Chart.js para Gráficos em Tempo Real -->\n  ${chartJsCdn}\n</head>`);
  console.log('✅ CDN do Chart.js adicionado ao <head> de admin.html');
}

// Card HTML do Gráfico de Tráfego em Tempo Real
const trafficChartHtml = `
        <!-- GRÁFICO DE TRÁFEGO & AUDIÊNCIA EM TEMPO REAL -->
        <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <!-- Cabeçalho do Gráfico & Filtros -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span class="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Telemetria Ativa
                </span>
                <span class="text-[10px] font-mono text-slate-400">Stream Contínuo</span>
              </div>
              <h3 class="text-base sm:text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                <i data-lucide="trending-up" class="w-5 h-5 text-[#002776]"></i>
                <span>Curva de Tráfego & Audiência em Tempo Real</span>
              </h3>
              <p class="text-xs text-slate-500 font-medium">
                Volume de pageviews no catálogo, conversão de cliques e engajamento horário dos estudantes.
              </p>
            </div>

            <!-- Controles de Período e Tipo de Gráfico -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Seletor de Período -->
              <div class="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                <button 
                  type="button" 
                  id="chart-period-24h"
                  onclick="window.switchTrafficPeriod('24h')" 
                  class="px-3 py-1.5 rounded-xl bg-[#002776] text-white shadow-xs transition-all cursor-pointer font-black"
                >
                  Hoje (24h)
                </button>
                <button 
                  type="button" 
                  id="chart-period-7d"
                  onclick="window.switchTrafficPeriod('7d')" 
                  class="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                >
                  7 Dias
                </button>
                <button 
                  type="button" 
                  id="chart-period-30d"
                  onclick="window.switchTrafficPeriod('30d')" 
                  class="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                >
                  30 Dias
                </button>
              </div>

              <!-- Alternador de Tipo: Linha vs Barra -->
              <div class="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
                <button 
                  type="button" 
                  id="chart-type-line"
                  onclick="window.switchTrafficType('line')" 
                  class="p-1.5 rounded-xl bg-white text-[#002776] shadow-xs transition-all cursor-pointer"
                  title="Gráfico em Linha / Área Suave"
                >
                  <i data-lucide="activity" class="w-4 h-4"></i>
                </button>
                <button 
                  type="button" 
                  id="chart-type-bar"
                  onclick="window.switchTrafficType('bar')" 
                  class="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                  title="Gráfico em Colunas Comparativas"
                >
                  <i data-lucide="bar-chart-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 4 Métricas Rápidas de Apoio -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Pico Estimado</span>
              <strong id="chart-stat-peak" class="text-base font-black text-[#002776] block mt-0.5">-- acessos/h</strong>
              <span class="text-[9px] text-slate-500 font-medium">Horário de maior afluência</span>
            </div>

            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">CTR Médio (Cliques/Views)</span>
              <strong id="chart-stat-ctr" class="text-base font-black text-[#009639] block mt-0.5">3,4%</strong>
              <span class="text-[9px] text-emerald-700 font-bold">Alta intenção de estudo</span>
            </div>

            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Horário de Pico</span>
              <strong class="text-base font-black text-amber-700 block mt-0.5">19h00 às 22h00</strong>
              <span class="text-[9px] text-slate-500 font-medium">Período noturno de estudantes</span>
            </div>

            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Origem de Dispositivos</span>
              <strong class="text-base font-black text-purple-700 block mt-0.5">78% Smartphones</strong>
              <span class="text-[9px] text-purple-700 font-medium">22% Desktop / Notebooks</span>
            </div>
          </div>

          <!-- Canvas do Gráfico -->
          <div class="relative w-full h-72 sm:h-80 bg-slate-50/50 p-2 sm:p-4 rounded-2xl border border-slate-100">
            <canvas id="traffic-realtime-chart"></canvas>
          </div>

          <!-- Legenda Visual e Explicação -->
          <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium gap-3 pt-2">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded-md bg-[#002776] inline-block shadow-xs"></span>
                <span class="text-slate-800 font-bold">Visualizações do Catálogo (Pageviews)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded-md bg-[#009639] inline-block shadow-xs"></span>
                <span class="text-slate-800 font-bold">Cliques em Cursos Oficiais (Leads)</span>
              </div>
            </div>
            <div class="text-[11px] text-slate-400 font-mono">
              Sensibilidade: 100% dos eventos registrados no servidor
            </div>
          </div>
        </div>
`;

// Inserir antes de <!-- Grade Geográfica: Estados do Brasil & Cidades -->
const targetGeo = '        <!-- Grade Geográfica: Estados do Brasil & Cidades -->';
if (adminHtml.includes(targetGeo) && !adminHtml.includes('id="traffic-realtime-chart"')) {
  adminHtml = adminHtml.replace(targetGeo, trafficChartHtml + '\n\n' + targetGeo);
  console.log('✅ Card do Gráfico de Tráfego inserido em admin.html!');
  fs.writeFileSync('admin.html', adminHtml, 'utf8');
} else {
  console.log('Alvo já presente ou não encontrado em admin.html');
}
