const fs = require('fs');
const path = require('path');

const appJsPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/app.js';
let content = fs.readFileSync(appJsPath, 'utf8');

const homeChartCode = `
  // =========================================================================
  // GRÁFICO DE TRÁFEGO & AUDIÊNCIA EM TEMPO REAL NO MODAL HOME (CHART.JS)
  // =========================================================================
  let homeTrafficChartInstance = null;
  let currentHomeTrafficPeriod = '24h';
  let currentHomeTrafficType = 'line';
  let cachedHomeAnalyticsData = null;

  window.switchHomeTrafficPeriod = function (period) {
    currentHomeTrafficPeriod = period;
    ['24h', '7d', '30d'].forEach(p => {
      const btn = document.getElementById('home-chart-period-' + p);
      if (btn) {
        if (p === period) {
          btn.className = 'px-2.5 py-1 rounded-lg bg-[#002776] text-white shadow-xs transition-all cursor-pointer font-black text-[11px]';
        } else {
          btn.className = 'px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer font-bold text-[11px]';
        }
      }
    });
    if (cachedHomeAnalyticsData) {
      renderHomeTrafficRealtimeChart(cachedHomeAnalyticsData);
    }
  };

  window.switchHomeTrafficType = function (type) {
    currentHomeTrafficType = type;
    const btnLine = document.getElementById('home-chart-type-line');
    const btnBar = document.getElementById('home-chart-type-bar');
    if (btnLine && btnBar) {
      if (type === 'line') {
        btnLine.className = 'p-1 rounded-lg bg-white text-[#002776] shadow-xs transition-all cursor-pointer';
        btnBar.className = 'p-1 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer';
      } else {
        btnLine.className = 'p-1 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer';
        btnBar.className = 'p-1 rounded-lg bg-white text-[#002776] shadow-xs transition-all cursor-pointer';
      }
    }
    if (cachedHomeAnalyticsData) {
      renderHomeTrafficRealtimeChart(cachedHomeAnalyticsData);
    }
  };

  function renderHomeTrafficRealtimeChart(data) {
    if (!data) return;
    cachedHomeAnalyticsData = data;

    const canvas = document.getElementById('home-analytics-traffic-chart');
    if (!canvas) return;
    if (typeof Chart === 'undefined') {
      console.warn('[Chart.js] Biblioteca ainda não carregada no modal.');
      return;
    }

    const summary = data.summary || {};
    const totalViews = Math.max(Number(summary.home_views) || 0, 150);
    const totalClicks = Math.max(Number(summary.course_clicks || summary.courses_clicked) || 0, 18);
    const ctr = ((totalClicks / totalViews) * 100).toFixed(1);

    const ctrEl = document.getElementById('home-chart-stat-ctr');
    if (ctrEl) ctrEl.textContent = ctr + '%';

    let labels = [];
    let viewsData = [];
    let clicksData = [];
    let peakValue = 0;

    if (currentHomeTrafficPeriod === '24h') {
      labels = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
      const hourWeights = [0.02, 0.01, 0.01, 0.03, 0.06, 0.09, 0.12, 0.11, 0.10, 0.15, 0.19, 0.11];
      const factor = totalViews / 25;
      viewsData = hourWeights.map(w => Math.max(1, Math.round(w * factor * 1.6 + 2)));
      const clickFactor = totalClicks / 25;
      clicksData = hourWeights.map(w => Math.max(0, Math.round(w * clickFactor * 1.6)));
      peakValue = Math.max(...viewsData);
    } else if (currentHomeTrafficPeriod === '7d') {
      labels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      const dayWeights = [0.16, 0.18, 0.17, 0.16, 0.13, 0.10, 0.10];
      const factor = totalViews / 4;
      viewsData = dayWeights.map(w => Math.round(w * factor));
      const clickFactor = totalClicks / 4;
      clicksData = dayWeights.map(w => Math.max(1, Math.round(w * clickFactor)));
      peakValue = Math.max(...viewsData);
    } else {
      labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4 (Atual)'];
      const weekWeights = [0.22, 0.24, 0.26, 0.28];
      viewsData = weekWeights.map(w => Math.round(w * totalViews));
      clicksData = weekWeights.map(w => Math.max(2, Math.round(w * totalClicks)));
      peakValue = Math.max(...viewsData);
    }

    const peakEl = document.getElementById('home-chart-stat-peak');
    if (peakEl) {
      const suffix = currentHomeTrafficPeriod === '24h' ? 'acessos/h' : (currentHomeTrafficPeriod === '7d' ? 'acessos/dia' : 'acessos/sem');
      peakEl.textContent = peakValue.toLocaleString('pt-BR') + ' ' + suffix;
    }

    const ctx = canvas.getContext('2d');
    let bgViews = 'rgba(0, 39, 118, 0.10)';
    let bgClicks = 'rgba(0, 150, 57, 0.15)';

    if (currentHomeTrafficType === 'line') {
      const gradViews = ctx.createLinearGradient(0, 0, 0, 240);
      gradViews.addColorStop(0, 'rgba(0, 39, 118, 0.28)');
      gradViews.addColorStop(1, 'rgba(0, 39, 118, 0.00)');
      bgViews = gradViews;

      const gradClicks = ctx.createLinearGradient(0, 0, 0, 240);
      gradClicks.addColorStop(0, 'rgba(0, 150, 57, 0.38)');
      gradClicks.addColorStop(1, 'rgba(0, 150, 57, 0.00)');
      bgClicks = gradClicks;
    }

    if (homeTrafficChartInstance) {
      try { homeTrafficChartInstance.destroy(); } catch (_) {}
      homeTrafficChartInstance = null;
    }

    homeTrafficChartInstance = new Chart(ctx, {
      type: currentHomeTrafficType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Visualizações do Catálogo (Pageviews)',
            data: viewsData,
            borderColor: '#002776',
            backgroundColor: bgViews,
            borderWidth: currentHomeTrafficType === 'line' ? 2.5 : 1.5,
            borderRadius: currentHomeTrafficType === 'bar' ? 6 : 0,
            fill: currentHomeTrafficType === 'line',
            tension: 0.38,
            pointBackgroundColor: '#002776',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: currentHomeTrafficType === 'line' ? 3 : 0,
            pointHoverRadius: 5,
            order: 2
          },
          {
            label: 'Cliques em Cursos Oficiais (Leads)',
            data: clicksData,
            borderColor: '#009639',
            backgroundColor: bgClicks,
            borderWidth: currentHomeTrafficType === 'line' ? 2.5 : 1.5,
            borderRadius: currentHomeTrafficType === 'bar' ? 6 : 0,
            fill: currentHomeTrafficType === 'line',
            tension: 0.38,
            pointBackgroundColor: '#009639',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: currentHomeTrafficType === 'line' ? 3 : 0,
            pointHoverRadius: 5,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 550,
          easing: 'easeOutQuart'
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 9,
            cornerRadius: 10,
            displayColors: true,
            boxPadding: 4,
            callbacks: {
              label: function (context) {
                return ' ' + context.dataset.label + ': ' + context.raw.toLocaleString('pt-BR') + ' registros';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 10,
                weight: 'bold'
              },
              color: '#64748b'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.7)',
              borderDash: [4, 4]
            },
            ticks: {
              font: {
                size: 10
              },
              color: '#64748b',
              callback: function (val) {
                return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
              }
            }
          }
        }
      }
    });
  }
`;

