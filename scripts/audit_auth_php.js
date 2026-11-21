const fs = require('fs');

const authPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/auth.php', 'utf8');
const lines = authPhp.split('\n');
lines.forEach((l, i) => {
  if (l.includes('pass') || l.includes('secret') || l.includes('hash')) {
    console.log((i+1) + ': [REDACTED SENSITIVE LINE]');
  } else {
    console.log((i+1) + ': ' + l.trim());
  }
});
