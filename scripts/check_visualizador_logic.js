const fs = require('fs');

const content = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/auth.php', 'utf8');
const lines = content.split('\n');
console.log('Lines 96-106 of auth.php:');
lines.slice(96, 106).forEach((l, i) => {
  const safe = l.replace(/(password_hash\s*\(\s*['"])([^'"]+)(['"])/g, '$1[REDACTED_PASSWORD]$3');
  console.log((i+97) + ': ' + safe.trim());
});
