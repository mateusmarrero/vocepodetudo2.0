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
  const filePath = path.join(ROOT, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8097, '127.0.0.1', async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  
  await checkDetailedError(edgePath, 'http://127.0.0.1:8097/');
  await checkDetailedError(edgePath, 'http://127.0.0.1:8097/vagas.html');

  server.close();
  process.exit(0);
});

async function checkDetailedError(edgePath, url) {
  return new Promise((resolve) => {
    const port = 9280 + Math.floor(Math.random() * 20);
    const edge = spawn(edgePath, [
      '--headless=new',
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
            const ws = new WebSocket(page.webSocketDebuggerUrl);

            ws.onopen = () => {
              ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
            };

            ws.onmessage = (e) => {
              const msg = JSON.parse(e.data);
              if (msg.method === 'Runtime.exceptionThrown') {
                const exc = msg.params.exceptionDetails;
                console.log(`\n❌ ERRO EM ${url}:`);
                console.log('Mensagem:', exc.text);
                console.log('Descrição:', exc.exception ? exc.exception.description : 'sem descrição');
                console.log('Linha:', exc.lineNumber, 'Coluna:', exc.columnNumber);
                console.log('URL da exceção:', exc.url);
              }
            };

            setTimeout(() => {
              try { edge.kill(); } catch (e) {}
              resolve();
            }, 2500);

          } catch (err) {
            try { edge.kill(); } catch (e) {}
            resolve();
          }
        });
      });
    }, 2000);
  });
}
