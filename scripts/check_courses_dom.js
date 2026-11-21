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
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9245',
    'http://127.0.0.1:8097/'
  ]);

  setTimeout(() => {
    http.get('http://127.0.0.1:9245/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const list = JSON.parse(data);
        const page = list.find(it => it.type === 'page');
        const ws = new WebSocket(page.webSocketDebuggerUrl);

        ws.onopen = () => {
          ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Runtime.evaluate',
              params: {
                expression: `JSON.stringify({
                  coursesGridExists: !!document.getElementById('courses-grid'),
                  coursesGridHTML: document.getElementById('courses-grid') ? document.getElementById('courses-grid').innerHTML.slice(0, 300) : 'NO GRID',
                  courseCardsCount: document.querySelectorAll('.course-card').length,
                  totalCoursesInState: (window.state && window.state.courses) ? window.state.courses.length : 'no state',
                  allCoursesConst: typeof ALL_COURSES !== 'undefined' ? ALL_COURSES.length : 'no ALL_COURSES'
                })`
              }
            }));
          }, 2000);
        };

        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === 2) {
            console.log('EVAL RESULT:', msg.result ? (msg.result.result ? msg.result.result.value : msg.result) : msg);
            edge.kill();
            server.close();
            process.exit(0);
          }
        };
      });
    });
  }, 2000);
});
