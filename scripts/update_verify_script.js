const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'scripts', 'verify_all_pages_cdp.js');
let js = fs.readFileSync(filePath, 'utf8');

const oldServerLogic = `  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {`;

const newServerLogic = `  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let targetPath = path.join(ROOT, reqPath);
  if (!fs.existsSync(targetPath) && fs.existsSync(targetPath + '.html')) {
    targetPath = targetPath + '.html';
  }
  const filePath = targetPath;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {`;

if (js.includes(oldServerLogic)) {
  js = js.replace(oldServerLogic, newServerLogic);
  console.log('✅ Servidor local atualizado para responder a URLs amigáveis sem .html');
}

// Atualizar pagesToTest para usar URLs amigáveis
const oldPages = `const pagesToTest = [
  '/',
  '/curriculo.html',
  '/calculadora-trabalhista.html',
  '/vagas.html',
  '/blog.html',
  '/admin.html'
];`;

const newPages = `const pagesToTest = [
  '/',
  '/curriculo',
  '/calculadora-trabalhista',
  '/vagas',
  '/blog',
  '/admin'
];`;

if (js.includes(oldPages)) {
  js = js.replace(oldPages, newPages);
  console.log('✅ Lista de páginas de teste atualizada para URLs amigáveis');
}

fs.writeFileSync(filePath, js, 'utf8');
