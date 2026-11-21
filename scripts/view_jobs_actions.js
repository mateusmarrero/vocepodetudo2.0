const fs = require('fs');

const jobsPhp = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/api/jobs.php', 'utf8');
const lines = jobsPhp.split('\n');
lines.forEach((l, i) => {
  if (l.includes('case \'') || l.includes('$action ===')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
