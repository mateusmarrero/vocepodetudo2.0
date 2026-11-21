const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
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

const TEST_PORT = 8101;

server.listen(TEST_PORT, '127.0.0.1', async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const debugPort = 9260;
  const proc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--disable-gpu',
    '--user-data-dir=' + path.join(ROOT, 'scratch', 'edge_pop_test_' + Date.now()),
    `http://127.0.0.1:${TEST_PORT}/`
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

    if (!pageInfo) throw new Error('Não conectou ao CDP');

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
    await send('Page.navigate', { url: `http://127.0.0.1:${TEST_PORT}/` });
    await new Promise(r => setTimeout(r, 2000));

    // Teste A: Clicar no Card 0
    const testA = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = document.querySelectorAll('.course-card:not(.course-ad-card)');
          const card0 = cards[0];
          const card1 = cards[1];
          card0.querySelector('.toggle-course-details-btn').click();

          const card0Height = card0.getBoundingClientRect().height;
          const card1Height = card1.getBoundingClientRect().height;
          const card0Style = window.getComputedStyle(card0);
          
          return JSON.stringify({
            card0Expanded: card0.classList.contains('is-expanded'),
            card1Expanded: card1.classList.contains('is-expanded'),
            card0Height,
            card1Height,
            card1NotStretched: card1Height < card0Height,
            card0ZIndex: card0Style.zIndex,
            card0PopEffect: card0Style.transform !== 'none'
          });
        })()
      `,
      returnByValue: true
    });
    console.log('Resultado Teste A (Apenas Card 0 expande e salta):', JSON.parse(testA.result.value));

    // Teste B: Clicar no Card 1 -> Card 0 deve fechar automaticamente!
    const testB = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = document.querySelectorAll('.course-card:not(.course-ad-card)');
          const card0 = cards[0];
          const card1 = cards[1];
          card1.querySelector('.toggle-course-details-btn').click();

          return JSON.stringify({
            card0Closed: !card0.classList.contains('is-expanded'),
            card1Expanded: card1.classList.contains('is-expanded'),
            totalExpanded: document.querySelectorAll('.course-card.is-expanded').length
          });
        })()
      `,
      returnByValue: true
    });
    console.log('Resultado Teste B (Card 0 fecha ao abrir Card 1):', JSON.parse(testB.result.value));

    proc.kill();
    server.close();
    process.exit(0);
  } catch (e) {
    console.error('Erro:', e);
    proc.kill();
    server.close();
    process.exit(1);
  }
});
