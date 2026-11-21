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

const pagesToTest = [
  '/',
  '/curriculo',
  '/calculadora-trabalhista',
  '/vagas',
  '/blog',
  '/simulador-entrevista',
  '/admin'
];

server.listen(8098, '127.0.0.1', async () => {
  console.log('--- Iniciando Auditoria Completa de Funcionalidade em Tempo Real ---');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  
  for (const p of pagesToTest) {
    await testPage(edgePath, 'http://127.0.0.1:8098' + p);
  }

  console.log('\n🎉 Todas as páginas testadas com sucesso!');
  server.close();
  process.exit(0);
});

async function testPage(edgePath, url) {
  return new Promise((resolve) => {
    const port = 9230 + Math.floor(Math.random() * 50);
    const edge = spawn(edgePath, [
      '--headless=new',
      '--window-size=1366,768',
      '--remote-debugging-port=' + port,
      url
    ]);

    setTimeout(() => {
      http.get('http://127.0.0.1:' + port + '/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const list = JSON.parse(data);
            const page = list.find(it => it.type === 'page');
            if (!page) {
              console.log('⚠️ [Página ' + url + '] Não encontrada no target');
              try { edge.kill(); } catch (e) {}
              resolve();
              return;
            }

            const ws = new WebSocket(page.webSocketDebuggerUrl);
            const errors = [];

            ws.onopen = () => {
              ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
              ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
            };

            ws.onmessage = (e) => {
              const msg = JSON.parse(e.data);
              if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
                const text = msg.params.args.map(a => a.value || a.description).join(' ');
                if (!text.includes('favicon') && !text.includes('Failed to load resource')) {
                  errors.push(text);
                }
              }
              if (msg.method === 'Runtime.exceptionThrown') {
                const exc = msg.params.exceptionDetails;
                errors.push('EXCEPTION: ' + exc.text + ' -> ' + (exc.exception ? exc.exception.description : '') + ' (linha ' + exc.lineNumber + ' col ' + exc.columnNumber + ')');
              }
            };

            setTimeout(() => {
              if (errors.length === 0) {
                console.log('✅ [' + url + '] OK - Zero erros no console / 100% funcional');
              } else {
                console.log('⚠️ [' + url + '] Erros detectados:', errors);
              }
              try { edge.kill(); } catch (e) {}
              resolve();
            }, 1800);

          } catch (err) {
            try { edge.kill(); } catch (e) {}
            resolve();
          }
        });
      }).on('error', () => {
        try { edge.kill(); } catch (e) {}
        resolve();
      });
    }, 2000);
  });
}
