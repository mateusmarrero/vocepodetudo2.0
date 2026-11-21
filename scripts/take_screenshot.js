const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--remote-debugging-port=9225',
  'https://www.vocepodetudo.com/'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9225/json', (res) => {
    let d = '';
    res.on('data', chunk => d += chunk);
    res.on('end', () => {
      const targets = JSON.parse(d);
      const target = targets.find(t => t.url.includes('vocepodetudo.com'));
      if (!target) {
        console.error('Target não encontrado');
        edge.kill();
        process.exit(1);
      }
      
      const ws = new WebSocket(target.webSocketDebuggerUrl);
      ws.on('open', () => {
        // Enviar Page.captureScreenshot
        ws.send(JSON.stringify({ id: 1, method: 'Page.captureScreenshot', params: { format: 'png' } }));
      });

      ws.on('message', (msg) => {
        const resp = JSON.parse(msg);
        if (resp.id === 1 && resp.result && resp.result.data) {
          const buffer = Buffer.from(resp.result.data, 'base64');
          fs.writeFileSync('scratch/live_screenshot_index.png', buffer);
          console.log('✅ Screenshot salvo em scratch/live_screenshot_index.png');
          ws.close();
          edge.kill();
          process.exit(0);
        }
      });
    });
  });
}, 4000);
