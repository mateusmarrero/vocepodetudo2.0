const fs = require('fs');

const configPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/config.php', 'utf8');
const lines = configPhp.split('\n');
lines.forEach((l, i) => {
  // Omit password values
  if (l.includes('pass') || l.includes('secret') || l.includes('key')) {
    console.log((i+1) + ': [REDACTED SENSITIVE LINE]');
  } else {
    console.log((i+1) + ': ' + l.trim());
  }
});
