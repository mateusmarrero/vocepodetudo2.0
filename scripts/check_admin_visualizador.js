const fs = require('fs');

const adminHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/admin.html', 'utf8');
const lines = adminHtml.split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('visualizador')) {
    // Redact any password if present
    const safe = l.replace(/(senha|password|pass)([:\s=]+)([\S]+)/gi, '$1$2[REDACTED]');
    console.log((i+1) + ': ' + safe.trim());
  }
});
