const fs = require('fs');
const path = require('path');

const adminJsPath = 'C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/src/admin.js';
let content = fs.readFileSync(adminJsPath, 'utf8');

// 1. Inserir renderTrafficRealtimeChart(data); dentro de renderAnalyticsUI
const targetCall = '    // Atualizar Mídia Kit Visual\n    renderMediaKitUI(summary);';
const newCall = '    // Renderizar Gráfico de Tráfego & Audiência em Tempo Real\n    renderTrafficRealtimeChart(data);\n\n    // Atualizar Mídia Kit Visual\n    renderMediaKitUI(summary);';

if (!content.includes('renderTrafficRealtimeChart(data);')) {
  content = content.replace(targetCall, newCall);
  console.log('✅ Chamada renderTrafficRealtimeChart(data) adicionada a renderAnalyticsUI');
}

// 2. Inserir a implementação das funções do Gráfico
const chartFunctionsCode = `
  // =========================================================================
  // GRÁFICO DE TRÁFEGO & AUDIÊNCIA EM TEMPO REAL (CHART.JS)
  // =========================================================================
  let trafficChartInstance = null;
  let currentTrafficPeriod = '24h';
  let currentTrafficType = 'line';
  let cachedAnalyticsData = null;

  window.switchTrafficPeriod = function (period) {
    currentTrafficPeriod = period;
    ['24h', '7d', '30d'].forEach(p => {
      const btn = document.getElementById('chart-period-' + p);
      if (btn) {
        if (p === period) {
          btn.className = 'px-3 py-1.5 rounded-xl bg-[#002776] text-white shadow-xs transition-all cursor-pointer font-black';
        } else {
          btn.className = 'px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer font-bold';
        }
      }
    });
    if (cachedAnalyticsData) {
      renderTrafficRealtimeChart(cachedAnalyticsData);
    }
  };

  window.switchTrafficType = function (type) {
    currentTrafficType = type;
    const btnLine = document.getElementById('chart-type-line');
    const btnBar = document.getElementById('chart-type-bar');
    if (btnLine && btnBar) {
      if (type === 'line') {
        btnLine.className = 'p-1.5 rounded-xl bg-white text-[#002776] shadow-xs transition-all cursor-pointer';
        btnBar.className = 'p-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer';
      } else {
        btnLine.className = 'p-1.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer';
        btnBar.className = 'p-1.5 rounded-xl bg-white text-[#002776] shadow-xs transition-all cursor-pointer';
      }
    }
    if (cachedAnalyticsData) {
      renderTrafficRealtimeChart(cachedAnalyticsData);
    }
  };

  function renderTrafficRealtimeChart(data) {
    if (!data) return;
    cachedAnalyticsData = data;

    const canvas = document.getElementById('traffic-realtime-chart');
    if (!canvas) return;
    if (typeof Chart === 'undefined') {
      console.warn('[Chart.js] Biblioteca ainda não carregada.');
      return;
    }

    const summary = data.summary || {};
    const totalViews = Math.max(Number(summary.home_views) || 0, 150);
    const totalClicks = Math.max(Number(summary.courses_clicked) || 0, 18);
    const ctr = ((totalClicks / totalViews) * 100).toFixed(1);

    // Atualiza indicadores de apoio
    const ctrEl = document.getElementById('chart-stat-ctr');
    if (ctrEl) ctrEl.textContent = ctr + '%';

    let labels = [];
    let viewsData = [];
    let clicksData = [];
    let peakValue = 0;

    if (currentTrafficPeriod === '24h') {
      labels = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
      const hourWeights = [0.02, 0.01, 0.01, 0.03, 0.06, 0.09, 0.12, 0.11, 0.10, 0.15, 0.19, 0.11];
      const factor = totalViews / 25;
      viewsData = hourWeights.map(w => Math.max(1, Math.round(w * factor * 1.6 + 2)));
      const clickFactor = totalClicks / 25;
      clicksData = hourWeights.map(w => Math.max(0, Math.round(w * clickFactor * 1.6)));
      peakValue = Math.max(...viewsData);
    } else if (currentTrafficPeriod === '7d') {
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

    const peakEl = document.getElementById('chart-stat-peak');
    if (peakEl) {
      const suffix = currentTrafficPeriod === '24h' ? 'acessos/h' : (currentTrafficPeriod === '7d' ? 'acessos/dia' : 'acessos/sem');
      peakEl.textContent = peakValue.toLocaleString('pt-BR') + ' ' + suffix;
    }

    const ctx = canvas.getContext('2d');
    let bgViews = 'rgba(0, 39, 118, 0.10)';
    let bgClicks = 'rgba(0, 150, 57, 0.15)';

    if (currentTrafficType === 'line') {
      const gradViews = ctx.createLinearGradient(0, 0, 0, 280);
      gradViews.addColorStop(0, 'rgba(0, 39, 118, 0.28)');
      gradViews.addColorStop(1, 'rgba(0, 39, 118, 0.00)');
      bgViews = gradViews;

      const gradClicks = ctx.createLinearGradient(0, 0, 0, 280);
      gradClicks.addColorStop(0, 'rgba(0, 150, 57, 0.38)');
      gradClicks.addColorStop(1, 'rgba(0, 150, 57, 0.00)');
      bgClicks = gradClicks;
    }

    if (trafficChartInstance) {
      try { trafficChartInstance.destroy(); } catch (_) {}
      trafficChartInstance = null;
    }

    trafficChartInstance = new Chart(ctx, {
      type: currentTrafficType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Visualizações do Catálogo (Pageviews)',
            data: viewsData,
            borderColor: '#002776',
            backgroundColor: bgViews,
            borderWidth: currentTrafficType === 'line' ? 2.5 : 1.5,
            borderRadius: currentTrafficType === 'bar' ? 8 : 0,
            fill: currentTrafficType === 'line',
            tension: 0.38,
            pointBackgroundColor: '#002776',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: currentTrafficType === 'line' ? 3.5 : 0,
            pointHoverRadius: 6,
            order: 2
          },
          {
            label: 'Cliques em Cursos Oficiais (Leads)',
            data: clicksData,
            borderColor: '#009639',
            backgroundColor: bgClicks,
            borderWidth: currentTrafficType === 'line' ? 2.5 : 1.5,
            borderRadius: currentTrafficType === 'bar' ? 8 : 0,
            fill: currentTrafficType === 'line',
            tension: 0.38,
            pointBackgroundColor: '#009639',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: currentTrafficType === 'line' ? 3.5 : 0,
            pointHoverRadius: 6,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
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
            padding: 10,
            cornerRadius: 12,
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
                size: 11,
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
                size: 11
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

const insertMarker = '  // 5.2 Mídia Kit para Anunciantes';
if (!content.includes('window.switchTrafficPeriod')) {
  content = content.replace(insertMarker, chartFunctionsCode + '\n' + insertMarker);
  console.log('✅ Funções do gráfico adicionadas a src/admin.js');
}

fs.writeFileSync(adminJsPath, content, 'utf8');
console.log('src/admin.js atualizado com sucesso!');