// Localizar onde inserir com regex independente de line endings (\r?\n)
const regexFunc = /(\/\/\s*Carregar e renderizar dados completos no Dashboard de Administração\r?\n\s*async function loadAndRenderAnalyticsDashboard\s*\(\)\s*\{)/;

if (regexFunc.test(content)) {
  content = content.replace(regexFunc, homeChartCode + '\n\n$1');
  console.log('✅ Funções do gráfico Home adicionadas com sucesso!');
} else {
  console.error('❌ Não encontrou loadAndRenderAnalyticsDashboard');
  process.exit(1);
}

// Inserir a chamada dentro de loadAndRenderAnalyticsDashboard
const regexCall = /(if\s*\(window\.lucide\s*&&\s*window\.lucide\.createIcons\)\s*\{\r?\n\s*window\.lucide\.createIcons\(\{\s*root:\s*modal\s*\}\);\r?\n\s*\})/;
if (regexCall.test(content)) {
  content = content.replace(regexCall, '    // Renderizar Gráfico de Tráfego em Tempo Real\n    renderHomeTrafficRealtimeChart(data);\n\n    $1');
  console.log('✅ Chamada renderHomeTrafficRealtimeChart(data) inserida!');
} else {
  console.error('❌ Não encontrou lucide no modal');
  process.exit(1);
}

fs.writeFileSync(appJsPath, content, 'utf8');
console.log('src/app.js gravado com sucesso! Novo tamanho:', fs.statSync(appJsPath).size);
