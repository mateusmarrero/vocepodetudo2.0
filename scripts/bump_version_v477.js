const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');

console.log('=== ATUALIZANDO VERSÃO PARA v4.77.0 COM EXPURGO DE CACHE ===');

// 1. Atualizar sw.js
const swPath = path.join(projectDir, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/vocepodetudo-pwa-v4\.\d+\.\d+/g, 'vocepodetudo-pwa-v4.77.0');
if (!sw.includes('/src/data/course_details.js')) {
  sw = sw.replace(
    "'/src/data/courses.js',",
    "'/src/data/courses.js',\n  '/src/data/course_details.js',"
  );
}
fs.writeFileSync(swPath, sw, 'utf8');
console.log('✅ sw.js atualizado para v4.77.0 com cache-purge e course_details.js no precache');

// 2. Atualizar src/app.js
const appPath = path.join(projectDir, 'src', 'app.js');
let app = fs.readFileSync(appPath, 'utf8');
app = app.replace(/sw\.js\?v=[0-9.]+/g, 'sw.js?v=4.77.0');
app = app.replace(/Service Worker v[0-9.]+ registrado com sucesso/g, 'Service Worker v4.77.0 registrado com sucesso');
fs.writeFileSync(appPath, app, 'utf8');
console.log('✅ src/app.js atualizado com registro do sw.js?v=4.77.0');

// 3. Atualizar src/curriculo.js
const currPath = path.join(projectDir, 'src', 'curriculo.js');
let curr = fs.readFileSync(currPath, 'utf8');
curr = curr.replace(/sw\.js\?v=[0-9.]+/g, 'sw.js?v=4.77.0');
fs.writeFileSync(currPath, curr, 'utf8');
console.log('✅ src/curriculo.js atualizado com sw.js?v=4.77.0');

// 4. Atualizar todos os arquivos HTML
const htmlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.html'));
let countHtml = 0;
htmlFiles.forEach(f => {
  const filePath = path.join(projectDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  if (content.includes('4.72.0')) {
    content = content.replace(/4\.72\.0/g, '4.77.0');
    modified = true;
  }
  if (content.includes('4.76.0')) {
    content = content.replace(/4\.76\.0/g, '4.77.0');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    countHtml++;
  }
});
console.log(`✅ ${countHtml} arquivos HTML atualizados com cache-busting v4.77.0`);

// 5. Atualizar manifest.json se existir versão
const manifestPath = path.join(projectDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (manifest.includes('4.72.0') || manifest.includes('4.76.0')) {
    manifest = manifest.replace(/4\.(72|76)\.0/g, '4.77.0');
    fs.writeFileSync(manifestPath, manifest, 'utf8');
    console.log('✅ manifest.json atualizado para v4.77.0');
  }
}

console.log('=== BUMP DE VERSÃO v4.77.0 CONCLUÍDO COM SUCESSO ===');
