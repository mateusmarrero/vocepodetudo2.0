const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, '..', reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
  }
});

async function testPageWithCdp(url) {
  return new Promise((resolve) => {
    console.log(`\n========================================`);
    console.log(`Testing with CDP: ${url}`);
    console.log(`========================================`);

    const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
      '--headless=new',
      '--remote-debugging-port=9222',
      url
    ]);

    setTimeout(() => {
      http.get('http://127.0.0.1:9222/json', (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', async () => {
          try {
            const targets = JSON.parse(body);
            const pageTarget = targets.find(t => t.type === 'page');
            if (pageTarget && pageTarget.webSocketDebuggerUrl) {
              const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

              ws.onopen = () => {
                ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
                ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
                ws.send(JSON.stringify({ id: 3, method: 'Runtime.enable' }));
              };

              const errors = [];
              const logs = [];

              ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.method === 'Runtime.consoleAPICalled') {
                  const type = msg.params.type;
                  const args = msg.params.args.map(a => a.value || a.description).join(' ');
                  logs.push(`[${type}] ${args}`);
                  if (type === 'error') errors.push(args);
                }
                if (msg.method === 'Runtime.exceptionThrown') {
                  const exc = msg.params.exceptionDetails;
                  errors.push(`EXCEPTION: ${exc.text} ${exc.exception ? (exc.exception.description || exc.exception.value) : ''}`);
                }
              };

              setTimeout(() => {
                ws.close();
                edge.kill();
                console.log('Logs captured:', logs.length);
                console.log('Errors captured:', errors.length);
                if (errors.length > 0) {
                  errors.forEach(e => console.log('  🚨', e));
                } else {
                  console.log('  ✅ No errors detected!');
                }
                resolve({ logs, errors });
              }, 3000);
            } else {
              edge.kill();
              resolve({ logs: [], errors: ['No page target'] });
            }
          } catch (e) {
            edge.kill();
            resolve({ logs: [], errors: [e.message] });
          }
        });
      }).on('error', (e) => {
        edge.kill();
        resolve({ logs: [], errors: [e.message] });
      });
    }, 2000);
  });
}

server.listen(3344, async () => {
  console.log('Test server ready on port 3344');
  try {
    await testPageWithCdp('http://localhost:3344/index.html');
    await testPageWithCdp('http://localhost:3344/curriculo.html');
    await testPageWithCdp('http://localhost:3344/admin.html');
  } finally {
    server.close();
    process.exit(0);
  }
});
