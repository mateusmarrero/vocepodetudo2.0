const fs = require('fs');

if (fs.existsSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/signing-key-info.txt')) {
  const content = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/signing-key-info.txt', 'utf8');
  console.log('signing-key-info.txt preview:');
  // Redact secrets
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    const safe = l.replace(/(pass|password|key|alias)([:\s=]+)([\S]+)/gi, '$1$2[REDACTED]');
    console.log((i+1) + ': ' + safe.trim());
  });
} else {
  console.log('signing-key-info.txt does not exist.');
}
