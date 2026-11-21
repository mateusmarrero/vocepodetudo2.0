const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf-8');
const drawerStart = indexHtml.indexOf('<div id="mobile-nav-drawer"');
const drawerEnd = indexHtml.indexOf('</header>', drawerStart);
console.log('Drawer start line:', indexHtml.slice(0, drawerStart).split('\n').length);
console.log('Drawer end line:', indexHtml.slice(0, drawerEnd).split('\n').length);
console.log(indexHtml.slice(drawerStart, drawerStart + 1500));
