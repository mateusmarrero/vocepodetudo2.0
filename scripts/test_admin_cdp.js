const { spawn } = require('child_process');
const http = require('http');

async function testPage(url) {
  return new Promise((resolve) => {
    console.log(`Testing: ${url}`);
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
              const errors = [];
              const logs = [];

              ws.onopen = () => {
                ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
                ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
                ws.send(JSON.stringify({ id: 3, method: 'Runtime.enable' }));
              };

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
                console.log('Collected logs:', logs.length);
                logs.forEach(l => console.log('  ', l));
                console.log('Collected ERRORS:', errors.length);
                errors.forEach(e => console.log('  🚨', e));
                resolve();
              }, 3000);
            } else {
              edge.kill();
              resolve();
            }
          } catch (e) {
            edge.kill();
            resolve();
          }
        });
      }).on('error', (e) => {
        console.error('HTTP error:', e.message);
        edge.kill();
        resolve();
      });
    }, 3500);
  });
}

testPage('http://localhost:3333/admin.html');
