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

server.listen(8099, '127.0.0.1', async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--window-size=1280,720',
    '--remote-debugging-port=9226',
    'http://127.0.0.1:8099/index.html'
  ]);

  setTimeout(() => {
    http.get('http://127.0.0.1:9226/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(p => p.type === 'page');
          const ws = new WebSocket(page.webSocketDebuggerUrl);
          
          ws.onopen = () => {
            ws.send(JSON.stringify({
              id: 1,
              method: 'Runtime.evaluate',
              params: {
                expression: `
                  (() => {
                    const header = document.querySelector('header');
                    // Remove overflow-hidden do header
                    header.classList.remove('overflow-hidden');
                    
                    const cursosBtn = document.getElementById('nav-dropdown-cursos-btn');
                    const carreiraBtn = document.getElementById('nav-dropdown-carreira-btn');
                    const userBtn = document.getElementById('nav-dropdown-user-btn');

                    const results = {};

                    // Testa Cursos
                    cursosBtn.click();
                    const cursosCascata = cursosBtn.closest('.nav-cascata');
                    const cursosMenu = cursosCascata.querySelector('.nav-cascata-menu');
                    results.cursos = {
                      isOpen: cursosCascata.classList.contains('is-open'),
                      display: window.getComputedStyle(cursosMenu).display,
                      rect: cursosMenu.getBoundingClientRect()
                    };

                    // Testa Carreira
                    carreiraBtn.click();
                    const carreiraCascata = carreiraBtn.closest('.nav-cascata');
                    const carreiraMenu = carreiraCascata.querySelector('.nav-cascata-menu');
                    results.carreira = {
                      isOpen: carreiraCascata.classList.contains('is-open'),
                      display: window.getComputedStyle(carreiraMenu).display,
                      rect: carreiraMenu.getBoundingClientRect()
                    };

                    // Testa Minha Área
                    userBtn.click();
                    const userCascata = userBtn.closest('.nav-cascata');
                    const userMenu = userCascata.querySelector('.nav-cascata-menu');
                    results.user = {
                      isOpen: userCascata.classList.contains('is-open'),
                      display: window.getComputedStyle(userMenu).display,
                      rect: userMenu.getBoundingClientRect()
                    };

                    // Verifica se há overflow horizontal da página
                    results.horizontalOverflow = {
                      windowWidth: window.innerWidth,
                      scrollWidth: document.documentElement.scrollWidth,
                      headerScrollWidth: header.scrollWidth,
                      headerClientWidth: header.clientWidth,
                      hasHScroll: document.documentElement.scrollWidth > window.innerWidth
                    };

                    return JSON.stringify(results, null, 2);
                  })()
                `,
                returnByValue: true
              }
            }));
          };

          ws.onmessage = (e) => {
            const res = JSON.parse(e.data);
            if (res.id === 1) {
              console.log('RESULTADO DO TESTE SEM OVERFLOW-HIDDEN:\n', JSON.parse(res.result.result.value));
              cleanup();
            }
          };

          function cleanup() {
            try { edge.kill(); } catch (e) {}
            try { server.close(); } catch (e) {}
            process.exit(0);
          }
        } catch (e) {
          console.error(e);
          try { edge.kill(); } catch (e) {}
          try { server.close(); } catch (e) {}
        }
      });
    });
  }, 3000);
});
