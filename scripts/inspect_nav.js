const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');

// Pegar a área do nav desktop
const navArea = indexHtml.match(/<nav class="hidden lg:flex[\s\S]*?<\/nav>/i);
if (navArea) {
  console.log('--- NAV DESKTOP ---');
  // Listar os botões/links de primeiro nível dentro da nav
  const firstLevel = navArea[0].match(/<(button|a)[^>]*id="nav-[^"]*"[^>]*>[\s\S]*?<\/(button|a)>/gi);
  console.log('Nav buttons ids:', navArea[0].match(/id="[^"]*"/g));
}

// Pegar menu mobile
const mobileDrawer = indexHtml.match(/<div id="mobile-menu-drawer"[\s\S]*?<\/div>\s*<\/div>/i) || indexHtml.match(/id="mobile-drawer"[\s\S]*?<\/div>/i);
console.log('--- MOBILE DRAWER FOUND: ---', !!mobileDrawer);
