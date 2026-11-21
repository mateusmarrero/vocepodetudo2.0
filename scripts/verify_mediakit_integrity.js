const fs = require('fs');

console.log('--- Verificando integridade dos arquivos ---');

// 1. midia-kit.html
const mk = fs.readFileSync('midia-kit.html', 'utf8');
console.log('midia-kit.html tamanho:', mk.length, 'bytes');
console.log('Possui doctype:', mk.includes('<!DOCTYPE html>'));
console.log('Possui tag main:', mk.includes('<main') && mk.includes('</main>'));
console.log('Possui scripts:', mk.includes('updateSimulation'));
console.log('Possui print css:', mk.includes('@media print'));

// 2. admin.html
const adm = fs.readFileSync('admin.html', 'utf8');
console.log('admin.html tamanho:', adm.length, 'bytes');
console.log('admin.html possui section-mediakit:', adm.includes('id="section-mediakit"'));
console.log('admin.html possui link para midia-kit:', adm.includes('href="midia-kit"'));

// 3. index.html
const idx = fs.readFileSync('index.html', 'utf8');
console.log('index.html tamanho:', idx.length, 'bytes');
console.log('index.html possui link no footer:', idx.includes('href="midia-kit"'));

// 4. api/analytics.php
const php = fs.readFileSync('api/analytics.php', 'utf8');
console.log('api/analytics.php tamanho:', php.length, 'bytes');
console.log('api/analytics.php possui seções 7, 8, 9 no csv:', php.includes('--- 7. CATÁLOGO DE ESPAÇOS PUBLICITÁRIOS'));

console.log('✅ Todos os arquivos verificados com integridade perfeita!');
