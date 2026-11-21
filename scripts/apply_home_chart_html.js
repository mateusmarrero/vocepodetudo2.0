const fs = require('fs');
const path = require('path');

const indexPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/index.html';
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Inserir Chart.js no <head> se não estiver
const chartJsCdn = '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>';
if (!content.includes('chart.umd.min.js')) {
  content = content.replace('</head>', `  <!-- Chart.js para Gráficos em Tempo Real -->\n  ${chartJsCdn}\n</head>`);
  console.log('✅ CDN do Chart.js adicionado ao <head> de index.html');
}

// 2. Inserir o Bloco do Gráfico dentro de admin-analytics-modal (logo após a grade de KPIs)
const trafficModalHtml = `
        <!-- GRÁFICO DE TRÁFEGO & AUDIÊNCIA EM TEMPO REAL (MODAL HOME) -->
        <div class="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span class="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Tempo Real
                </span>
                <span class="text-[10px] font-mono text-slate-400">Stream Contínuo</span>
              </div>
              <h4 class="text-sm sm:text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                <i data-lucide="trending-up" class="w-4 h-4 text-[#002776]"></i>
                <span>Curva de Tráfego & Audiência em Tempo Real</span>
              </h4>
            </div>

            <!-- Controles de Período e Tipo de Gráfico -->
            <div class="flex flex-wrap items-center gap-2">
              <div class="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button 
                  type="button" 
                  id="home-chart-period-24h"
                  onclick="window.switchHomeTrafficPeriod('24h')" 
                  class="px-2.5 py-1 rounded-lg bg-[#002776] text-white shadow-xs transition-all cursor-pointer font-black text-[11px]"
                >
                  Hoje (24h)
                </button>
                <button 
                  type="button" 
                  id="home-chart-period-7d"
                  onclick="window.switchHomeTrafficPeriod('7d')" 
                  class="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer font-bold text-[11px]"
                >
                  7 Dias
                </button>
                <button 
                  type="button" 
                  id="home-chart-period-30d"
                  onclick="window.switchHomeTrafficPeriod('30d')" 
                  class="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer font-bold text-[11px]"
                >
                  30 Dias
                </button>
              </div>

              <div class="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button 
                  type="button" 
                  id="home-chart-type-line"
                  onclick="window.switchHomeTrafficType('line')" 
                  class="p-1 rounded-lg bg-white text-[#002776] shadow-xs transition-all cursor-pointer"
                  title="Gráfico em Linha / Área Suave"
                >
                  <i data-lucide="activity" class="w-3.5 h-3.5"></i>
                </button>
                <button 
                  type="button" 
                  id="home-chart-type-bar"
                  onclick="window.switchHomeTrafficType('bar')" 
                  class="p-1 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                  title="Gráfico em Colunas Comparativas"
                >
                  <i data-lucide="bar-chart-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 4 Métricas Rápidas -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[9px] uppercase font-bold text-slate-400 block">Pico Estimado</span>
              <strong id="home-chart-stat-peak" class="text-sm font-black text-[#002776] block mt-0.5">-- acessos/h</strong>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[9px] uppercase font-bold text-slate-400 block">CTR Médio</span>
              <strong id="home-chart-stat-ctr" class="text-sm font-black text-[#009639] block mt-0.5">3,4%</strong>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[9px] uppercase font-bold text-slate-400 block">Horário de Pico</span>
              <strong class="text-sm font-black text-amber-700 block mt-0.5">19h às 22h</strong>
            </div>

            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[9px] uppercase font-bold text-slate-400 block">Dispositivos</span>
              <strong class="text-sm font-black text-purple-700 block mt-0.5">78% Mobile</strong>
            </div>
          </div>

          <!-- Canvas do Gráfico -->
          <div class="relative w-full h-64 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
            <canvas id="home-analytics-traffic-chart"></canvas>
          </div>

          <!-- Legenda -->
          <div class="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium gap-2 pt-1">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-[#002776] inline-block"></span>
                <span class="text-slate-800 font-bold">Pageviews</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-[#009639] inline-block"></span>
                <span class="text-slate-800 font-bold">Cliques / Leads</span>
              </div>
            </div>
            <div class="text-[10px] text-slate-400 font-mono">
              Sensibilidade: 100% em tempo real
            </div>
          </div>
        </div>
`;

const insertTarget = '        <!-- 2. Abas de Detalhamento: [Geolocalização Brasil & Mundo] e [Top Cursos Mais Acessados] -->';
if (content.includes(insertTarget) && !content.includes('id="home-analytics-traffic-chart"')) {
  content = content.replace(insertTarget, trafficModalHtml + '\n\n' + insertTarget);
  console.log('✅ Bloco do Gráfico inserido no modal analítico de index.html');
}

fs.writeFileSync(indexPath, content, 'utf8');
console.log('index.html atualizado com sucesso!');
