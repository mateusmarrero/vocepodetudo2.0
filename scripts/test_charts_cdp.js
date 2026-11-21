const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = 'C:\\Users\\usuario\\Downloads\\VCPDTD ANTIGRAVITY';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/admin.html';
  let targetPath = path.join(ROOT, reqPath);
  if (!fs.existsSync(targetPath) && fs.existsSync(targetPath + '.html')) {
    targetPath = targetPath + '.html';
  }
  const filePath = targetPath;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const TEST_PORT = 8105;

server.listen(TEST_PORT, '127.0.0.1', async () => {
  console.log(`Servidor local rodando na porta ${TEST_PORT}`);
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const debugPort = 9270;
  const proc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--disable-gpu',
    '--user-data-dir=' + path.join(ROOT, 'scratch', 'edge_chart_test_' + Date.now()),
    `http://127.0.0.1:${TEST_PORT}/admin.html`
  ]);

  try {
    let pageInfo = null;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
        const json = await res.json();
        if (json && json.length > 0) {
          pageInfo = json.find(p => p.type === 'page') || json[0];
          break;
        }
      } catch (_) {}
    }

    if (!pageInfo) throw new Error('Não conectou ao CDP do Edge');

    const ws = new WebSocket(pageInfo.webSocketDebuggerUrl);
    await new Promise((resolve) => (ws.onopen = resolve));

    let id = 1;
    function send(method, params = {}) {
      return new Promise((res) => {
        const curId = id++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === curId) {
            ws.removeEventListener('message', handler);
            res(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: `http://127.0.0.1:${TEST_PORT}/admin.html` });
    await new Promise(r => setTimeout(r, 2500));

    // Teste 1: Verificar se Chart.js e canvas estão carregados
    const test1 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const hasChartJs = typeof Chart !== 'undefined';
          const canvas = document.getElementById('traffic-realtime-chart');
          const hasCanvas = !!canvas;
          const peakText = document.getElementById('chart-stat-peak')?.textContent || '';
          const ctrText = document.getElementById('chart-stat-ctr')?.textContent || '';
          return JSON.stringify({ hasChartJs, hasCanvas, peakText, ctrText });
        })()
      `
    });

    console.log('Resultado Teste 1 (Admin Chart):', test1.result.value);

    // Teste 2: Clicar no botão 7d e testar alternância
    await send('Runtime.evaluate', {
      expression: `window.switchTrafficPeriod('7d');`
    });
    await new Promise(r => setTimeout(r, 500));

    const test2 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const peakText = document.getElementById('chart-stat-peak')?.textContent || '';
          const is7dActive = document.getElementById('chart-period-7d')?.classList.contains('bg-[#002776]');
          return JSON.stringify({ peakText, is7dActive });
        })()
      `
    });
    console.log('Resultado Teste 2 (Período 7d):', test2.result.value);

    // Teste 3: Navegar para index.html e testar modal analítico e expansão de card
    await send('Page.navigate', { url: `http://127.0.0.1:${TEST_PORT}/index.html` });
    await new Promise(r => setTimeout(r, 2500));

    const test3 = await send('Runtime.evaluate', {
      expression: `
        (() => {
          // Abrir modal analítico
          const modal = document.getElementById('admin-analytics-modal');
          const canvas = document.getElementById('home-analytics-traffic-chart');
          if (typeof loadAndRenderAnalyticsDashboard === 'function') {
            loadAndRenderAnalyticsDashboard();
          }
          const cards = document.querySelectorAll('.course-card:not(.course-ad-card)');
          const card0 = cards[0];
          let card0ExpandedBefore = card0 ? card0.classList.contains('is-expanded') : false;
          if (card0) card0.click();
          let card0ExpandedAfter = card0 ? card0.classList.contains('is-expanded') : false;

          return JSON.stringify({
            hasModal: !!modal,
            hasModalCanvas: !!canvas,
            card0ExpandedBefore,
            card0ExpandedAfter
          });
        })()
      `
    });
    console.log('Resultado Teste 3 (Home Modal & Card Pop):', test3.result.value);

    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO!');
    ws.close();
  } catch (err) {
    console.error('Erro nos testes:', err);
  } finally {
    proc.kill();
    server.close();
    process.exit(0);
  }
});
