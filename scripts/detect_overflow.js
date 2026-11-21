const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, '..', reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : ext === '.js' ? 'text/javascript' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8089, async () => {
  console.log('Test server on 8089');
  
  // Launch Edge in mobile viewport (375x812) and desktop (1280x800)
  for (const vp of [{ name: 'Mobile 375px', w: 375, h: 812 }, { name: 'Desktop 1280px', w: 1280, h: 800 }]) {
    await testViewport(vp);
  }
  
  server.close();
  process.exit(0);
});

async function testViewport(vp) {
  return new Promise((resolve) => {
    console.log(`\nTesting ${vp.name}...`);
    const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
      '--headless=new',
      '--remote-debugging-port=9223',
      `--window-size=${vp.w},${vp.h}`,
      'http://127.0.0.1:8089/index.html'
    ]);

    setTimeout(() => {
      http.get('http://127.0.0.1:9223/json', (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          try {
            const targets = JSON.parse(body);
            const page = targets.find(t => t.type === 'page');
            if (!page) { edge.kill(); return resolve(); }

            const WebSocket = require('ws'); // wait, if ws is not available, we can use simple evaluation
          } catch(e) {}
          edge.kill();
          resolve();
        });
      });
    }, 2000);
  });
}
