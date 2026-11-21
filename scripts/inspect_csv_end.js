const fs = require('fs');
const content = fs.readFileSync('api/analytics.php', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes("case 'mediakit_csv':"));
const end = lines.findIndex((l, i) => i > start && l.includes("exit;"));
console.log(`Início: ${start + 1}, Fim: ${end + 1}`);
console.log(lines.slice(end - 25, end + 5).join('\n'));
