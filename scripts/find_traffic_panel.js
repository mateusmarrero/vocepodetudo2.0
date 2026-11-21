const fs = require('fs');

const files = ['admin.html', 'index.html', 'src/admin.js', 'src/app.js', 'midia-kit.html'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const text = fs.readFileSync(f, 'utf8');
    const lines = text.split('\n');
    lines.forEach((l, idx) => {
      if (l.toLowerCase().includes('tráfego') || l.toLowerCase().includes('audiência em tempo real') || l.toLowerCase().includes('tempo real')) {
        console.log(`${f} L${idx + 1}: ${l.trim().slice(0, 140)}`);
      }
    });
  }
});
