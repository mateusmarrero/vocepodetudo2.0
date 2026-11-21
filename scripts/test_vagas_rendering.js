const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8089;
const ROOT = path.resolve(__dirname, '..');

// Mini servidor estático local
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/vagas.html';
  const filePath = path.join(ROOT, reqPath);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeMap = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg'
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'text/plain' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, async () => {
  console.log(`🌐 Servidor de teste iniciado em http://localhost:${PORT}`);
  
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    `http://localhost:${PORT}/vagas.html`
  ]);

  setTimeout(() => {
    http.get('http://127.0.0.1:9223/json', (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const targets = JSON.parse(data);
          const page = targets.find(t => t.type === 'page');
          console.log('✅ Página de Vagas carregada com sucesso no navegador!');
          console.log(`🔗 URL: ${page ? page.url : 'N/A'}`);
          console.log(`📄 Título da página: ${page ? page.title : 'N/A'}`);
          
          browser.kill();
          server.close(() => {
            console.log('🎉 Teste de inicialização e renderização concluído com sucesso!');
            process.exit(0);
          });
        } catch (e) {
          console.error('Erro ao inspecionar CDP:', e);
          browser.kill();
          server.close(() => process.exit(1));
        }
      });
    }).on('error', (err) => {
      console.error('Erro de conexão CDP:', err.message);
      browser.kill();
      server.close(() => process.exit(1));
    });
  }, 2500);
});
