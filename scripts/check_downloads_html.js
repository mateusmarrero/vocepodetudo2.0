const fs = require('fs');
const content = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/downloads.html', 'utf8');

const regex = /href=["']([^"']+\.(?:pdf|docx?|zip|xlsx?|apk))["']/gi;
let m;
const files = [];
while ((m = regex.exec(content)) !== null) {
  files.push(m[1]);
}
console.log('Direct file links in downloads.html:', files);
console.log('Has triggerDownload function:', content.includes('function triggerDownload') || content.includes('triggerDownload'));
