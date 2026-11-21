const fs = require('fs');

const indexHtml = fs.readFileSync('C:/Users/usuario/Downloads/VCPDTD ANTIGRAVITY/index.html', 'utf8');
const lines = indexHtml.split('\n');
lines.forEach((l, i) => {
  if (l.includes('</head>')) {
    console.log((i+1) + ': ' + l.trim());
    console.log(lines.slice(Math.max(0, i - 15), i + 2).join('\n'));
  }
});
