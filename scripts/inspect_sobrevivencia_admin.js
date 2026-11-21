const fs = require('fs');

const adminPath = 'C:\\Users\\usuario\\Downloads\\ANTIGRAVITY\\sobrevivencia\\admin.html';
const content = fs.readFileSync(adminPath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('mediakit') || line.toLowerCase().includes('mídia kit') || line.toLowerCase().includes('proposta') || line.toLowerCase().includes('espaço')) {
    console.log(`L${idx + 1}: ${line.trim().slice(0, 150)}`);
  }
});
