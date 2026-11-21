const fs = require('fs');

const files = ['admin.html', 'index.html', 'src/admin.js', 'src/app.js'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    const hasChart = content.includes('chart.js') || content.includes('Chart(') || content.includes('Chart.');
    console.log(`${f}: hasChart=${hasChart}`);
  }
});
